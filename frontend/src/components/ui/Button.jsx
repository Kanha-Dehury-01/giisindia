import { Link } from 'react-router-dom'

const VARIANTS = {
  primary: 'bg-accent text-[var(--button-primary-text)] hover:bg-[var(--button-primary-bg-hover)]',
  secondary: 'bg-transparent text-text-inverse border border-border-inverse hover:bg-white/10',
  ghost: 'bg-transparent text-primary hover:bg-surface-muted',
}

/**
 * Single button/link primitive used everywhere a CTA appears (spec §4:
 * "Explore Courses", "Enquire Now", "Talk to an Advisor", etc.) so hover/
 * focus/touch-target rules only need to be right in one place.
 * Renders a <Link> when `to` is given, a native <button> otherwise —
 * both share the same 44px min touch target (ui-ux-pro-max §2).
 */
export default function Button({ to, href, variant = 'primary', className = '', children, ...props }) {
  const classes = `inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-6 font-display text-sm font-semibold transition-colors duration-[var(--motion-duration-fast)] ${VARIANTS[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
