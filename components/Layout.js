import { useAuth } from '../lib/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Header from './Header';

const Layout = ({ children, requireAuth = true, requireAdmin = false }) => {
  const { user, userRole, loading, isAdmin } = useAuth();
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
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;