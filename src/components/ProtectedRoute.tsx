import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'motion/react';
import { Lock, ArrowLeft } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'moderator';
  fallback?: React.ReactNode;
}

/**
 * Protected Route Component
 * Ensures user is authenticated before rendering protected content
 * Supports role-based access control
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user',
  fallback 
}) => {
  const { user, loading, loggedIn } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-neutral-700 border-t-[#C9A227] rounded-full"
        />
      </div>
    );
  }

  // Check authentication
  if (!loggedIn || !user) {
    return (
      fallback || (
        <div className="w-full h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <Lock className="w-16 h-16 text-[#C9A227] mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">AUTHENTICATION REQUIRED</h1>
            <p className="text-neutral-400 mb-6 font-mono text-sm">
              THIS ROUTE IS PROTECTED. PLEASE LOG IN TO CONTINUE.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-[#C9A227] hover:bg-amber-500 text-black rounded-lg font-mono text-sm font-bold uppercase flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </button>
          </motion.div>
        </div>
      )
    );
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      fallback || (
        <div className="w-full h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-black mb-2">INSUFFICIENT PRIVILEGES</h1>
            <p className="text-neutral-400 mb-6 font-mono text-sm">
              YOUR ROLE DOES NOT HAVE ACCESS TO THIS RESOURCE. REQUIRED: {requiredRole.toUpperCase()}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-mono text-sm font-bold uppercase flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Return Home
            </button>
          </motion.div>
        </div>
      )
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

/**
 * Admin Route Component
 * Ensures user has admin or moderator role
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { canAccessAdmin, loading, loggedIn } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-neutral-700 border-t-[#C9A227] rounded-full"
        />
      </div>
    );
  }

  if (!loggedIn || !canAccessAdmin) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-neutral-950 text-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black mb-2">ADMIN ACCESS DENIED</h1>
          <p className="text-neutral-400 mb-6 font-mono text-sm">
            ONLY ADMINS AND MODERATORS CAN ACCESS THIS AREA.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-mono text-sm font-bold uppercase flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
