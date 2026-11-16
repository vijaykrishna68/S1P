import { useState, type FormEvent } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { FormField, fieldControlClasses } from '../components/donation/FormField'
import { login, ApiError } from './api'

const inputClasses = fieldControlClasses

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
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="w-full max-w-sm space-y-6 rounded-card border-2 border-line bg-elevated p-8"
      >
        <h1 className="heading-2">Admin Sign In</h1>

        <FormField id="email" label="Email" requirement="Required">
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

        <FormField id="password" label="Password" requirement="Required">
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

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" busy={submitting} fullWidth>
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>
    </div>
  )
}
