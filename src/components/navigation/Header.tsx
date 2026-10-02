import { useEffect, useRef, useState } from 'react'
import { List, X } from '@phosphor-icons/react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'

// Root-relative so these resolve correctly from any page (Home, About,
// Gallery) — a bare "#impact" would only work while already on Home. "Why
// It Matters" (Mission's old nav label) is dropped in favor of "About" now
// that About covers that role more fully; Mission itself stays on the
// homepage unchanged. See Docs/PHASE1_IA_PROPOSAL.md §H.
const NAV_LINKS = [
  { label: 'About', href: '/about.html' },
  { label: 'Gallery', href: '/gallery.html' },
  { label: 'Impact', href: '/#impact' },
  { label: 'FAQ', href: '/#faq' },
]

function normalizePath(path: string) {
  return path.replace(/\.html$/, '').replace(/\/$/, '') || '/'
}

/** True for a link that points at the page being shown. In-page anchors
 * (`/#impact`) are never "current": they are sections, not pages. */
function isCurrentPage(href: string) {
  if (href.includes('#')) return false
  return normalizePath(href) === normalizePath(window.location.pathname)
}

/**
 * Sticky header. "Scrolled" surface state is driven by an IntersectionObserver
 * watching a 1px sentinel at the top of <main>, not a scroll listener — see
 * CLAUDE.md §7 (Performance Rules) and the design skill's ban on
 * `window.addEventListener('scroll')`.
 *
 * The mobile menu stays mounted and opens/closes with the same grid-rows
 * technique the FAQ uses (a documented layout-property exception), `inert`
 * while closed so its links leave the tab order and the accessibility tree.
 * It closes on Escape (focus returns to the toggle), on a click outside it,
 * and when a link is chosen.
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const menuPanelRef = useRef<HTMLDivElement>(null)

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

  // Closing via Escape while focus is inside the menu would otherwise leave
  // focus on a link that has just become inert; return it to the toggle.
  const closeMenu = () => {
    setIsMenuOpen(false)
    menuToggleRef.current?.focus()
  }

  useEffect(() => {
    if (!isMenuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }
    // A press anywhere outside the panel and its toggle closes the menu. No
    // focus move here: the user has deliberately gone elsewhere.
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (menuPanelRef.current?.contains(target)) return
      if (menuToggleRef.current?.contains(target)) return
      setIsMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isMenuOpen])

  const menuId = 'mobile-nav'

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-(--duration-medium) ease-state ${
        isScrolled
          ? 'border-b border-charcoal/10 bg-cream/90 backdrop-blur-[2px]'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <Container className="flex h-[4.5rem] items-center justify-between">
        <a
          href="/"
          className="font-display text-lg font-bold tracking-tight text-charcoal"
        >
          Sacrifice One Pizza
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const current = isCurrentPage(link.href)
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={current ? 'page' : undefined}
                className={`group relative py-1 font-display text-sm font-medium
                  transition-colors duration-(--duration-base) ease-state hover:text-charcoal ${
                    current ? 'text-charcoal' : 'text-charcoal-muted'
                  }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-red
                    transition-transform duration-(--duration-base) ease-state ${
                      current ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  aria-hidden="true"
                />
              </a>
            )
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/#donate">Donate One Pizza</Button>
        </div>

        <button
          ref={menuToggleRef}
          type="button"
          className="pressable flex size-11 items-center justify-center rounded-full text-charcoal
            hover:bg-cream-soft lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {/* The two icons crossfade in place instead of swapping abruptly. */}
          <span className="relative block size-[22px]" aria-hidden="true">
            <List
              size={22}
              className={`absolute inset-0 transition-opacity duration-(--duration-fast) ease-state ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <X
              size={22}
              className={`absolute inset-0 transition-opacity duration-(--duration-fast) ease-state ${
                isMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </span>
        </button>
      </Container>

      <div
        ref={menuPanelRef}
        className={`grid transition-[grid-template-rows] lg:hidden ${
          isMenuOpen
            ? 'grid-rows-[1fr] duration-(--duration-medium) ease-out-expo'
            : 'grid-rows-[0fr] duration-(--duration-fast) ease-exit'
        }`}
      >
        <nav
          id={menuId}
          aria-label="Mobile"
          inert={!isMenuOpen}
          className="overflow-hidden bg-cream"
        >
          <div
            className={`border-t border-charcoal/10 transition-[opacity,translate] ${
              isMenuOpen
                ? 'translate-y-0 opacity-100 duration-(--duration-medium) ease-out-expo'
                : 'opacity-0 duration-(--duration-fast) ease-exit motion-safe:-translate-y-2'
            }`}
          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrentPage(link.href) ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-3 py-3 font-display text-base font-medium text-charcoal
                    transition-colors duration-(--duration-base) ease-state hover:bg-cream-soft
                    aria-[current=page]:bg-cream-soft aria-[current=page]:shadow-[inset_2px_0_0_var(--color-red)]"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <Button
                  href="/#donate"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Donate One Pizza
                </Button>
              </div>
            </Container>
          </div>
        </nav>
      </div>
    </header>
  )
}
