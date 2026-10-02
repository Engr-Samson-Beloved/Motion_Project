# Your world just got bigger

50 seconds, 1080×1920, 30fps. Composition: `SkoolConnectWorldVertical`.

Designed as a native 9:16 acquisition film rather than a landscape crop. All scenes use custom React/SVG motion design: orbiting campus nodes, illustrated avatars, dimensional opportunity cards, conversations, community tiles, and an animated browser address. No captured screens are used. Cards and messages are illustrative rather than reproductions of the current interface.

Fifteen scenes, with additional half-second word changes and short impact transitions. Cuts land on the 120 BPM beat grid; typography enters with staggered springs, cards rotate in perspective, and the camera slowly pushes in. The palette alternates deep emerald and warm ivory with mint and muted gold accents. The website persists through the film and receives a six-second closing call to action.

`WorldVertical.tsx` contains the timing data and all visual components. `SkoolConnectWorldBoard` renders a fifteen-panel contact sheet. The custom music is reproducible with `node scripts/make-bed-world50.js`, using the repository’s deterministic synthesizer. No voice-over is included; all messaging is visible on screen.

```powershell
npx remotion render SkoolConnectWorldVertical out/skoolconnect-world-vertical-50s.mp4 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=3 --crf=20
npx remotion still SkoolConnectWorldBoard out/skoolconnect-world-board.png
```

The music asset `public/bed-world50.mp3` must accompany this composition when moving the source to another machine.
