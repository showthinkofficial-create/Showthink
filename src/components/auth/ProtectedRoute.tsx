import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigateToLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, onNavigateToLogin }) => {
  const { user, userProfile, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-md text-center max-w-sm w-full space-y-4">
          <Loader2 className="w-10 h-10 text-[#001c46] animate-spin mx-auto" />
          <p className="text-sm font-bold text-[#001c46]">Verifying Portal Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !userProfile || userProfile.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#001c46]">Authentication Required</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              {error || 'You must be logged in with an active institutional account to access this area.'}
            </p>
          </div>
          <button
            onClick={() => {
              if (onNavigateToLogin) {
                onNavigateToLogin();
              } else {
                window.history.pushState({}, '', '/login');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
            className="w-full bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Go To Login Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
