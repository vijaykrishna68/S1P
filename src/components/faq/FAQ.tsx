import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { Container } from '../ui/Container'
import { useScrollReveal } from '../ui/useScrollReveal'
import { FAQ_ITEMS } from './faqData'

/**
 * Height transition uses the grid-template-rows 0fr→1fr technique rather
 * than measuring scrollHeight in JS — animates to the content's natural
 * height with no layout thrashing (a documented layout-property exception).
 * Under reduced motion the global policy in styles/index.css makes it instant.
 * Closed panels are inert so their text isn't exposed while clipped.
 */
export function FAQ() {
  const { ref: headingRef, revealProps } = useScrollReveal<HTMLHeadingElement>()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="pad-tight">
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-16">
        <h2
          ref={headingRef}
          className={`font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl lg:self-start reveal-item ${revealProps.className}`}
        >
          Questions You Might Have
        </h2>

        <div className="divide-y divide-charcoal/10 border-y border-charcoal/10">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i
            const buttonId = `faq-button-${i}`
            const panelId = `faq-panel-${i}`

            return (
              <div key={item.question}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left
                      font-display text-base font-semibold text-charcoal transition-colors
                      duration-(--duration-base) ease-state hover:text-red md:py-6 md:text-lg"
                  >
                    {item.question}
                    <Plus
                      size={18}
                      weight="bold"
                      className={`shrink-0 text-charcoal-muted transition-transform duration-(--duration-base) ease-state ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="grid transition-[grid-template-rows] duration-(--duration-medium) ease-out-expo"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  {/* inert while closed: the clipped answer leaves the tab order
                      and the accessibility tree instead of being readable-but-
                      invisible. The text fades in just after the height starts
                      opening and out immediately on close. */}
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p
                      className={`pb-5 pr-10 leading-relaxed text-charcoal-muted transition-opacity ease-state md:pb-6 ${
                        isOpen
                          ? 'opacity-100 delay-75 duration-(--duration-base)'
                          : 'opacity-0 duration-(--duration-fast)'
                      }`}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
