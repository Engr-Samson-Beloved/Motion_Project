# Why connection matters

60-second vertical social film, 1080×1920, 30fps. Remotion composition: `SkoolConnectWhyConnected`.

One spatial board contains twelve panels, arranged in four serpentine rows. The camera moves across the board rather than mounting successive full-screen slides. Lines link each panel to the next; the camera pulls back to reveal the complete journey at 48–54 seconds, then flies into the website invitation for the final six seconds.

The narrative follows potential → scattered information → missed discovery → limited circles → a connected solution → people → discovery → conversations → communities → the benefit → the whole system → joining at skoolconnect.ng. The film makes an argument for why a connected student platform matters, without claiming measured outcomes.

All panels share the same emerald wireframe design: rounded frames, thin strokes, consistent headers, typographic scale, diagram positions and footer. People, Discover and Communities start as illustrated wireframes, then wipe into cropped existing screenshots. Captures already contain devices, so their app regions are cropped without adding another phone shell. Illustrated messages and profiles are conceptual examples.

Timing is declared in `WHY_CHAPTERS`. `whyCamera` provides a continuous camera pose, including eased 36-frame travel at each boundary, slight widening during movement, subtle motion blur and the overview reveal. Render culling keeps distant panels out of the live viewport while preserving their world positions. `SkoolConnectWhyBoard` provides a twelve-stop contact sheet.

The music is a custom 60-second 120 BPM arrangement. Regenerate with `node scripts/make-bed-why60.js`. Copy the resulting `public/bed-why60.mp3`, product logo, and the People, Discover and Community screenshots alongside the source when moving the project. The on-screen story works without audio; no voice-over is included.

```powershell
npx remotion render SkoolConnectWhyConnected out/skoolconnect-why-connected-60s.mp4 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=3 --crf=20
npx remotion still SkoolConnectWhyBoard out/skoolconnect-why-board.png
```
