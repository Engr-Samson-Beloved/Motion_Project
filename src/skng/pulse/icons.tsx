import React from "react";

/**
 * The product's own navigation icons, ported verbatim from
 * `components/navigation/bottom-nav.tsx`.
 *
 * Each one has a filled and a stroked form: filled when the tab is active,
 * stroked when it is not. That is the app's actual affordance, so reproducing
 * both states is what makes the mock read as the real thing rather than as an
 * illustration of it. Paths are copied exactly — do not redraw them.
 */

type IconProps = { filled?: boolean; size?: number; color?: string };

const base = (size: number, color: string) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  strokeWidth: 1.75,
  stroke: color,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export const HomeIcon: React.FC<IconProps> = ({
  filled,
  size = 26,
  color = "currentColor",
}) => (
  <svg {...base(size, color)}>
    {filled ? (
      <path
        fill={color}
        stroke="none"
        d="M11.03 2.59a1.5 1.5 0 0 1 1.94 0l7.5 6.363A1.5 1.5 0 0 1 21 10.097V19.5a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4h-4v4A1.5 1.5 0 0 1 8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-9.403c0-.44.194-.857.53-1.144l7.5-6.363Z"
      />
    ) : (
      <path d="M3 12 12 4l9 8M5 10v9a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-9" />
    )}
  </svg>
);

export const InboxIcon: React.FC<IconProps> = ({
  filled,
  size = 26,
  color = "currentColor",
}) => (
  <svg {...base(size, color)}>
    {filled ? (
      <>
        <path
          fill={color}
          stroke="none"
          d="M1.5 8.67v8.58A3 3 0 0 0 4.5 20.25h15a3 3 0 0 0 3-2.99V8.67L13.356 13.8a2.25 2.25 0 0 1-2.712 0L1.5 8.67Z"
        />
        <path
          fill={color}
          stroke="none"
          d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 6.29a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z"
        />
      </>
    ) : (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 7 10 7 10-7" />
      </>
    )}
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({
  filled,
  size = 26,
  color = "currentColor",
}) => (
  <svg {...base(size, color)}>
    {filled ? (
      <>
        <path
          fill={color}
          stroke="none"
          d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3Z"
        />
        <path
          fill={color}
          stroke="none"
          d="M8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3Z"
        />
        <path
          fill={color}
          stroke="none"
          d="M8 13c-2.793 0-5 1.567-5 3.5V18h10v-1.5c0-1.933-2.207-3.5-5-3.5Z"
        />
        <path
          fill={color}
          stroke="none"
          d="M16 13c-.88 0-1.71.174-2.44.483C14.41 14.28 15 15.34 15 16.5V18h6v-1.5c0-1.933-2.207-3.5-5-3.5Z"
        />
      </>
    ) : (
      <>
        <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3Z" />
        <path d="M8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Z" />
        <path d="M8 13c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
        <path d="M16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2c0-2.66-5.33-4-7-4Z" />
      </>
    )}
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({
  filled,
  size = 26,
  color = "currentColor",
}) => (
  <svg {...base(size, color)}>
    {filled ? (
      <path
        fill={color}
        stroke="none"
        d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z"
      />
    ) : (
      <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    )}
  </svg>
);

export const ProfileIcon: React.FC<IconProps> = ({
  filled,
  size = 26,
  color = "currentColor",
}) => (
  <svg {...base(size, color)}>
    {filled ? (
      <>
        <path
          fill={color}
          stroke="none"
          d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12Z"
        />
        <path
          fill={color}
          stroke="none"
          d="M20.4 21.6c0-4.641-3.759-8.4-8.4-8.4s-8.4 3.759-8.4 8.4h16.8Z"
        />
      </>
    ) : (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" />
      </>
    )}
  </svg>
);

/** A tick, for verification states. */
export const CheckIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = "currentColor",
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13l4 4L19 7"
      stroke={color}
      strokeWidth={3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The product's tab order. `Network` is the centre FAB rather than a normal
 * tab — in the app its grid cell is rendered empty and the button is absolutely
 * positioned above the bar.
 */
export type Tab = {
  label: string;
  Icon: React.FC<IconProps>;
  /** Network is the centre FAB, so its grid cell renders empty. */
  isFab?: boolean;
};

export const TABS: readonly Tab[] = [
  { label: "Feed", Icon: HomeIcon },
  { label: "Inbox", Icon: InboxIcon },
  { label: "Network", Icon: UsersIcon, isFab: true },
  { label: "Resources", Icon: BookIcon },
  { label: "Profile", Icon: ProfileIcon },
];
