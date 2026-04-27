import { useState, type FormEvent } from 'react';
import { CircleDot, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { api, ApiError } from '@/lib/api';

type Mode = 'signin' | 'signup';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useStore((s) => s.login);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setConfirmPassword('');
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await api.login(email, password);
      } else {
        await api.signup(email, password);
      }
      await login({ email });
    } catch (err) {
      if (err instanceof ApiError) {
        if (mode === 'signin' && err.status === 401) {
          setError('Invalid email or password.');
        } else {
          setError(err.message || 'Request failed');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Request failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isSignup = mode === 'signup';

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="brand-mark" style={{ width: 40, height: 40, borderRadius: 12 }}>
              <CircleDot size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-lg font-semibold text-ink-900">Easy Call</div>
              <div className="text-xs text-ink-500">Multi-Account Dashboard</div>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-ink-900">
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isSignup
              ? 'Each account gets its own private RingCentral connections, numbers, and call history.'
              : 'Sign in to manage all of your RingCentral accounts in one place.'}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="field-label">Email</span>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block">
              <span className="field-label">Password</span>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? 'At least 8 characters' : '••••••••'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  minLength={isSignup ? 8 : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-500 hover:bg-ink-100"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {isSignup && (
              <label className="block">
                <span className="field-label">Confirm password</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </label>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting
                ? isSignup
                  ? 'Creating account…'
                  : 'Signing in…'
                : isSignup
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ink-500">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Easy Call?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Create account
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 lg:block">
        <div className="flex h-full flex-col justify-end p-12 text-white">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            Unlimited accounts · Unlimited numbers · 1 dashboard
          </div>
          <h2 className="text-3xl font-semibold leading-tight">
            Every line, every account, in a single browser tab.
          </h2>
          <p className="mt-3 max-w-md text-white/80">
            Receive incoming calls from any of your business numbers, see exactly which line
            was dialed, and place outbound calls from any of them — all over WebRTC, no desk
            phone needed.
          </p>
        </div>
      </div>
    </div>
  );
}
