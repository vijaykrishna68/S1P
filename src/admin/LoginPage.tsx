import { useState, type FormEvent } from 'react'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/donation/FormField'
import { login, ApiError } from './api'

const inputClasses =
  'w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-charcoal ' +
  'transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red/40'

interface LoginPageProps {
  onSuccess: (email: string) => void
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(undefined)
    try {
      const result = await login(email, password)
      onSuccess(result.email)
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-sm"
      >
        <h1 className="font-display text-2xl font-bold text-charcoal">Admin Sign In</h1>

        <FormField id="email" label="Email">
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClasses}
          />
        </FormField>

        <FormField id="password" label="Password">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses}
          />
        </FormField>

        {error && (
          <p role="alert" className="text-sm text-red-deep">
            {error}
          </p>
        )}

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
