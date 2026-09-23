import { useCallback, useEffect, useState } from 'react'
import { me, logout as apiLogout } from './api'
import { LoginPage } from './LoginPage'
import { DashboardPage } from './DashboardPage'
import { SubmissionDetail } from './SubmissionDetail'

type AuthState =
  { status: 'checking' } | { status: 'loggedOut' } | { status: 'loggedIn'; email: string }
type View = { name: 'dashboard' } | { name: 'detail'; id: string }

/**
 * Owns auth-check state and which of the two admin screens (dashboard vs.
 * submission detail) is showing. No router: with exactly two internal views
 * and no deep-linking requirement, a plain useState is the whole mechanism
 * this needs — matching the project's existing "no dependency until a real
 * need appears" stance. See CLAUDE.md's admin-dashboard note for why the
 * separate `/admin.html` entry exists instead of a route inside the main app.
 */
export function AdminApp() {
  const [auth, setAuth] = useState<AuthState>({ status: 'checking' })
  const [view, setView] = useState<View>({ name: 'dashboard' })

  useEffect(() => {
    me()
      .then((data) => setAuth({ status: 'loggedIn', email: data.email }))
      .catch(() => setAuth({ status: 'loggedOut' }))
  }, [])

  const handleLogout = useCallback(async () => {
    await apiLogout().catch(() => {
      // Logging out client-side regardless of network failure: worst case
      // the server-side session outlives its cookie until it naturally
      // expires, which is not a reason to strand the admin on a broken page.
    })
    setAuth({ status: 'loggedOut' })
    setView({ name: 'dashboard' })
  }, [])

  if (auth.status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-charcoal-muted">Loading…</p>
      </div>
    )
  }

  if (auth.status === 'loggedOut') {
    return <LoginPage onSuccess={(email) => setAuth({ status: 'loggedIn', email })} />
  }

  if (view.name === 'detail') {
    return <SubmissionDetail id={view.id} onBack={() => setView({ name: 'dashboard' })} />
  }

  return (
    <DashboardPage
      email={auth.email}
      onLogout={handleLogout}
      onSelectDonation={(id) => setView({ name: 'detail', id })}
    />
  )
}
