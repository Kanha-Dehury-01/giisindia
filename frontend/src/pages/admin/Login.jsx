import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'
import { login } from '../../api/auth'
import { ApiError } from '../../api/client'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const onSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const user = await login(username, password)
      setUser(user)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-inverse px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-lg bg-surface p-8 shadow-lg">
        <h1 className="text-xl">GIIS Admin</h1>
        <p className="mt-1 text-sm text-text-muted">Sign in to manage the site.</p>

        <label htmlFor="username" className="mt-6 block text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2"
        />

        <label htmlFor="password" className="mt-4 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-md border border-border px-3 py-2"
        />

        {error && (
          <p role="alert" className="mt-4 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="mt-6 w-full">
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
