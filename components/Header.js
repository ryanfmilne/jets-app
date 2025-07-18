import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, Settings, Briefcase, User } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/auth';
import UserAvatar from './UserAvatar';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(null);
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  // Fetch current user's full data for avatar
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setCurrentUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavigation = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    {
      label: 'Jobs',
      icon: Briefcase,
      onClick: () => handleNavigation('/jobs'),
      visible: true,
    },
    {
      label: 'Admin Panel',
      icon: Settings,
      onClick: () => handleNavigation('/admin'),
      visible: isAdmin(),
    },
    {
      label: 'Logout',
      icon: LogOut,
      onClick: handleLogout,
      visible: true,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    },
  ];

  if (!user) return null;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 relative z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">PrintQueue</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => router.push('/jobs')}
                className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  router.pathname === '/jobs' ? 'text-primary-600 bg-primary-50' : ''
                }`}
              >
                Jobs
              </button>
              {isAdmin() && (
                <button
                  onClick={() => router.push('/admin')}
                  className={`text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors ${
                    router.pathname === '/admin' ? 'text-primary-600 bg-primary-50' : ''
                  }`}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Admin
                </button>
              )}
              <button
                onClick={logout}
                className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
              
              {/* Desktop User Info */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
                <UserAvatar 
                  user={currentUserData} 
                  size="md"
                  className="cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all"
                  title={currentUserData ? `${currentUserData.firstName} ${currentUserData.lastName}` : 'User'}
                />
                {currentUserData && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {currentUserData.firstName} {currentUserData.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {currentUserData.role}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button & Avatar */}
            <div className="md:hidden flex items-center space-x-3">
              <UserAvatar 
                user={currentUserData} 
                size="md"
                className="cursor-pointer"
                title={currentUserData ? `${currentUserData.firstName} ${currentUserData.lastName}` : 'User'}
              />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <UserAvatar user={currentUserData} size="lg" />
                    <div>
                      {currentUserData ? (
                        <>
                          <p className="text-lg font-semibold text-gray-900">
                            {currentUserData.firstName} {currentUserData.lastName}
                          </p>
                          <p className="text-sm text-gray-500 capitalize">
                            {currentUserData.role}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-semibold text-gray-900">User</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <nav className="flex-1 px-6 py-4">
                  <div className="space-y-2">
                    {menuItems
                      .filter(item => item.visible)
                      .map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={item.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={item.onClick}
                            className={`w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-left font-medium transition-colors ${
                              item.className || 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-lg">{item.label}</span>
                          </motion.button>
                        );
                      })}
                  </div>
                </nav>

                {/* Mobile Menu Footer */}
                <div className="p-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">PrintQueue</p>
                    <p className="text-xs text-gray-400">Print Management System</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;