import RevealOnScroll from '../motion/RevealOnScroll'
import AccordionItem from '../ui/Accordion'
import Button from '../ui/Button'
import { PLACEHOLDER_FAQS } from '../../data/faqsPlaceholder'

// FAQPage structured data is only emitted on /faq itself, where this exact
// visible Q&A list is the full content (docs/ARCHITECTURE.md §L) — the
// homepage subset here deliberately does NOT carry FAQPage JSON-LD, since
// it's a partial view of a larger list.
export default function FaqSection({ faqs = PLACEHOLDER_FAQS.slice(0, 5) }) {
  return (
    <section className="bg-surface-muted py-16 md:py-24">
      <div className="container max-w-3xl">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">FAQ</p>
          <h2 className="mt-3">Frequently Asked Questions</h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1} className="mt-8">
          <div>
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </RevealOnScroll>

        <div className="mt-8 text-center">
          <Button to="/faq" variant="ghost">
            View All FAQs
          </Button>
        </div>
      </div>
    </section>
  )
}
