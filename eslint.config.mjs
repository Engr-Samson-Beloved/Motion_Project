import { config } from "@remotion/eslint-config-flat";

/**
 * Remotion's config assumes everything it lints ends up inside a render pass,
 * which is true of `src/` and not of `web/`.
 *
 * Two of its rules are about that difference. `<Img>` exists so a render waits
 * for the image to decode before capturing the frame, and `staticFile()` exists
 * so an asset path survives bundling into a render. The gallery's chrome is an
 * ordinary web page: nothing screenshots it, a native `<img>` is correct there,
 * and a URL in `public/` is just a URL.
 *
 * Scoped off for `web/` only. Anything under `src/` keeps both rules, because
 * anything under `src/` really can end up in a frame.
 */
export default [
  ...config,
  {
    files: ["web/**/*.{ts,tsx}"],
    rules: {
      "@remotion/warn-native-media-tag": "off",
      "@remotion/no-string-assets": "off",
      // Remotion bans Math.random() because a value that changes between
      // frames tears a render. Nothing in web/ is inside a frame — the only
      // use is minting an id for a row in IndexedDB, where unpredictability
      // is the point.
      "@remotion/deterministic-randomness": "off",
    },
  },
];
