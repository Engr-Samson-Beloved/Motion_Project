import { defineConfig } from "vite";

/**
 * The gallery app.
 *
 * Vite rather than Next.js on purpose: every part of this app is browser-only.
 * `@remotion/player` scrubs in the browser and `@remotion/web-renderer` encodes
 * in the browser, so there is nothing for a server to render and an SSR pass
 * would only be something to opt out of on every component. Vercel serves the
 * static build directly; a serverless function under `api/` can still be added
 * later for the bring-your-own-key proxy without changing any of this.
 *
 * No `@vitejs/plugin-react`. Its current release pulls a Babel 8 pre-release
 * through `@rolldown/plugin-babel` and will not resolve against this tree; the
 * only thing lost with it is React Fast Refresh, because esbuild already reads
 * `jsx: "react-jsx"` from tsconfig.json and compiles TSX with the automatic
 * runtime. Editing a composition is done in `remotion studio`, which has its
 * own hot reload — this app is chrome around that, and a full reload on save
 * is not worth a broken dependency tree.
 *
 * `publicDir` points at the repo's existing `public/`, which is also what
 * Remotion's `staticFile()` resolves against — with no `remotion_staticBase`
 * set, `staticFile("bed90.mp3")` returns `/bed90.mp3`, and that is exactly
 * where Vite serves it. The compositions therefore need no changes to run here.
 */
export default defineConfig({
  root: "web",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    // The app imports compositions from `src/`, which is outside `root`.
    fs: { allow: [".."] },
  },
});
