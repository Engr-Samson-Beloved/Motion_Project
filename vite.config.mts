import { defineConfig, type Connect, type Plugin } from "vite";

/**
 * Lets the sandbox load its own code.
 *
 * `web/sandbox.html` runs in an iframe carrying `sandbox="allow-scripts"` and
 * deliberately not `allow-same-origin`, which puts it on an opaque origin —
 * that is the whole point, because it is what stops model-written code reaching
 * the composer's sessionStorage and the API key in it. The cost is that its own
 * module scripts are then a cross-origin fetch sending `Origin: null`, and a
 * plain static server answers those with no `Access-Control-Allow-Origin`, so
 * the frame silently loads nothing.
 *
 * These are public build artifacts, so serving them to any origin costs
 * nothing. Vercel gets the same header from `vercel.json`.
 */
const allowSandboxToFetchItsOwnCode = (): Plugin => {
  const middleware: Connect.NextHandleFunction = (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  };
  // Block bodies on purpose. `middlewares.use()` returns the Connect app, and
  // a value returned from these hooks is treated by Vite as a post-hook to
  // call later — which invokes the app with no request and throws.
  return {
    name: "sandbox-cors",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
};

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
  plugins: [allowSandboxToFetchItsOwnCode()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      /*
        Two entry points. `sandbox.html` is loaded into an opaque-origin iframe
        and is the only place model-written code is evaluated — it needs its own
        document, because the isolation comes from the frame's origin rather
        than from anything the script does.
      */
      // Resolved relative to `root`, which is `web/`.
      input: {
        index: "index.html",
        sandbox: "sandbox.html",
      },
    },
  },
  server: {
    // The app imports compositions from `src/`, which is outside `root`.
    fs: { allow: [".."] },
  },
});
