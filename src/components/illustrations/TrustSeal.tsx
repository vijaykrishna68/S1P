import src from '../../assets/illustrations/trust-seal.png'
import { DecorativeImage } from './DecorativeImage'

/**
 * Trust seal (Tier A, Phase 4C audit §8.2): "held together, not sealed shut".
 * Two broken rings around a red core, one green arc, no text or crest.
 * Supplied artwork (art/phase4c/preview/trust-seal@2x.png), made transparent
 * and trimmed to its ink; see CLAUDE.md. Decorative.
 */
export function TrustSeal({
  className = 'h-auto w-[10.5rem] lg:w-[11.5rem]',
}: {
  className?: string
}) {
  return <DecorativeImage src={src} width={723} height={648} className={className} />
}
