import RevealOnScroll from '../motion/RevealOnScroll'
import Button from '../ui/Button'

export default function FinalCta() {
  return (
    <section className="bg-bg-inverse py-16 text-center text-text-inverse md:py-24">
      <div className="container">
        <RevealOnScroll>
          <h2 className="mx-auto max-w-2xl text-text-inverse">Ready to build your cybersecurity career?</h2>
          <p className="mx-auto mt-4 max-w-xl text-text-inverse-muted">
            Talk to a GIIS advisor about the right program for your goals.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button to="/enquire?source=final_cta" variant="primary">
              Enquire Now
            </Button>
            <Button to="/courses" variant="secondary">
              Explore Courses
            </Button>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
