import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';
import { btnPrimary, input, label, alertError } from '../../lib/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logoOk, setLogoOk] = useState(true);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (!location.state?.clearLogin) return;

    setEmail('');
    setPassword('');
    setError('');
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-700 to-sky-400 p-6">
      <div className="w-full max-w-md rounded-[1.25rem] bg-white p-10 shadow-xl shadow-blue-500/25">
        <div className="mb-6 flex items-center gap-3">
          {logoOk ? (
            <img
              src={logo}
              alt="ComplaintHub"
              className="h-11 w-11 rounded-xl bg-white object-contain p-1 shadow-sm"
              onError={() => setLogoOk(false)}
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              Q
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">ComplaintHub</h1>
            <p className="text-sm text-slate-500">Admin sign in</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
          {error && (
            <p className={alertError} role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className={label}>
              Email
            </label>
            <input
              id="email"
              name="login-email"
              type="email"
              required
              autoComplete="off"
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin123@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={label}>
              Password
            </label>
            <input
              id="password"
              name="login-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>

          <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
