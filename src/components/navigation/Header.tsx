import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/Icon'
import { Wordmark } from '../ui/Wordmark'
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
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-(--motion-duration-emphasized) ease-standard ${
        isScrolled
          ? 'border-b-2 border-line bg-canvas'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <Container className="flex h-[4.5rem] items-center justify-between">
        <Wordmark />

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => {
            const current = isCurrentPage(link.href)
            return (
              <a
                key={link.href}
                href={link.href}
                aria-current={current ? 'page' : undefined}
                className={`nav group relative flex min-h-11 items-center py-1 text-ink
                  transition-colors duration-(--motion-duration-micro) ease-standard`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-0 bottom-1.5 h-[3px] origin-left rounded-full
                    transition-transform duration-(--motion-duration-standard) ease-standard ${
                      current
                        ? 'scale-x-100 bg-action'
                        : 'scale-x-0 bg-highlight group-hover:scale-x-100'
                    }`}
                  aria-hidden="true"
                />
              </a>
            )
          })}
        </nav>

        <div className="hidden lg:block">
          <Button href="/#donate" size="sm">
            Donate One Pizza
          </Button>
        </div>

        <button
          ref={menuToggleRef}
          type="button"
          className="pressable flex size-11 items-center justify-center rounded-full text-ink
            hover:bg-surface lg:hidden"
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {/* The two icons crossfade in place instead of swapping abruptly. */}
          <span className="relative block size-6" aria-hidden="true">
            <Icon
              name="menu"
              size={24}
              className={`absolute inset-0 transition-opacity duration-(--motion-duration-micro) ease-standard ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <Icon
              name="close"
              size={24}
              className={`absolute inset-0 transition-opacity duration-(--motion-duration-micro) ease-standard ${
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
            ? 'grid-rows-[1fr] duration-(--motion-duration-emphasized) ease-emphasized'
            : 'grid-rows-[0fr] duration-(--motion-duration-micro) ease-exit'
        }`}
      >
        <nav
          id={menuId}
          aria-label="Mobile"
          inert={!isMenuOpen}
          className="overflow-hidden bg-canvas"
        >
          <div
            className={`border-t-2 border-line shadow-float transition-[opacity,translate] ${
              isMenuOpen
                ? 'translate-y-0 opacity-100 duration-(--motion-duration-emphasized) ease-emphasized'
                : 'opacity-0 duration-(--motion-duration-micro) ease-exit motion-safe:-translate-y-2'
            }`}
          >
            <Container className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  aria-current={isCurrentPage(link.href) ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                  className="min-h-12 rounded-chip px-3 py-3 font-text text-[19px] font-bold text-ink
                    transition-colors duration-(--motion-duration-micro) ease-standard hover:bg-surface
                    aria-[current=page]:bg-surface aria-[current=page]:shadow-[inset_3px_0_0_var(--color-action-primary)]"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2">
                <Button
                  href="/#donate"
                  size="lg"
                  fullWidth
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
