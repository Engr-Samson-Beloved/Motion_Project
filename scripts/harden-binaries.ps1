# Restore the infected build binaries, then stop them being re-infected.
#
#   powershell -ExecutionPolicy Bypass -File scripts\harden-binaries.ps1
#
# `restore-binaries.ps1` puts the real executables back, and that is enough to
# get through one command. It is not enough to get through a render: the file
# infector on this machine watches process launches and re-stubs the binary as
# it is invoked, so a restore immediately followed by `remotion render` loses
# the race about half the time. When it loses, esbuild is replaced by a
# 533,504-byte stub that exits 0 without doing anything, the bundle never
# builds, and the render hangs with an empty log while the stub burns CPU.
#
# Denying write access to the three files it targets stops that. Execute is a
# separate right, so the binaries still run; only overwriting them fails. Two
# renders that had failed this way went through immediately afterwards, and
# esbuild.exe kept its original timestamp across both.
#
# This is a workaround, not a cure. The cure is a Microsoft Defender Offline
# Scan: Windows Security -> Virus & threat protection -> Scan options.
# Real-time protection does not detect this one.
#
# To undo (before `npm install`, which needs to write these):
#   Get-ChildItem <file> | Set-ItemProperty -Name IsReadOnly -Value $false
#   icacls <file> /remove:d "*S-1-1-0"

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

& powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "restore-binaries.ps1")

$targets = @(
  "node_modules\@esbuild\win32-x64\esbuild.exe",
  "node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe",
  "node_modules\.remotion\chrome-headless-shell\win64\chrome-headless-shell-win64\chrome-headless-shell.exe"
)

Write-Host ""
Write-Host "denying write access so the infector cannot re-stub them..."

foreach ($rel in $targets) {
  $path = Join-Path $root $rel
  if (-not (Test-Path $path)) {
    Write-Host "  missing, skipped - $rel"
    continue
  }
  Set-ItemProperty -Path $path -Name IsReadOnly -Value $true
  # *S-1-1-0 is Everyone by SID rather than by name, so this works on a
  # non-English Windows too. WD/AD/WA are write-data, append-data and
  # write-attributes; execute and read are untouched.
  & icacls $path /deny "*S-1-1-0:(WD,AD,WA)" | Out-Null
  $size = (Get-Item $path).Length
  Write-Host ("  locked  {0,-28} {1:N0} bytes" -f (Split-Path $path -Leaf), $size)
}

Write-Host ""
Write-Host "Run this before a render. Undo it before npm install - see the header."
