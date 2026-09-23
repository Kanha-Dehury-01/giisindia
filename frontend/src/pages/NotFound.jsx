import Button from '../components/ui/Button'
import { useSeo } from '../hooks/useSeo'

export default function NotFound() {
  useSeo({ title: 'Page Not Found | GIIS India', robots: 'noindex,follow' })

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-sm font-semibold text-accent">404</p>
      <h1 className="mt-2">Page not found</h1>
      <p className="mt-3 max-w-md text-text-muted">
        The page you're looking for doesn't exist, or may have moved. Check the URL, or head back home.
      </p>
      <Button to="/" className="mt-6">
        Back to Home
      </Button>
    </div>
  )
}
