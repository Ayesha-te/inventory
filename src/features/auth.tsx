import React, { useState } from 'react';
import logoImage from '../assets/logo.png';

interface AuthProps {
  mode: 'login' | 'signup';
  onAuthSuccess: (...args: any[]) => Promise<void>;
  showSignupOption?: () => void;
  showLoginOption?: () => void;
}

// Parse backend error string into field-level messages and a general message.
// The api layer formats errors like: "password: Too short | email: Already taken | Invalid credentials".
function parseBackendError(err: any): { general: string; fields: Record<string, string[]> } {
  const message = (err?.message || String(err) || '').trim();
  const result: { general: string; fields: Record<string, string[]> } = { general: '', fields: {} };
  if (!message) return result;

  // Split combined messages by ' | '
  const parts = message.split(' | ').map(p => p.trim()).filter(Boolean);
  const pushField = (key: string, msg: string) => {
    if (!result.fields[key]) result.fields[key] = [];
    if (msg && !result.fields[key].includes(msg)) result.fields[key].push(msg);
  };

  for (const part of parts) {
    // Try to detect "label: message"
    const idx = part.indexOf(':');
    let label = '';
    let msg = '';
    if (idx > -1) {
      label = part.substring(0, idx).trim().toLowerCase();
      msg = part.substring(idx + 1).trim();
    }

    // Map common backend labels to our field names
    const mapLabelToField = (l: string): string | null => {
      const normalized = l.replace(/\s+/g, ' ').trim();
      // Common variations
      const map: Record<string, string> = {
        'email': 'email',
        'password': 'password',
        'new password': 'password',
        'password1': 'password',
        'password2': 'confirmPassword',
        'password confirm': 'confirmPassword',
        'password confirmation': 'confirmPassword',
        'confirm password': 'confirmPassword',
        'first name': 'firstName',
        'last name': 'lastName',
        'supermarket name': 'supermarketName',
        'company name': 'supermarketName',
        'name': 'supermarketName', // sometimes returned for company/store
        'non field errors': 'general',
      };
      return map[normalized] || null;
    };

    if (label && msg) {
      const field = mapLabelToField(label);
      if (field && field !== 'general') {
        pushField(field, msg);
        continue;
      }
    }

    // Heuristic fallback: route common keywords to fields
    const low = part.toLowerCase();
    if (low.includes('password')) {
      if (low.includes('confirm')) pushField('confirmPassword', part);
      else pushField('password', part);
    } else if (low.includes('email')) {
      pushField('email', part);
    } else if (low.includes('supermarket')) {
      pushField('supermarketName', part);
    } else if (low.includes('first name')) {
      pushField('firstName', part);
    } else if (low.includes('last name')) {
      pushField('lastName', part);
    } else {
      // Otherwise, treat as general error
      result.general = result.general ? `${result.general} | ${part}` : part;
    }
  }

  return result;
}

const Auth: React.FC<AuthProps> = ({ mode, onAuthSuccess, showSignupOption, showLoginOption }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [supermarketName, setSupermarketName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState(''); // general/non-field error
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        // client-side quick checks
        if (password !== confirmPassword) {
          setFieldErrors({ confirmPassword: ['Passwords do not match'] });
          setIsLoading(false);
          return;
        }
        if (!supermarketName.trim()) {
          setFieldErrors({ supermarketName: ['Supermarket name is required'] });
          setIsLoading(false);
          return;
        }
        await onAuthSuccess(email, password, firstName, lastName, supermarketName, phone, address);
      } else {
        await onAuthSuccess(email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const parsed = parseBackendError(err);
      setFieldErrors(parsed.fields);
      setError(parsed.general || (!Object.keys(parsed.fields).length ? (err?.message || 'Authentication failed') : ''));
    } finally {
      setIsLoading(false);
    }
  };

  const showFieldError = (key: string) => fieldErrors[key]?.[0];

  return (
    <div className="max-w-md mx-auto">
      <div className="theme-bg-card border-t-8 border-[#B7F000] p-10 shadow-2xl">
        <div className="text-center mb-10">
          <img src={logoImage} alt="Stockive Logo" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h2 className="text-3xl font-black theme-text-primary uppercase tracking-tighter">
            {mode === 'login' ? 'Stockive Login' : 'Stockive Register'}
          </h2>
          <div className="h-1 w-20 bg-[#B7F000] mx-auto mt-2"></div>
          <p className="theme-text-muted mt-4 font-bold uppercase text-xs tracking-widest">
            {mode === 'login'
              ? 'Stockive Inventory Management'
              : 'Join the next generation of IMS'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900/10 border-l-4 border-red-600 text-red-700 p-4 mb-8 text-xs font-bold uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="form-label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  aria-invalid={!!showFieldError('firstName')}
                  className={`form-input ${showFieldError('firstName') ? 'border-red-600' : ''}`}
                  placeholder="John"
                />
                {showFieldError('firstName') && (
                  <p className="mt-1 text-[10px] text-red-600 font-bold uppercase">{showFieldError('firstName')}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="form-label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  aria-invalid={!!showFieldError('lastName')}
                  className={`form-input ${showFieldError('lastName') ? 'border-red-600' : ''}`}
                  placeholder="Doe"
                />
                {showFieldError('lastName') && (
                  <p className="mt-1 text-[10px] text-red-600 font-bold uppercase">{showFieldError('lastName')}</p>
                )}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="form-label">Corporate Email</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-invalid={!!showFieldError('email')}
              className={`form-input ${showFieldError('email') ? 'border-red-600' : ''}`}
              placeholder="admin@invanta.com"
            />
            {showFieldError('email') && (
              <p className="mt-1 text-[10px] text-red-600 font-bold uppercase">{showFieldError('email')}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="form-label">Secure Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-invalid={!!showFieldError('password')}
              className={`form-input ${showFieldError('password') ? 'border-red-600' : ''}`}
              placeholder="••••••••"
            />
            {showFieldError('password') && (
              <p className="mt-1 text-[10px] text-red-600 font-bold uppercase">{showFieldError('password')}</p>
            )}
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="form-label">Verify Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  aria-invalid={!!showFieldError('confirmPassword')}
                  className={`form-input ${showFieldError('confirmPassword') ? 'border-red-600' : ''}`}
                  placeholder="••••••••"
                />
                {showFieldError('confirmPassword') && (
                  <p className="mt-1 text-[10px] text-red-600 font-bold uppercase">{showFieldError('confirmPassword')}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="form-input"
                    placeholder="+123456789"
                  />
                </div>
                <div>
                  <label htmlFor="supermarketName" className="form-label">Store Name *</label>
                  <input
                    type="text"
                    id="supermarketName"
                    name="supermarketName"
                    required
                    value={supermarketName}
                    onChange={e => setSupermarketName(e.target.value)}
                    aria-invalid={!!showFieldError('supermarketName')}
                    className={`form-input ${showFieldError('supermarketName') ? 'border-red-600' : ''}`}
                    placeholder="Invanta Store"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="address" className="form-label">Location Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="form-input"
                  placeholder="Street, City, Country"
                  rows={2}
                ></textarea>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 text-lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-b-2 border-primary-dark mr-3"></div>
                Processing...
              </>
            ) : (
              mode === 'login' ? 'Establish Session' : 'Create Credentials'
            )}
          </button>
        </form>

        {/* Switch between login/signup */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          {mode === 'login' && showSignupOption && (
            <button type="button" className="text-[#B7F000] font-black uppercase text-xs tracking-widest hover:opacity-80 transition-opacity" onClick={showSignupOption}>
              Need Access? Request Registration
            </button>
          )}
          {mode === 'signup' && showLoginOption && (
            <button type="button" className="text-[#B7F000] font-black uppercase text-xs tracking-widest hover:opacity-80 transition-opacity" onClick={showLoginOption}>
              Existing User? Return to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;