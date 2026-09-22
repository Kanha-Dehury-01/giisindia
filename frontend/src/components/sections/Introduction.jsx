import RevealOnScroll from '../motion/RevealOnScroll'
import Button from '../ui/Button'

export default function Introduction() {
  return (
    <section className="py-16 md:py-24">
      <div className="container grid gap-10 md:grid-cols-2 md:items-center">
        <RevealOnScroll>
          <p className="font-display text-sm font-semibold text-accent uppercase">About GIIS</p>
          <h2 className="mt-3 max-w-lg">The educational wing of Threatsys.</h2>
        </RevealOnScroll>
        <RevealOnScroll delay={0.1}>
          <p className="text-text-muted">
            [ADD GIIS INTRODUCTION COPY — mission, connection to the Threatsys ecosystem, and what makes GIIS's
            approach to cybersecurity education distinct.]
          </p>
          <Button to="/about" variant="ghost" className="mt-6">
            Read More
          </Button>
        </RevealOnScroll>
      </div>
    </section>
  )
}
