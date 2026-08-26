import React from "react";
import { fitText } from "@remotion/layout-utils";
import { HEADING_FONT, HEADING_TRACKING } from "../../skng/brand";

/**
 * Type that sizes itself to the frame.
 *
 * Headline sizes across `src/skng` are hardcoded (`WordStack` defaults to 104px).
 * That is fine while the copy never changes, and breaks the moment anyone edits
 * a prop — at 1080 wide there is very little slack before a headline wraps into
 * the safe area or overruns the frame.
 *
 * `fitText` measures the string in the real font and returns the largest size
 * that fits the width given. Capping that with `Math.min` keeps short strings
 * from ballooning: the cap is the design size, and the fit is the safety net.
 */

export type FitHeadingProps = {
  text: string;
  /** Width the text must fit inside, in pixels. */
  withinWidth: number;
  /** Design size. Text never renders larger than this, only smaller. */
  maxFontSize?: number;
  /** Floor, so a very long string degrades into wrapping rather than into 8px type. */
  minFontSize?: number;
  fontFamily?: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  color?: string;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
};

export const useFittedFontSize = ({
  text,
  withinWidth,
  maxFontSize = 104,
  minFontSize = 28,
  fontFamily = HEADING_FONT,
  fontWeight = 900,
  letterSpacing = HEADING_TRACKING,
}: Omit<FitHeadingProps, "color" | "align" | "style">) =>
  React.useMemo(() => {
    const { fontSize } = fitText({
      text,
      withinWidth,
      fontFamily,
      fontWeight,
      letterSpacing,
    });
    return Math.max(minFontSize, Math.min(maxFontSize, fontSize));
  }, [text, withinWidth, fontFamily, fontWeight, letterSpacing, maxFontSize, minFontSize]);

export const FitHeading: React.FC<FitHeadingProps> = ({
  text,
  withinWidth,
  maxFontSize = 104,
  minFontSize = 28,
  fontFamily = HEADING_FONT,
  fontWeight = 900,
  letterSpacing = HEADING_TRACKING,
  color = "#ffffff",
  align = "center",
  style,
}) => {
  const fontSize = useFittedFontSize({
    text,
    withinWidth,
    maxFontSize,
    minFontSize,
    fontFamily,
    fontWeight,
    letterSpacing,
  });

  return (
    <div
      style={{
        width: withinWidth,
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight: 1.06,
        color,
        textAlign: align,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
