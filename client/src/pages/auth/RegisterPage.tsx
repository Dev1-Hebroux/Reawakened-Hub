import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

const IS_DEV = import.meta.env.DEV;

export function RegisterPage() {
  const [, setLocation] = useLocation();
  const { register, loginWithReplit, isAuthenticated, isLoading: authLoading, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      setLocation('/');
    }
  }, [isAuthenticated, authLoading, setLocation]);
  
  const passwordStrength = getPasswordStrength(formData.password);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearError();
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordStrength.score < 2) {
      setError('Please choose a stronger password');
      return;
    }
    
    setIsSubmitting(true);
    const result = await register({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
    });
    setIsSubmitting(false);
    
    if (result.success) {
      setLocation('/');
    } else {
      setError(result.error || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleAppleLogin = () => {
    window.location.href = '/api/auth/apple';
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a2744]" data-testid="register-loading">
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
              Create your account
            </h1>
            <p className="text-white/70 mb-8">
              Start your spiritual journey today
            </p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm" data-testid="text-error">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-white text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
                data-testid="button-google-register"
              >
                <GoogleIcon className="w-5 h-5" />
                Continue with Google
              </button>
              
              <button
                onClick={handleAppleLogin}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-black text-white hover:bg-gray-900 transition-colors flex items-center justify-center gap-3"
                data-testid="button-apple-register"
              >
                <AppleIcon className="w-5 h-5" />
                Continue with Apple
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 border-t border-white/20" />
              <span className="text-sm text-white/40">or</span>
              <div className="flex-1 border-t border-white/20" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-2">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border bg-white/5 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="John"
                    data-testid="input-firstName"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-white/80 mb-2">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border bg-white/5 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Doe"
                    data-testid="input-lastName"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border bg-white/5 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="you@example.com"
                  data-testid="input-email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
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
                
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i < passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${passwordStrength.textColor}`} data-testid="text-password-strength">
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/40 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-400/50'
                      : 'border-white/20'
                  }`}
                  placeholder="••••••••"
                  data-testid="input-confirmPassword"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-300" data-testid="text-password-mismatch">Passwords do not match</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
                data-testid="button-submit"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
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
                  data-testid="button-replit-register"
                >
                  <ReplitLogo className="w-4 h-4" />
                  Continue with Replit
                </button>
              </>
            )}
            
            <p className="mt-8 text-center text-white/70">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-blue-300 hover:text-blue-200" data-testid="link-login">
                Sign in
              </Link>
            </p>
          </div>
          
          <p className="mt-8 text-center text-sm text-white/40">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-white/60 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-white/60 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function getPasswordStrength(password: string) {
  if (!password) return { score: 0, label: '', color: '', textColor: '' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  score = Math.min(score, 4);
  
  const levels = [
    { label: 'Very weak', color: 'bg-red-400', textColor: 'text-red-300' },
    { label: 'Weak', color: 'bg-red-400', textColor: 'text-red-300' },
    { label: 'Fair', color: 'bg-yellow-400', textColor: 'text-yellow-300' },
    { label: 'Strong', color: 'bg-green-400', textColor: 'text-green-300' },
    { label: 'Very strong', color: 'bg-green-500', textColor: 'text-green-300' },
  ];
  
  return { score, ...levels[score] };
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

export default RegisterPage;
