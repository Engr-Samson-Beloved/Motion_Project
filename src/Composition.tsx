import { Composition } from "remotion";
import { TextMotion, TextMotionProps } from "./TextMotion";

export const MyComposition = () => {
  return (
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
  );
};
