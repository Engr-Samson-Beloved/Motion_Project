<#
.SYNOPSIS
  Restore Remotion's native binaries after the file infector replaces them.

.DESCRIPTION
  This machine has an active Windows file infector. It swaps an executable for
  a 533,504-byte stub and preserves the original next to it as `g<name>.exe`,
  hidden and system, plus a 0-byte `g<name>.ico`. Infected binaries hang rather
  than run, which shows up as a Remotion command that produces no output and
  burns no CPU — usually blamed on a slow bundle before anyone checks.

  Scope is deliberately this repo's `node_modules` only. Git for Windows'
  bash.exe is infected too and is left alone here on purpose.

  Re-infection happens during renders, not just installs, so run this before a
  long render and again if one stalls.

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\restore-binaries.ps1
  powershell -ExecutionPolicy Bypass -File scripts\restore-binaries.ps1 -ScanOnly
#>

[CmdletBinding()]
param(
  # Report what is infected without changing anything.
  [switch]$ScanOnly
)

$ErrorActionPreference = 'Stop'
$STUB_SIZE = 533504
$root = Join-Path (Split-Path -Parent $PSScriptRoot) 'node_modules'

if (-not (Test-Path $root)) {
  Write-Error "no node_modules at $root - run npm install first"
}

Write-Host "scanning $root for $STUB_SIZE-byte stubs and orphaned originals..." -ForegroundColor Cyan

$infected = @(
  Get-ChildItem $root -Recurse -Force -Include *.exe -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -eq $STUB_SIZE }
)

# The stub does not always survive. Seen in practice: ffmpeg.exe vanished
# outright, leaving only the hidden gffmpeg.exe next to it — which a
# stub-size scan reports as clean while every ffmpeg call fails with
# "not recognized as the name of a cmdlet". Treat a `g<name>.exe` whose
# `<name>.exe` is missing as an infection that needs the same restore.
$orphans = @(
  Get-ChildItem $root -Recurse -Force -Filter 'g*.exe' -ErrorAction SilentlyContinue |
    Where-Object {
      $_.Length -ne $STUB_SIZE -and
      -not (Test-Path -LiteralPath (Join-Path $_.DirectoryName $_.Name.Substring(1)))
    }
)

if (-not $infected -and -not $orphans) {
  Write-Host "clean - nothing to restore" -ForegroundColor Green
  exit 0
}

if ($infected) {
  Write-Host "found $($infected.Count) infected binaries" -ForegroundColor Yellow
  foreach ($f in $infected) { Write-Host "  $($f.FullName)" }
}
if ($orphans) {
  Write-Host "found $($orphans.Count) missing binaries with a preserved original" -ForegroundColor Yellow
  foreach ($f in $orphans) {
    Write-Host "  $(Join-Path $f.DirectoryName $f.Name.Substring(1)) (missing)"
  }
}

if ($ScanOnly) { exit 1 }

# A running stub keeps a lock on its own file, so the delete below fails with
# "access denied" until it is gone. Orphans from a killed render are the usual
# culprit and are safe to take out.
$names = $infected | ForEach-Object { [System.IO.Path]::GetFileNameWithoutExtension($_.Name) } | Select-Object -Unique
foreach ($n in $names) {
  Get-Process -Name $n -ErrorAction SilentlyContinue |
    Where-Object { $_.Path -and $_.Path.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) } |
    ForEach-Object {
      Write-Host "  stopping held process $n ($($_.Id))" -ForegroundColor DarkYellow
      Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
}
Start-Sleep -Seconds 2

$restored = 0
$failed = @()

# Both cases restore identically: put `g<name>.exe` back as `<name>.exe`. The
# only difference is whether there is a stub sitting in the way first.
$targets = @()
$targets += $infected | ForEach-Object { $_.FullName }
$targets += $orphans | ForEach-Object { Join-Path $_.DirectoryName $_.Name.Substring(1) }

foreach ($target in $targets) {
  $dir = Split-Path -Parent $target
  $name = Split-Path -Leaf $target
  $orig = Join-Path $dir ("g" + $name)
  $ico = Join-Path $dir ("g" + [System.IO.Path]::GetFileNameWithoutExtension($name) + ".ico")

  if (-not (Test-Path -LiteralPath $orig)) {
    Write-Host "  NO PRESERVED ORIGINAL for $target" -ForegroundColor Red
    $failed += $target
    continue
  }

  try {
    if (Test-Path -LiteralPath $target) {
      # Clear attributes first: the infector's own copy is hidden+system, and a
      # previous restore may have left ReadOnly behind, either of which blocks
      # the replace.
      Set-ItemProperty -LiteralPath $target -Name Attributes -Value ([System.IO.FileAttributes]::Normal)
      Remove-Item -LiteralPath $target -Force
    }
    Move-Item -LiteralPath $orig -Destination $target -Force
    Set-ItemProperty -LiteralPath $target -Name Attributes -Value ([System.IO.FileAttributes]::Normal)
    if (Test-Path -LiteralPath $ico) { Remove-Item -LiteralPath $ico -Force }

    $size = (Get-Item -LiteralPath $target).Length
    Write-Host "  restored $name -> $size bytes" -ForegroundColor Green
    $restored++
  } catch {
    Write-Host "  FAILED ${target}: $($_.Exception.Message)" -ForegroundColor Red
    $failed += $target
  }
}

Write-Host ""
Write-Host "restored $restored of $($targets.Count)" -ForegroundColor Cyan

if ($failed.Count -gt 0) {
  Write-Host "still infected:" -ForegroundColor Red
  foreach ($p in $failed) { Write-Host "  $p" }
  Write-Host ""
  Write-Host "Without a preserved original the only fix is to reinstall that package." -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "The real fix is a Microsoft Defender Offline Scan:" -ForegroundColor Yellow
Write-Host "  Windows Security -> Virus & threat protection -> Scan options" -ForegroundColor Yellow
Write-Host "Real-time protection does not detect this one, so it will come back." -ForegroundColor Yellow
