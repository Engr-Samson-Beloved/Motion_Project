import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FC, ReactNode } from "react";
import { Player, Thumbnail } from "@remotion/player";
import {
  COMPOSITIONS,
  KIND_LABEL,
  KIND_NOTE,
  componentProps,
  findComposition,
  type CompositionKind,
  type RegistryEntry,
} from "../src/registry";

/* ------------------------------------------------------------------ routing */

/**
 * Path routing, hand-rolled. Two routes do not justify a dependency, and every
 * package added here is another one to install on a machine the README already
 * documents as hostile to `npm install`.
 */
const useRoute = () => {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) {
      return;
    }
    window.history.pushState(null, "", to);
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);

  return { path, navigate };
};

/* --------------------------------------------------------------- formatting */

const formatDuration = (frames: number, fps: number) => {
  if (frames <= 1) {
    return "1 frame";
  }
  const total = frames / fps;
  if (total < 60) {
    return Number.isInteger(total) ? `${total}s` : `${total.toFixed(2)}s`;
  }
  const minutes = Math.floor(total / 60);
  const rest = Math.round(total - minutes * 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const formatAspect = (width: number, height: number) => {
  const d = gcd(width, height);
  return `${width / d}:${height / d}`;
};

const cliCommand = (c: RegistryEntry) =>
  c.durationInFrames === 1
    ? `npx remotion still ${c.id} out/${c.id}.png`
    : `npx remotion render ${c.id} out/${c.id}.mp4`;

/* ------------------------------------------------------------- lazy mounting */

/**
 * Twenty-one compositions mounted at once is a real cost — the contact sheets
 * alone each render a whole piece a dozen times over. Cards below the fold wait
 * until they are near the viewport; the text on every card is there from the
 * first paint either way, so nothing readable depends on this resolving.
 */
const useInView = <T extends Element>() => {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "700px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen]);

  return { ref, seen };
};

const RenderError: FC<{ error: Error }> = ({ error }) => (
  <div className="render-error">
    <span className="render-error-label">Did not render</span>
    <span className="render-error-message">{error.message}</span>
  </div>
);

/* --------------------------------------------------------------------- cards */

const Card: FC<{ entry: RegistryEntry; onOpen: (id: string) => void }> = ({
  entry,
  onOpen,
}) => {
  const { ref, seen } = useInView<HTMLAnchorElement>();

  return (
    <a
      ref={ref}
      className="card"
      href={`/c/${entry.id}`}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          return;
        }
        event.preventDefault();
        onOpen(entry.id);
      }}
    >
      <div
        className="card-media"
        style={{ aspectRatio: `${entry.width} / ${entry.height}` }}
      >
        {seen ? (
          <Thumbnail
            {...componentProps(entry)}
            inputProps={entry.defaultProps}
            durationInFrames={entry.durationInFrames}
            fps={entry.fps}
            compositionWidth={entry.width}
            compositionHeight={entry.height}
            frameToDisplay={entry.posterFrame}
            style={{ width: "100%", height: "100%" }}
            errorFallback={({ error }) => <RenderError error={error} />}
          />
        ) : (
          <div className="card-placeholder">{entry.id}</div>
        )}
        <span className="card-badge">
          {formatDuration(entry.durationInFrames, entry.fps)}
        </span>
      </div>

      <div className="card-text">
        <h3>{entry.title}</h3>
        <p>{entry.blurb}</p>
        <div className="card-meta">
          <span>{entry.id}</span>
          <span>
            {entry.width}&times;{entry.height}
          </span>
          {entry.caveat ? (
            <span className="flag">{entry.caveat.flag}</span>
          ) : null}
        </div>
      </div>
    </a>
  );
};

const KIND_ORDER: readonly CompositionKind[] = ["film", "social", "still", "lab"];

const Gallery: FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const grouped = useMemo(
    () =>
      KIND_ORDER.map((kind) => ({
        kind,
        items: COMPOSITIONS.filter((c) => c.kind === kind),
      })).filter((group) => group.items.length > 0),
    [],
  );

  const totalSeconds = useMemo(
    () =>
      COMPOSITIONS.filter((c) => c.durationInFrames > 1).reduce(
        (sum, c) => sum + c.durationInFrames / c.fps,
        0,
      ),
    [],
  );

  return (
    <>
      <header className="masthead">
        <div className="wordmark">
          <img src="/skng-logo.png" alt="" width="34" height="34" />
          <span>Motion Project</span>
        </div>
        <h1>Video, written as React components.</h1>
        <p className="standfirst">
          Every piece here is a function of one number — the frame — re-rendered
          once per frame and encoded into a video. Scrub any of them below; they
          are running live, not playing back a file.
        </p>
        <dl className="stats">
          <div>
            <dt>Compositions</dt>
            <dd>{COMPOSITIONS.length}</dd>
          </div>
          <div>
            <dt>Total runtime</dt>
            <dd>{Math.round(totalSeconds)}s</dd>
          </div>
          <div>
            <dt>Frame rate</dt>
            <dd>30 fps</dd>
          </div>
          <div>
            <dt>Dependencies at runtime</dt>
            <dd>0</dd>
          </div>
        </dl>
      </header>

      {grouped.map(({ kind, items }) => (
        <section key={kind} className="group" data-kind={kind}>
          <div className="group-head">
            <h2>{KIND_LABEL[kind]}</h2>
            <p>{KIND_NOTE[kind]}</p>
            <span className="group-count">{items.length}</span>
          </div>
          <div className="grid">
            {items.map((entry) => (
              <Card key={entry.id} entry={entry} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
};

/* -------------------------------------------------------------------- detail */

const CopyableCommand: FC<{ command: string }> = ({ command }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className="command"
      onClick={() => {
        navigator.clipboard
          ?.writeText(command)
          .then(() => setCopied(true))
          .catch(() => setCopied(false));
      }}
    >
      <code>{command}</code>
      <span className="command-hint">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
};

const Row: FC<{ label: string; children: ReactNode }> = ({
  label,
  children,
}) => (
  <div className="row">
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
);

const Detail: FC<{ entry: RegistryEntry; onBack: () => void }> = ({
  entry,
  onBack,
}) => {
  const isStill = entry.durationInFrames === 1;

  return (
    <>
      <a
        className="back"
        href="/"
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) {
            return;
          }
          event.preventDefault();
          onBack();
        }}
      >
        &larr; All compositions
      </a>

      <div className="detail">
        <div className="stage">
          {/*
            Cap by height, not width. A 9:16 piece given the full column is
            three screens tall; deriving the width cap from a height budget and
            the piece's own aspect keeps every composition on one screen
            whatever shape it is.
          */}
          <div
            className="stage-frame"
            style={{
              aspectRatio: `${entry.width} / ${entry.height}`,
              maxWidth: `calc(74vh * ${entry.width / entry.height})`,
            }}
          >
            {isStill ? (
              <Thumbnail
                {...componentProps(entry)}
                inputProps={entry.defaultProps}
                durationInFrames={entry.durationInFrames}
                fps={entry.fps}
                compositionWidth={entry.width}
                compositionHeight={entry.height}
                frameToDisplay={0}
                style={{ width: "100%", height: "100%" }}
                errorFallback={({ error }) => <RenderError error={error} />}
              />
            ) : (
              <Player
                {...componentProps(entry)}
                inputProps={entry.defaultProps}
                durationInFrames={entry.durationInFrames}
                fps={entry.fps}
                compositionWidth={entry.width}
                compositionHeight={entry.height}
                initialFrame={entry.posterFrame}
                controls
                loop
                clickToPlay
                doubleClickToFullscreen
                allowFullscreen
                style={{ width: "100%", height: "100%" }}
                errorFallback={({ error }) => <RenderError error={error} />}
              />
            )}
          </div>
        </div>

        <aside className="sidebar">
          <span className="kicker">{KIND_LABEL[entry.kind]}</span>
          <h1>{entry.title}</h1>
          <p className="blurb">{entry.blurb}</p>

          {entry.caveat ? (
            <div className="notice">
              <strong>This one does not render in an ordinary browser.</strong>{" "}
              {entry.caveat.detail}
            </div>
          ) : null}

          <dl className="spec">
            <Row label="Composition id">
              <code>{entry.id}</code>
            </Row>
            <Row label="Dimensions">
              {entry.width} &times; {entry.height}
            </Row>
            <Row label="Aspect">{formatAspect(entry.width, entry.height)}</Row>
            <Row label="Frames">{entry.durationInFrames}</Row>
            <Row label="Frame rate">{entry.fps} fps</Row>
            <Row label="Duration">
              {formatDuration(entry.durationInFrames, entry.fps)}
            </Row>
          </dl>

          <div className="cli">
            <span className="cli-label">Render it locally</span>
            <CopyableCommand command={cliCommand(entry)} />
          </div>
        </aside>
      </div>
    </>
  );
};

/* ----------------------------------------------------------------------- app */

export const App: FC = () => {
  const { path, navigate } = useRoute();

  const match = /^\/c\/([^/]+)\/?$/.exec(path);
  const entry = match ? findComposition(decodeURIComponent(match[1])) : undefined;

  useEffect(() => {
    document.title = entry
      ? `${entry.title} · Motion Project`
      : "Motion Project";
  }, [entry]);

  return (
    <div className="page">
      {entry ? (
        <Detail entry={entry} onBack={() => navigate("/")} />
      ) : (
        <Gallery onOpen={(id) => navigate(`/c/${id}`)} />
      )}

      <footer className="foot">
        <p>
          Built with Remotion. Every composition on this page is the same module
          the CLI renders — one registry in <code>src/registry.ts</code>, read by
          both.
        </p>
        <p className="foot-note">
          Playback runs under Remotion&rsquo;s licence terms; check whether your
          use needs a company licence before making this URL public.
        </p>
      </footer>
    </div>
  );
};
