# Included AI setup

Studio now opens with **Included AI** selected. Visitors can generate and refine without pasting an API key. The browser sends its prompt and optional reference images to `/api/ai`; the server function forwards them to OpenRouter using `OPENROUTER_API_KEY`. Personal keys remain available as an optional provider choice.

## Local development

The local key extracted from `AI.txt.txt` is in the ignored root `.env.local`. Run `npm run web` or `npm run preview`. Vite serves `/api/ai` through a development-only server middleware. The key is never exposed as a `VITE_` variable and is not bundled into `dist/`.

## Vercel production

In the Vercel project for this repository, add these **server-side** environment variables:

| Name | Value |
| --- | --- |
| `OPENROUTER_API_KEY` | The credential from `AI.txt.txt` |
| `OPENROUTER_MODEL` | `openai/gpt-4o` (optional; this is the default) |
| `PUBLIC_SITE_URL` | The production site URL (optional, for OpenRouter attribution) |

Apply the key to Production and Preview deployments as desired, then redeploy. `GET /api/ai` returns `{ "available": true }` after configuration. If unavailable, Studio disables Included AI and explains the setup state. Vercel's SPA rewrite excludes `/api/`, so the function is reachable rather than returning the frontend HTML.

Do not copy the credential into `web/`, `public/`, `vercel.json`, a `VITE_` variable, or committed source. `AI.txt.txt` and `.env.local` are ignored by Git.

## Public-usage limit

The endpoint limits request size, output tokens and requests per IP per function instance. That in-memory limit is **not** a global billing quota across Vercel instances. Before opening the app to broad public traffic, add a persistent per-account quota or platform rate limiting and set an OpenRouter spending limit. The current app has no login or account system; “Included AI” is available to anyone who can open Studio once the production key is configured.
