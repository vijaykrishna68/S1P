import { useState } from 'react'
import { Icon } from '../ui/Icon'
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
          className={`heading-1 lg:self-start reveal-item ${revealProps.className}`}
        >
          Questions You Might Have
        </h2>

        <div className="divide-y-2 divide-line border-y-2 border-line">
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
                    className="flex min-h-14 w-full items-center justify-between gap-6 py-5 text-left
                      font-display text-lg font-semibold text-ink transition-colors
                      duration-(--motion-duration-micro) ease-standard hover:text-ink-brand md:py-6"
                  >
                    {item.question}
                    {/* The plus turns into a gold x when open. */}
                    <span
                      aria-hidden="true"
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-line-ink
                        transition-[background-color,rotate] duration-(--motion-duration-standard) ease-spring ${
                          isOpen
                            ? 'rotate-45 bg-highlight text-crust'
                            : 'bg-elevated text-ink'
                        }`}
                    >
                      <Icon name="plus" size={16} />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="grid transition-[grid-template-rows] duration-(--motion-duration-emphasized) ease-emphasized"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  {/* inert while closed: the clipped answer leaves the tab order
                      and the accessibility tree instead of being readable-but-
                      invisible. The text fades in just after the height starts
                      opening and out immediately on close. */}
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p
                      className={`body pb-5 pr-10 text-ink-2 transition-opacity ease-standard md:pb-6 ${
                        isOpen
                          ? 'opacity-100 delay-75 duration-(--motion-duration-standard)'
                          : 'opacity-0 duration-(--motion-duration-micro)'
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
