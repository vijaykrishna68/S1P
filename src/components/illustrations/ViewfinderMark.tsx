import src from '../../assets/illustrations/gallery-viewfinder.png'
import { DecorativeImage } from './DecorativeImage'

/**
 * Gallery hero mark (Tier A, Phase 4C audit §8.3): a frame around a moment,
 * with an off-centre red core. Supplied artwork
 * (art/phase4c/preview/gallery-viewfinder@2x.png), made transparent and
 * trimmed to its ink; see CLAUDE.md. Decorative.
 */
export function ViewfinderMark({
  className = 'h-auto w-56 lg:w-64',
}: {
  className?: string
}) {
  return <DecorativeImage src={src} width={1285} height={676} className={className} />
}
