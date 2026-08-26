/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

/**
 * Three.js will not draw under Chrome's default OpenGL renderer — a composition
 * containing a <ThreeCanvas> renders as an empty frame rather than failing, so
 * this is easy to lose an entire render pass to.
 *
 * Note this file does not apply to the Node.js render APIs. Those need
 * `chromiumOptions: {gl: "angle"}` passed explicitly.
 */
Config.setChromiumOpenGlRenderer("angle");
