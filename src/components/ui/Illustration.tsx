import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

// Only the scenes the site uses are bundled (005, 007 and 012 are held back:
// no About people strip, no volunteering, no 404 page; see Docs/PHASE5).
const FILES = import.meta.glob<string>(
  '../../assets/illustrations/s1p/S1P-ILL-0{01,02,03,04,06,08,09,10,11}_*.webp',
  { eager: true, query: '?url', import: 'default' },
)

function url(id: string, density: '1x' | '2x') {
  const key = Object.keys(FILES).find(
    (path) => path.includes(`S1P-ILL-${id}_`) && path.endsWith(`@${density}.webp`),
  )
  if (!key) throw new Error(`Missing illustration S1P-ILL-${id}@${density}`)
  return FILES[key]
}

interface Scene {
  id: string
  /** Intrinsic size of the @1x file. */
  width: number
  height: number
  alt: string
  /** Square mobile composition, used below 900px. */
  mobile?: { id: string; width: number; height: number }
}

const SCENES = {
  'hero-shared-table': {
    id: '001',
    width: 720,
    height: 540,
    alt: 'Four people around a large pizza with one slice missing; one passes that slice to another while a child cheers.',
    mobile: { id: '002', width: 400, height: 400 },
  },
  'contribution-pass-it-on': {
    id: '003',
    width: 600,
    height: 420,
    alt: 'One person hands a wrapped parcel to another; a dotted arrow arcs between them.',
  },
  'impact-many-hands': {
    id: '004',
    width: 640,
    height: 427,
    alt: 'People build a staircase of colourful blocks while a plant grows from the top block.',
  },
  'set-aside-slice': {
    id: '006',
    width: 600,
    height: 450,
    alt: 'A person sets one slice of pizza aside on its own plate in front of an empty chair.',
  },
  'success-celebrate': {
    id: '008',
    width: 560,
    height: 448,
    alt: 'A person celebrating with both arms raised in front of a golden sun.',
  },
  'empty-plate': { id: '009', width: 260, height: 195, alt: '' },
  'error-try-again': { id: '010', width: 260, height: 195, alt: '' },
  'looking-closely': { id: '011', width: 260, height: 195, alt: '' },
} satisfies Record<string, Scene>

export type SceneName = keyof typeof SCENES

interface IllustrationProps {
  name: SceneName
  /** Overrides the scene's default alt text. */
  label?: string
  /** Empty alt: use when the copy beside the scene says everything. The
   * empty-state scenes are always decorative. */
  decorative?: boolean
  /** Eager, high-priority load: the homepage hero only. */
  priority?: boolean
  /** Cream plate behind the art. Pass `false` on light grounds; in dark theme
   * the plate always shows, because the art's dark lines vanish on dark grounds. */
  plate?: boolean
  /** `off` skips the one-time entrance. */
  animate?: 'auto' | 'off'
  className?: string
}

/**
 * One of the approved S1P scenes (docs/01-illustration.md), as a transparent
 * WebP on its cream plate.
 *
 * Entrance: the figure is fully visible by default (so it still shows if
 * JavaScript fails). When the effect arms it, it waits for 35% visibility, then
 * rises --motion-distance-md and fades in once over --motion-duration-entrance.
 * It never replays on scroll-back, and under reduced motion it is never armed.
 * The state lives in `data-illo` (see styles/index.css) rather than React
 * state, so arming does not re-render.
 */
export function Illustration({
  name,
  label,
  decorative = false,
  priority = false,
  plate = true,
  animate = 'auto',
  className = '',
}: IllustrationProps) {
  const scene: Scene = SCENES[name]
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const animated = animate === 'auto' && !reducedMotion

  useEffect(() => {
    const node = ref.current
    if (!node || !animated) return
    node.dataset.illo = 'armed'
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        node.dataset.illo = 'in'
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => {
      observer.disconnect()
      delete node.dataset.illo
    }
  }, [animated])

  const alt = decorative || scene.alt === '' ? '' : (label ?? scene.alt)
  const imgProps = {
    src: url(scene.id, '1x'),
    srcSet: `${url(scene.id, '1x')} 1x, ${url(scene.id, '2x')} 2x`,
    width: scene.width,
    height: scene.height,
    alt,
    decoding: 'async' as const,
    loading: priority ? ('eager' as const) : ('lazy' as const),
    fetchPriority: priority ? ('high' as const) : undefined,
    className: 'block h-auto w-full',
  }

  return (
    <figure
      ref={ref}
      className={`illo m-0 overflow-hidden ${plate ? 'illo-plate' : 'illo-plate-dark'} ${className}`}
    >
      {scene.mobile ? (
        <picture>
          <source
            media="(max-width: 899px)"
            srcSet={`${url(scene.mobile.id, '1x')} 1x, ${url(scene.mobile.id, '2x')} 2x`}
            width={scene.mobile.width}
            height={scene.mobile.height}
          />
          <img {...imgProps} />
        </picture>
      ) : (
        <img {...imgProps} />
      )}
    </figure>
  )
}
