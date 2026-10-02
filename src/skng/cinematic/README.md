# The Next Move

30-second, 1920×1080, 30fps SkoolConnectNG acquisition film. Composition: `SkoolConnectNextMove`.

The visual idea is a connection becoming a direction: a dark emerald network opens into the product, then resolves to one clear destination. The website appears throughout and gets a six-second closing hold. Copy is designed to work with sound off; the existing original `bed30.mp3` supplies the musical build. There is no voice-over.

| Time | Moment |
| --- | --- |
| 0–5s | One connection. A whole new direction. |
| 5–11s | Beyond your campus. Closer to your next move. |
| 11–15s | Find your people — People screen |
| 15–19s | See what’s out there — Discover screen |
| 19–24s | Don’t just watch. Be part of it — Communities screen |
| 24–30s | Make your next move. skoolconnect.ng. Join the community. |

Uses the existing branded logo, self-hosted Montserrat and three captured product mockups in `public/screens/`. Captures include device frames and are animated directly.

Render from the project root:

```powershell
npx remotion render SkoolConnectNextMove out/skoolconnect-next-move-30s.mp4 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=3 --crf=20
```
