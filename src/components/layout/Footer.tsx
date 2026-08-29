import { InstagramLogo, LinkedinLogo, XLogo } from '@phosphor-icons/react'
import { Container } from '../ui/Container'

const FOOTER_LINKS = [
  { label: 'About', href: '#mission' },
  { label: 'Impact', href: '#impact' },
  { label: 'Donate', href: '#donate' },
  { label: 'FAQ', href: '#faq' },
]

// Placeholder hrefs — no real social profiles exist yet. See CLAUDE.md.
const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', Icon: InstagramLogo },
  { label: 'X (Twitter)', href: '#', Icon: XLogo },
  { label: 'LinkedIn', href: '#', Icon: LinkedinLogo },
]

/**
 * Restrained by design — same type system and spacing rhythm as the rest of
 * the page, no separate footer "design system" of its own icons-in-circles
 * or extra decoration.
 */
export function Footer() {
  return (
    <footer className="border-t border-charcoal/10 py-14 md:py-16">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight text-charcoal">
              Sacrifice One Pizza
            </p>
            <p className="mt-2 text-sm text-charcoal-muted">
              Skip One Pizza. Feed a Future.
            </p>
            <p className="mt-6 font-display text-sm font-semibold text-charcoal">
              Make it your monthly ritual.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <nav aria-label="Footer">
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-charcoal-muted transition-colors duration-200 hover:text-charcoal"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-11 items-center justify-center rounded-full text-charcoal-muted
                    transition-colors duration-200 hover:bg-cream-soft hover:text-charcoal"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-charcoal/10 pt-6 text-xs text-charcoal-muted">
          All donations are voluntary. Transparency reports will be shared periodically.
        </p>
      </Container>
    </footer>
  )
}
