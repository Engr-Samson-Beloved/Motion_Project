import "./index.css";
import { Composition } from "remotion";
import { SkoolConnectFilm } from "./skng/SkoolConnectFilm";
import { SkoolConnectReel } from "./skng/reel/SkoolConnectReel";
import { LowerThird, LowerThirdProps } from "./LowerThird";
import { TextMotion, TextMotionProps } from "./TextMotion";
import { WelcomeScreen, WelcomeScreenProps } from "./WelcomeScreen";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
