import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ForgotPasswordProps {
  onNavigateToLogin?: () => void;
  onNavigateHome?: () => void;
}

export default function ForgotPassword({ onNavigateToLogin, onNavigateHome }: ForgotPasswordProps) {
  const { sendPasswordReset, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your registered email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setIsSent(true);
    } catch (err: any) {
      // Error in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || error;

  return (
    <div className="min-h-screen bg-gray-50/70 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-6">
        
        {/* Header */}
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
            Reset Portal Password
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Enter your registered institutional email to receive a password recovery link.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-200/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#001c46] via-[#FFC907] to-[#10B981]"></div>

          {isSent ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-[#001c46]">Password Reset Email Sent</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  We have dispatched a password reset link to <strong className="text-gray-900">{email}</strong>. Please check your inbox and follow the instructions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToLogin) onNavigateToLogin();
                  else {
                    window.history.pushState({}, '', '/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }
                }}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#001c46] bg-[#FFC907] hover:bg-[#e6b400] transition-all shadow-md"
              >
                Return To Login
              </button>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {activeError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{activeError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="reset-email" className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                  Registered Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 h-4" />
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@gpacademy.edu.in"
                    className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-[#001c46] hover:bg-[#1a325d] transition-all duration-200 shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Instructions</span>
                  )}
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToLogin) onNavigateToLogin();
                    else {
                      window.history.pushState({}, '', '/login');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#001c46] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
