import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';

interface ResetPasswordProps {
  onNavigateToLogin?: () => void;
  onNavigateHome?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export default function ResetPassword({
  onNavigateToLogin,
  onNavigateHome,
  onNavigateToForgotPassword,
}: ResetPasswordProps) {
  const { verifyResetCode, confirmPasswordReset, error, clearError } = useAuth();
  
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [isVerifyingCode, setIsVerifyingCode] = useState<boolean>(true);
  const [codeError, setCodeError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Extract oobCode from URL and verify it with Firebase Auth
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('oobCode');

    if (!code) {
      setIsVerifyingCode(false);
      setCodeError('No password reset authorization token found in the URL. Please use the exact link sent to your email.');
      return;
    }

    setOobCode(code);

    const verify = async () => {
      clearError();
      try {
        const email = await verifyResetCode(code);
        setVerifiedEmail(email);
      } catch (err: any) {
        setCodeError(err.message || 'This password reset link is invalid, expired, or has already been used.');
      } finally {
        setIsVerifyingCode(false);
      }
    };

    verify();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!newPassword || !confirmPassword) {
      setLocalError('Please fill in both password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setLocalError('Password must be at least 6 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match. Please verify both fields.');
      return;
    }

    if (!oobCode) {
      setLocalError('Invalid reset session token.');
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmPasswordReset(oobCode, newPassword);
      setIsSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to update password. Please request a new reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToLogin = () => {
    if (onNavigateToLogin) {
      onNavigateToLogin();
    } else {
      window.history.pushState({}, '', '/admin/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-gray-50/70 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        
        {/* Top Brand Logo & Header */}
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="inline-flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
          >
            <Logo size={52} className="group-hover:scale-105 transition-transform duration-300" />
            <div>
              <span className="font-sans font-black text-[#001c46] text-xl tracking-wide block">
                GP ACADEMY
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                Noida & Gautam Buddha Nagar
              </span>
            </div>
          </button>

          <h2 className="text-2xl font-black text-[#001c46] tracking-tight pt-2">
            Secure Password Reset
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Official Firebase Authentication credential recovery procedure.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-200/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#001c46] via-[#FFC907] to-[#10B981]"></div>

          {/* 1. Verifying Token State */}
          {isVerifyingCode ? (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-[#001c46] mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#001c46]">Verifying Security Reset Token...</p>
                <p className="text-xs text-gray-500">Checking link authenticity with Firebase Authentication.</p>
              </div>
            </div>
          ) : codeError ? (
            /* 2. Token Error State (Expired / Invalid) */
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-extrabold text-[#001c46]">Reset Link Invalid or Expired</h3>
                <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                  {codeError}
                </p>
              </div>
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToForgotPassword) onNavigateToForgotPassword();
                    else {
                      window.history.pushState({}, '', '/forgot-password');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#001c46] bg-[#FFC907] hover:bg-[#e6b400] transition-all shadow-md cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Request New Reset Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleReturnToLogin}
                  className="w-full py-2.5 text-xs font-bold text-gray-500 hover:text-[#001c46] transition-colors"
                >
                  Return to Admin Login
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            /* 3. Password Reset Success State */
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-[#001c46]">Password Updated Successfully!</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Your password has been securely updated in Firebase Authentication. You may now log in to the Administrative console with your new password.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReturnToLogin}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#001c46] bg-[#FFC907] hover:bg-[#e6b400] transition-all shadow-md cursor-pointer"
                >
                  <span>Proceed to Admin Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* 4. Password Entry Form */
            <form className="space-y-4" onSubmit={handleSubmit}>
              {verifiedEmail && (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2 text-xs text-[#001c46]">
                  <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Updating password for: <strong className="font-bold">{verifiedEmail}</strong>
                  </span>
                </div>
              )}

              {activeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{activeError}</span>
                </div>
              )}

              {/* New Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#001c46] bg-[#FFC907] hover:bg-[#e6b400] active:scale-[0.99] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#001c46]" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Set New Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleReturnToLogin}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#001c46] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and Return to Login</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Back link */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="text-xs font-bold text-gray-500 hover:text-[#001c46] transition-colors"
          >
            ← Back to GP Academy Public Website
          </button>
        </div>

      </div>
    </div>
  );
}
