import { useState, FormEvent } from 'react';
import { Mail, Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please input both matching credentials fields.');
      return;
    }

    if (isRegisterMode && !name) {
      setErrorMsg('Please specify a profile display name.');
      return;
    }

    setLoading(true);

    // Dynamic mock token creation representing server jwt behavior
    setTimeout(() => {
      setLoading(false);
      const userObj: User = {
        id: `u-${Math.random().toString(36).substring(2, 9)}`,
        email: email,
        name: isRegisterMode ? name : (email.split('@')[0] || 'User'),
        joinedAt: new Date().toISOString(),
        token: `mock-jwt-token-val-${Date.now()}`
      };

      // Persist to localStorage
      localStorage.setItem('pricepulse_user', JSON.stringify(userObj));
      onLoginSuccess(userObj);
    }, 800);
  };

  return (
    <div id="auth-panel" className="max-w-md mx-auto py-16 px-4 text-slate-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 shadow-xl" id="auth-card">
        
        {/* Header Text */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white" id="auth-header-title">
            {isRegisterMode ? 'Construct Account' : 'Sign In'}
          </h2>
          <p className="text-xs text-slate-500 font-sans">
            {isRegisterMode 
              ? 'Gain access to tracking histories, target alerts, and recommendations.' 
              : 'Enter details below to synchronize your watchlist alerts.'
            }
          </p>
        </div>

        {/* Validation Fail Indicator */}
        {errorMsg && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-shake" id="auth-error-box">
            <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
            <p className="font-sans leading-normal">{errorMsg}</p>
          </div>
        )}

        {/* Form Action Sheets */}
        <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
          {isRegisterMode && (
            <div className="space-y-1.5" id="field-auth-name">
              <label className="text-xs font-medium text-slate-400">Display Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-slate-100 text-sm focus:outline-none transition-all font-sans"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5" id="field-auth-email">
            <label className="text-xs font-medium text-slate-400">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="developer@recruiters.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-slate-100 text-sm focus:outline-none transition-all font-sans"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5" id="field-auth-password">
            <label className="text-xs font-medium text-slate-400">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl text-slate-100 text-sm focus:outline-none transition-all font-sans"
                required
              />
            </div>
          </div>

          <button
            id="btn-auth-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl text-sm transition-all focus:outline-none cursor-pointer flex items-center justify-center gap-2 "
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-transparent animate-spin" />
                <span>Simulating Secure Validation...</span>
              </>
            ) : (
              <span>{isRegisterMode ? 'Create Secure Account' : 'Authenticate Session'}</span>
            )}
          </button>
        </form>

        {/* State Toggle Section */}
        <div className="pt-2 text-center text-xs text-slate-500 font-sans" id="auth-toggle-context">
          <span>
            {isRegisterMode ? 'Already have an aggregate profiles?' : "First time auditing the platform?"}{' '}
          </span>
          <button
            id="btn-auth-toggle-view"
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg('');
            }}
            className="text-violet-400 hover:text-violet-300 font-medium cursor-pointer underline"
          >
            {isRegisterMode ? 'Sign In Instead' : 'Create Free Student Account'}
          </button>
        </div>

      </div>
    </div>
  );
}
