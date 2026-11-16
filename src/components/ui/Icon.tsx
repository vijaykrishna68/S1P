import type { ReactNode, SVGProps } from 'react'

/**
 * The S1P interface icon set: 24px grid, 2px stroke, round caps and joins,
 * outlined, drawn in currentColor. Shapes are taken from
 * design-system/assets/icons/*.svg. `copy`, `pause`, `play` and `spinner`
 * are not in that set; they are drawn here on the same grid and stroke.
 */
const SHAPES = {
  'alert-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.01" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M12 3.5L2.8 19.5h18.4z" />
      <path d="M12 10v4.5M12 17v.01" />
    </>
  ),
  'arrow-left': <path d="M19 12H5M11 6l-6 6 6 6" />,
  'arrow-right': <path d="M5 12h14M13 6l6 6-6 6" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  copy: (
    <>
      <rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2.5" />
      <path d="M15.5 8.5V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7.5a2 2 0 002 2h2.5" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9a2.8 2.8 0 00-4-4L4 16z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  external: (
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h4" />
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  give: (
    <>
      <path d="M3 15h3l4 3h5.5a1.5 1.5 0 000-3H12" />
      <path d="M6 15v5H3" />
      <path d="M14.5 15l4.5-2a1.6 1.6 0 012 2.3L15.5 20H10" />
      <path d="M15 4.5a2.3 2.3 0 013.6 2.8L15 11l-3.6-3.7A2.3 2.3 0 0115 4.5z" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.3 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z" />
  ),
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M21 16l-5-5-9 8.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" />
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3M12 14.5v2.5" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  minus: <path d="M5 12h14" />,
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  receipt: (
    <>
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  slice: (
    <>
      <path d="M12 3L20 18.5a14 14 0 01-16 0z" />
      <path d="M5.6 15.4a11 11 0 0012.8 0" />
      <circle cx="12" cy="11" r=".9" />
      <circle cx="10" cy="15" r=".9" />
      <circle cx="14" cy="14.5" r=".9" />
    </>
  ),
  /** A three-quarter ring; spin it with `animate-spin motion-pending`. */
  spinner: <path d="M12 3a9 9 0 109 9" />,
  trash: <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />,
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />,
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof SHAPES

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  /** 16, 20 or 24 (any number works). Default 20. */
  size?: number
  /** Only when the icon stands alone and means something; otherwise it is
   * hidden from assistive technology. */
  label?: string
}

export function Icon({ name, size = 20, label, className, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className ?? ''}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
      {...rest}
    >
      {SHAPES[name]}
    </svg>
  )
}
