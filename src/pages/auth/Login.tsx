import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onNavigateToForgotPassword?: () => void;
  onLoginSuccess?: (role: string) => void;
  onNavigateHome?: () => void;
}

export default function Login({
  onNavigateToForgotPassword,
  onLoginSuccess,
  onNavigateHome,
}: LoginProps) {
  const { login, loginWithGoogle, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLoginSuccess = (userRole: string) => {
    if (onLoginSuccess) {
      onLoginSuccess(userRole);
    } else {
      const pathMap: Record<string, string> = {
        SUPER_ADMIN: '/admin',
        ADMIN: '/admin',
        TEACHER: '/teacher/dashboard',
        PORTAL_USER: '/portal/dashboard',
        STUDENT: '/portal/dashboard',
        PARENT: '/portal/dashboard',
      };
      const targetPath = pathMap[userRole] || '/portal/dashboard';
      window.history.pushState({}, '', targetPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleAdminGoogleSignIn = async () => {
    setLocalError(null);
    clearError();
    setIsGoogleSubmitting(true);
    try {
      const userProfile = await loginWithGoogle();
      handleLoginSuccess(userProfile.role);
    } catch (err: any) {
      // Error is caught and surfaced in AuthContext
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userProfile = await login(email.trim(), password);
      handleLoginSuccess(userProfile.role);
    } catch (err: any) {
      // Error handles in AuthContext state
    } finally {
      setIsSubmitting(false);
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
            Student & Parent Combined Portal
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Single institutional portal for students, parents, teachers, and administrators.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-200/80 relative overflow-hidden">
          {/* Top accent border bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#001c46] via-[#FFC907] to-[#10B981]"></div>

          <div className="space-y-5">
            {/* Error Display */}
            {activeError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{activeError}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
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

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-xs font-bold text-[#001c46] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToForgotPassword) onNavigateToForgotPassword();
                      else {
                        window.history.pushState({}, '', '/forgot-password');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }
                    }}
                    className="text-[11px] font-bold text-[#001c46] hover:text-[#1a325d] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#001c46] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || isGoogleSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#001c46] bg-[#FFC907] hover:bg-[#e6b400] active:scale-[0.99] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#001c46]" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In To Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Admin Authentication Section Divider */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                Administration Access
              </span>
              <div className="border-t border-gray-200 w-full"></div>
            </div>

            {/* Admin Google Sign In Button */}
            <button
              type="button"
              onClick={handleAdminGoogleSignIn}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-[#001c46] font-bold text-xs rounded-xl border border-gray-300 hover:border-gray-400 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {isGoogleSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#001c46]" />
                  <span>Verifying Admin Access...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign In as Admin with Google</span>
                </>
              )}
            </button>
          </div>

          {/* Institutional Note */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Self-registration is disabled. If you are a new student or faculty member, please collect your portal credentials from the Administration Office.
            </p>
          </div>
        </div>

        {/* Return link */}
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
