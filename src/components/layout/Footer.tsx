import { Container } from '../ui/Container'
import { Wordmark } from '../ui/Wordmark'

// Root-relative for the same cross-page reason as Header's NAV_LINKS — see
// Docs/PHASE1_IA_PROPOSAL.md §H. "About" now points at the real About page
// instead of standing in for the homepage's Mission section.
const FOOTER_LINKS = [
  { label: 'About', href: '/about.html' },
  { label: 'Gallery', href: '/gallery.html' },
  { label: 'Impact', href: '/#impact' },
  { label: 'Donate', href: '/#donate' },
  { label: 'FAQ', href: '/#faq' },
]

export function Footer() {
  return (
    <footer className="s1-inverse bg-inverse py-14 text-ink-inverse md:py-16">
      <Container>
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Wordmark inverse />
            <p className="body-sm mt-2 text-ink-inverse/80">
              Skip One Pizza. Feed a Future.
            </p>
            <p className="mt-6 font-display text-base font-semibold">
              Make it your monthly ritual.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-1">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="nav inline-flex min-h-11 min-w-11 items-center underline-offset-4 hover:underline hover:decoration-highlight hover:decoration-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="caption mt-12 border-t-2 border-ink-inverse/20 pt-6 text-ink-inverse/80">
          All donations are voluntary.
        </p>
      </Container>
    </footer>
  )
}
