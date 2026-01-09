import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

const SHOW_REPLIT_LOGIN = import.meta.env.DEV || import.meta.env.VITE_SHOW_REPLIT_LOGIN === 'true';

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
  const redirectTo = params.get('redirect') || '/dashboard';
  
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
  
  const handleReplitLogin = () => {
    loginWithReplit();
  };

  const handleGoogleLogin = () => {
    setError('Google login coming soon');
  };

  const handleAppleLogin = () => {
    setError('Apple login coming soon');
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
                {isSubmitting ? 'Signing in...' : 'Sign in with Email'}
              </button>
            </form>
            
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-white/20" />
              <span className="text-sm text-white/40">or continue with</span>
              <div className="flex-1 border-t border-white/20" />
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
                data-testid="button-google-login"
              >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </button>
              
              <button
                onClick={handleAppleLogin}
                className="w-full py-3 px-4 rounded-xl font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
                data-testid="button-apple-login"
              >
                <AppleIcon className="w-5 h-5" />
                Continue with Apple
              </button>
            </div>
            
            {SHOW_REPLIT_LOGIN && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 text-center mb-3">Developer access</p>
                <button
                  onClick={handleReplitLogin}
                  className="w-full py-2.5 px-4 rounded-xl text-sm border border-white/10 text-white/60 hover:bg-white/5 hover:text-white/80 transition-colors flex items-center justify-center gap-2"
                  data-testid="button-replit-login"
                >
                  <ReplitLogo className="w-4 h-4" />
                  Continue with Replit
                </button>
              </div>
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

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
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
