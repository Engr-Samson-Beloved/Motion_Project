import "./index.css";
import { Composition } from "remotion";
import { COMPOSITIONS, componentProps } from "./registry";

/**
 * Hands every registered composition to Remotion.
 *
 * The list itself lives in `registry.ts`, because the web app in `web/` needs
 * the same list and two hand-kept copies would drift. Add a piece there, not
 * here — it then appears in Studio, in the CLI and in the gallery at once.
 *
 * What each piece *is* is documented in README.md; what it is worth knowing
 * before editing one is documented in the piece's own directory.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {COMPOSITIONS.map((c) => (
        <Composition
          key={c.id}
          id={c.id}
          {...componentProps(c)}
          durationInFrames={c.durationInFrames}
          fps={c.fps}
          width={c.width}
          height={c.height}
          defaultProps={c.defaultProps}
        />
      ))}
    </>
  );
};
