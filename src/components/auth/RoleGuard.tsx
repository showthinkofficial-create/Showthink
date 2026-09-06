import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { ShieldX, LogOut } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  onNavigateToPanel?: (role: UserRole) => void;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, onNavigateToPanel }) => {
  const { userProfile, logout } = useAuth();

  if (!userProfile) return null;

  // SUPER_ADMIN has full system access to all panels
  const hasAccess = userProfile.role === 'SUPER_ADMIN' || allowedRoles.includes(userProfile.role);

  if (!hasAccess) {
    const userRole = userProfile.role;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center max-w-md w-full space-y-6">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
            <ShieldX className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#001c46]">Access Restricted</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Your account role <span className="font-bold text-[#001c46]">[{userRole}]</span> is not authorized to access this panel section.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                if (onNavigateToPanel) {
                  onNavigateToPanel(userRole);
                } else {
                  const pathMap: Record<UserRole, string> = {
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
              }}
              className="w-full bg-[#001c46] hover:bg-[#1a325d] text-[#FFC907] font-extrabold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Go To Your Assigned Panel
            </button>
            <button
              onClick={() => logout()}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
