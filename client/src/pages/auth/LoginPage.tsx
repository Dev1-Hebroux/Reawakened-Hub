import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

const IS_DEV = import.meta.env.DEV;

export function LoginPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { login, loginWithReplit, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const params = new URLSearchParams(searchString);
  const redirectTo = params.get('redirect') || '/';
  
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setLocation(redirectTo);
    }
  }, [isAuthenticated, authLoading, setLocation, redirectTo]);
  
  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();
    
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    
    setIsSubmitting(true);
    const result = await login({ email, password });
    setIsSubmitting(false);
    
    if (result.success) {
      setLocation(redirectTo);
    } else {
      setError(result.error || 'Login failed');
    }
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a2744]" data-testid="login-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1a2744] to-[#19233b]">
      <header className="p-6">
        <Link href="/" className="text-2xl font-bold text-white font-display" data-testid="link-home">
          Reawakened
        </Link>
      </header>
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/10">
            <h1 className="text-2xl font-bold text-white mb-2 font-display" data-testid="text-page-title">
              Welcome back
            </h1>
            <p className="text-white/70 mb-8">
              Sign in to continue your spiritual journey
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm" data-testid="text-error">
                {error}
              </div>
            )}
            
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border bg-white/5 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="you@example.com"
                  data-testid="input-email"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-white/80">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-blue-300 hover:text-blue-200" data-testid="link-forgot-password">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border bg-white/5 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="••••••••"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
                data-testid="button-submit"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            
            {IS_DEV && (
              <>
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 border-t border-white/20" />
                  <span className="text-xs text-white/40">dev only</span>
                  <div className="flex-1 border-t border-white/20" />
                </div>
                <button
                  onClick={() => loginWithReplit()}
                  className="w-full py-2.5 px-4 rounded-xl text-sm border border-white/10 text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-replit-login"
                >
                  <ReplitLogo className="w-4 h-4" />
                  Continue with Replit
                </button>
              </>
            )}
            
            <p className="mt-8 text-center text-white/70">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold text-blue-300 hover:text-blue-200" data-testid="link-register">
                Create one
              </Link>
            </p>
          </div>
          
          <p className="mt-8 text-center text-sm text-white/40">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-white/60 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-white/60 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function ReplitLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <path d="M7 5.5C7 4.67157 7.67157 4 8.5 4H15.5C16.3284 4 17 4.67157 17 5.5V12H8.5C7.67157 12 7 11.3284 7 10.5V5.5Z" />
      <path d="M17 12H25.5C26.3284 12 27 12.6716 27 13.5V18.5C27 19.3284 26.3284 20 25.5 20H17V12Z" />
      <path d="M7 21.5C7 20.6716 7.67157 20 8.5 20H17V26.5C17 27.3284 16.3284 28 15.5 28H8.5C7.67157 28 7 27.3284 7 26.5V21.5Z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default LoginPage;
