import "./index.css";
import { Composition } from "remotion";
import { CinemaProbe } from "./CinemaProbe";
import {
  CHARACTER_SHEET_HEIGHT,
  CHARACTER_SHEET_WIDTH,
  CharacterSheet,
} from "./CharacterSheet";
import { CHARACTER_LAB_DURATION, CharacterLab } from "./CharacterLab";
import { SkoolConnectFilm } from "./skng/SkoolConnectFilm";
import { PULSE_DURATION, SkoolConnectPulse } from "./skng/pulse/SkoolConnectPulse";
import {
  STORYBOARD_HEIGHT,
  STORYBOARD_WIDTH,
  Storyboard,
} from "./skng/pulse/Storyboard";
import {
  STORY_DURATION,
  SkoolConnectStory,
} from "./skng/story/SkoolConnectStory";
import {
  STORYBOARD_HEIGHT as STORY_BOARD_HEIGHT,
  STORYBOARD_WIDTH as STORY_BOARD_WIDTH,
  Storyboard as StoryBoard,
} from "./skng/story/Storyboard";
import { SkoolConnectReel } from "./skng/reel/SkoolConnectReel";
import { LowerThird, LowerThirdProps } from "./LowerThird";
import { TextMotion, TextMotionProps } from "./TextMotion";
import { WelcomeScreen, WelcomeScreenProps } from "./WelcomeScreen";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/*
        The 90-second story film for awareness: problem, solution, vision.
        16:9, voice-over led, built to the supplied brief's timecodes.
      */}
      <Composition
        id="SkoolConnectStory"
        component={SkoolConnectStory}
        durationInFrames={STORY_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* The character rig moving: walk, blend, wave. See CharacterLab.tsx. */}
      <Composition
        id="CharacterLab"
        component={CharacterLab}
        durationInFrames={CHARACTER_LAB_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* Cycle check for the character rig. One still, see CharacterSheet.tsx. */}
      <Composition
        id="CharacterSheet"
        component={CharacterSheet}
        durationInFrames={1}
        fps={30}
        width={CHARACTER_SHEET_WIDTH}
        height={CHARACTER_SHEET_HEIGHT}
      />

      {/* Its contact sheet: three sampled frames per scene, one still. */}
      <Composition
        id="StoryBoard"
        component={StoryBoard}
        durationInFrames={1}
        fps={30}
        width={STORY_BOARD_WIDTH}
        height={STORY_BOARD_HEIGHT}
      />

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
