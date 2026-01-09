import React, { useState } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

function AuthLayout({ children }: { children: React.ReactNode }) {
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
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    await requestPasswordReset(email);
    setIsSubmitting(false);
    setSuccess(true);
  };
  
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MailIcon className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-display" data-testid="text-success-title">
            Check your email
          </h1>
          <p className="text-white/70 mb-8">
            If an account exists with <strong className="text-white">{email}</strong>, you'll receive a password reset link shortly.
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-6 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600"
            data-testid="link-back-to-login"
          >
            Back to sign in
          </Link>
          <p className="mt-6 text-sm text-white/50">
            Didn't receive an email?{' '}
            <button onClick={() => setSuccess(false)} className="text-blue-300 hover:underline" data-testid="button-try-again">
              Try again
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-white mb-2 font-display" data-testid="text-page-title">
        Reset your password
      </h1>
      <p className="text-white/70 mb-8">
        Enter your email and we'll send you a link to reset your password.
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm" data-testid="text-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border bg-white/5 border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@example.com"
            data-testid="input-email"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          data-testid="button-submit"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-white/70">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-blue-300 hover:text-blue-200" data-testid="link-login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { resetPassword } = useAuth();
  
  const params = new URLSearchParams(searchString);
  const token = params.get('token') || '';
  const isMigration = params.get('migration') === 'true';
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertIcon className="w-8 h-8 text-red-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-display" data-testid="text-invalid-title">
            Invalid reset link
          </h1>
          <p className="text-white/70 mb-8">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block py-3 px-6 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600"
            data-testid="link-request-new"
          >
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    );
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsSubmitting(true);
    const result = await resetPassword(token, password);
    setIsSubmitting(false);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to reset password');
    }
  };
  
  if (success) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckIcon className="w-8 h-8 text-green-300" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-display" data-testid="text-success-title">
            {isMigration ? 'Password set up' : 'Password reset successful'}
          </h1>
          <p className="text-white/70 mb-8">
            {isMigration 
              ? 'You can now sign in with your email and password.'
              : 'Your password has been updated. You can now sign in with your new password.'}
          </p>
          <Link
            href="/login"
            className="inline-block py-3 px-6 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600"
            data-testid="link-sign-in"
          >
            Sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-white mb-2 font-display" data-testid="text-page-title">
        {isMigration ? 'Set up your password' : 'Create new password'}
      </h1>
      <p className="text-white/70 mb-8">
        {isMigration 
          ? 'Choose a password to enable email login.'
          : 'Enter your new password below.'}
      </p>
      
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm" data-testid="text-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
            {isMigration ? 'Password' : 'New password'}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <p className="mt-1 text-xs text-white/50">
            At least 8 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
            Confirm {isMigration ? 'password' : 'new password'}
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`w-full px-4 py-3 rounded-xl border bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/40 ${
              confirmPassword && password !== confirmPassword ? 'border-red-400/50' : 'border-white/20'
            }`}
            placeholder="••••••••"
            data-testid="input-confirmPassword"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
          data-testid="button-submit"
        >
          {isSubmitting ? (isMigration ? 'Setting up...' : 'Resetting...') : (isMigration ? 'Set password' : 'Reset password')}
        </button>
      </form>
    </AuthLayout>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
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
