import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./styles.css";

const el = document.getElementById("root");
if (!el) {
  throw new Error("#root is missing from index.html");
}

/**
 * No StrictMode. It double-invokes render in development, and a page holding
 * twenty-one mounted compositions pays that twice — which turns a slow first
 * paint into a stalled one while telling us nothing we do not already get from
 * the CLI.
 */
createRoot(el).render(<App />);
