import { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { Container } from '../ui/Container'
import { useScrollReveal } from '../ui/useScrollReveal'
import { FAQ_ITEMS } from './faqData'

/**
 * Height transition uses the grid-template-rows 0fr→1fr technique rather
 * than measuring scrollHeight in JS — animates to the content's natural
 * height with no layout thrashing. motion-reduce:transition-none removes it
 * for reduced-motion users instead of just slowing it down.
 */
export function FAQ() {
  const { ref: headingRef, revealProps } = useScrollReveal<HTMLHeadingElement>()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 md:py-28 lg:py-32">
      <Container>
        <h2
          ref={headingRef}
          className={`font-display text-3xl font-bold tracking-tight text-charcoal md:text-4xl ${revealProps.className}`}
        >
          Questions You Might Have
        </h2>

        <div className="mt-10 divide-y divide-charcoal/10 border-y border-charcoal/10 md:mt-12">
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
                      duration-200 hover:text-red md:py-6 md:text-lg"
                  >
                    {item.question}
                    <Plus
                      size={18}
                      weight="bold"
                      className={`shrink-0 text-charcoal-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-10 leading-relaxed text-charcoal-muted md:pb-6">
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
