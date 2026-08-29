import { useEffect, useRef, useState } from 'react'
import { List, X } from '@phosphor-icons/react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'

const NAV_LINKS = [
  { label: 'Why It Matters', href: '#mission' },
  { label: 'Impact', href: '#impact' },
  { label: 'FAQ', href: '#faq' },
]

/**
 * Sticky header. "Scrolled" surface state is driven by an IntersectionObserver
 * watching a 1px sentinel at the top of <main>, not a scroll listener — see
 * CLAUDE.md §7 (Performance Rules) and the design skill's ban on
 * `window.addEventListener('scroll')`.
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const sentinel = document.getElementById('scroll-sentinel')
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Closing the menu removes its links from the DOM (conditional render
  // below); without this, focus resting on one of them would otherwise
  // silently reset to <body>, stranding keyboard and screen reader users.
  const closeMenu = () => {
    setIsMenuOpen(false)
    menuToggleRef.current?.focus()
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const menuId = 'mobile-nav'

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-300 ${
        isScrolled
          ? 'border-b border-charcoal/10 bg-cream/90 backdrop-blur-[2px]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <Container className="flex h-[4.5rem] items-center justify-between">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-charcoal"
        >
          Sacrifice One Pizza
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative py-1 font-display text-sm font-medium text-charcoal-muted
                transition-colors duration-200 hover:text-charcoal"
            >
              {link.label}
              <span
                className="absolute inset-x-0 -bottom-0.5 h-px scale-x-0 bg-red
                  transition-transform duration-200 ease-out group-hover:scale-x-100"
                aria-hidden="true"
              />
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="#donate">Donate One Pizza</Button>
        </div>

        <button
          ref={menuToggleRef}
          type="button"
          className="flex size-11 items-center justify-center rounded-full text-charcoal
            transition-colors duration-200 hover:bg-cream-soft lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={22} /> : <List size={22} />}
        </button>
      </Container>

      {isMenuOpen && (
        <nav
          id={menuId}
          aria-label="Mobile"
          className="border-t border-charcoal/10 bg-cream lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-3 font-display text-base font-medium text-charcoal
                  transition-colors duration-200 hover:bg-cream-soft"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2">
              <Button
                href="#donate"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                Donate One Pizza
              </Button>
            </div>
          </Container>
        </nav>
      )}
    </header>
  )
}
