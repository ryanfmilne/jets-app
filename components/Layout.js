import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { LogOut, Settings, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const Layout = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { user, userRole, loading, logout, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push('/login');
      } else if (requireAdmin && !isAdmin()) {
        router.push('/jobs');
      }
    }
  }, [user, userRole, loading, router, requireAuth, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (requireAdmin && !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="bg-white shadow-sm border-b border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">PrintQueue</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/jobs')}
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Jobs
                </button>
                {isAdmin() && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Admin
                  </button>
                )}
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </motion.nav>
      )}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;