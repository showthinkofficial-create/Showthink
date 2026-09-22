import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/Logo';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

interface LoginProps {
  onNavigateToForgotPassword?: () => void;
  onLoginSuccess?: (role: string) => void;
  onNavigateHome?: () => void;
  isAdminMode?: boolean;
  portalType?: 'admin' | 'teacher' | 'portal';
}

export default function Login({
  onNavigateToForgotPassword,
  onLoginSuccess,
  onNavigateHome,
  isAdminMode,
  portalType,
}: LoginProps) {
  const { login, logout, error, clearError } = useAuth();
  
  // Resolve portal role mode from props or current URL
  const currentPath = window.location.pathname.toLowerCase();
  const effectivePortal: 'admin' | 'teacher' | 'portal' = 
    portalType || 
    (isAdminMode || currentPath.startsWith('/admin') ? 'admin' : currentPath.startsWith('/teacher') ? 'teacher' : 'portal');

  const isAdmin = effectivePortal === 'admin';
  const isTeacher = effectivePortal === 'teacher';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const userProfile = await login(cleanEmail, password);
      
      // Strict role isolation check
      if (isAdmin && userProfile.role !== 'SUPER_ADMIN' && userProfile.role !== 'ADMIN') {
        await logout();
        setLocalError('Access Denied: This account is not authorized for Administrative access. Only authorized school administrators can sign in here.');
        return;
      }

      if (isTeacher && userProfile.role !== 'TEACHER' && userProfile.role !== 'SUPER_ADMIN') {
        await logout();
        setLocalError('Access Denied: This account is not authorized for Teacher access. Only assigned GP Academy faculty members can sign in here.');
        return;
      }

      handleLoginSuccess(userProfile.role);
    } catch (err: any) {
      // Error handles in AuthContext state
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    if (onNavigateToForgotPassword) {
      onNavigateToForgotPassword();
    } else {
      const roleParam = isAdmin ? 'admin' : isTeacher ? 'teacher' : 'portal';
      const target = `/forgot-password?role=${roleParam}`;
      window.history.pushState({}, '', target);
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
            {isAdmin 
              ? 'Admin Portal Authentication' 
              : isTeacher 
              ? 'Teacher & Faculty Portal' 
              : 'Student & Parent Combined Portal'}
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {isAdmin
              ? 'Restricted administrative console for authorized school management & super administrators.'
              : isTeacher
              ? 'Authorized portal for assigned school faculty, attendance recording, and marks entry.'
              : 'Institutional portal for students and parents to view attendance, fees, and academic results.'}
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
                  {isAdmin ? 'Administrator Email' : isTeacher ? 'Teacher Email' : 'Email Address'}
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
                    placeholder={
                      isAdmin 
                        ? 'e.g. showthinkofficial@gmail.com' 
                        : isTeacher 
                        ? 'e.g. teacher@gpacademy.edu.in' 
                        : 'e.g. parent@gpacademy.edu.in'
                    }
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
                    onClick={handleForgotPassword}
                    className="text-[11px] font-bold text-[#001c46] hover:text-[#1a325d] hover:underline cursor-pointer"
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
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
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-xs font-extrabold uppercase tracking-wider text-[#001c46] bg-[#FFC907] hover:bg-[#e6b400] active:scale-[0.99] transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#001c46]" />
                      <span>
                        {isAdmin ? 'Signing In to Admin Console...' : isTeacher ? 'Signing In to Teacher Portal...' : 'Signing In...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isAdmin ? 'Sign In as Administrator' : isTeacher ? 'Sign In as Teacher' : 'Sign In To Portal'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Portal Switcher Navigation */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-bold text-[#001c46]">
              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/admin/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="hover:underline cursor-pointer"
                >
                  Admin Login (/admin/login)
                </button>
              )}
              {!isAdmin && !isTeacher && <span className="text-gray-300 hidden sm:inline">•</span>}
              {!isTeacher && (
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/teacher/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="hover:underline cursor-pointer"
                >
                  Teacher Login (/teacher/login)
                </button>
              )}
              {(isAdmin || isTeacher) && (
                <button
                  type="button"
                  onClick={() => {
                    window.history.pushState({}, '', '/portal/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="hover:underline cursor-pointer"
                >
                  Student & Parent Portal (/portal/login)
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
              Self-registration is disabled. If you need account support, please contact the School Administration.
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
            className="text-xs font-bold text-gray-500 hover:text-[#001c46] transition-colors cursor-pointer"
          >
            ← Back to GP Academy Public Website
          </button>
        </div>

      </div>
    </div>
  );
}
