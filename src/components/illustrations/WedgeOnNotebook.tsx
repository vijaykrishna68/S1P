import src from '../../assets/illustrations/closing-wedge-notebook.png'
import { DecorativeImage } from './DecorativeImage'

/**
 * Closing illustration (Tier B, Phase 4C audit §8.4), shared by About and
 * Gallery: a hand has just released a pizza wedge onto an open notebook.
 * Supplied artwork (art/phase4c/preview/closing-wedge-notebook@2x.png). It is
 * deliberately opaque: its figures are filled with the band colour so the red
 * and green blocks show only around them, and its background is snapped to the
 * ClosingBand's cream-soft (#FDEDE3) so no rectangle shows. Decorative.
 */
export function WedgeOnNotebook({
  className = 'h-auto w-80 lg:w-[25rem]',
}: {
  className?: string
}) {
  return <DecorativeImage src={src} width={1448} height={1086} className={className} />
}
