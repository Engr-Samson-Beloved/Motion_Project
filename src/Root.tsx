import "./index.css";
import { Composition } from "remotion";
import { CinemaProbe } from "./CinemaProbe";
import { SkoolConnectFilm } from "./skng/SkoolConnectFilm";
import { PULSE_DURATION, SkoolConnectPulse } from "./skng/pulse/SkoolConnectPulse";
import {
  STORYBOARD_HEIGHT,
  STORYBOARD_WIDTH,
  Storyboard,
} from "./skng/pulse/Storyboard";
import { SkoolConnectReel } from "./skng/reel/SkoolConnectReel";
import { LowerThird, LowerThirdProps } from "./LowerThird";
import { TextMotion, TextMotionProps } from "./TextMotion";
import { WelcomeScreen, WelcomeScreenProps } from "./WelcomeScreen";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        Single-frame contact sheet of every Pulse scene. Render it with
        `npx remotion still Storyboard out/storyboard.png` — seconds, not the
        twenty minutes a full pass costs.
      */}
      <Composition
        id="Storyboard"
        component={Storyboard}
        durationInFrames={1}
        fps={30}
        width={STORYBOARD_WIDTH}
        height={STORYBOARD_HEIGHT}
      />

      <Composition
        id="SkoolConnectPulse"
        component={SkoolConnectPulse}
        durationInFrames={PULSE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* A/B rig for the cinema toolkit. Not a deliverable - see CinemaProbe.tsx. */}
      <Composition
        id="CinemaProbe"
        component={CinemaProbe}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SkoolConnectReel"
        component={SkoolConnectReel}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SkoolConnectFilm"
        component={SkoolConnectFilm}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />

      <Composition
        id="WelcomeScreen"
        component={WelcomeScreen}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={
          {
            title: "Welcome",
            tagline: "Let's design some motion graphics",
            brand: "Motion Project",
          } satisfies WelcomeScreenProps
        }
      />

      <Composition
        id="LowerThird"
        component={LowerThird}
        durationInFrames={90}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={
          {
            name: "Samson Beloved",
            role: "Motion Design",
          } satisfies LowerThirdProps
        }
      />

      <Composition
        id="TextMotion"
        component={TextMotion}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={
          {
            title: "Motion in Four Seconds",
            subtitle: "Built with Remotion",
          } satisfies TextMotionProps
        }
      />
    </>
  );
};
