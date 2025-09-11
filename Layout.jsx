
import React, { useState, useEffect, useCallback, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home, Search, Menu, Users, Settings, Sun, Moon, Trophy,
  LogOut, Bell, ArrowUp, CreditCard, Bot, Code
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeProvider, useTheme } from "./components/theme/ThemeProvider";
import CookieConsent from "./components/legal/CookieConsent";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserEntity } from "@/api/entities";
import { Notification } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import ErrorBoundary from "./components/common/ErrorBoundary";
import LoadingScreen from "./components/common/LoadingScreen";
import { getUserInitials } from "./components/common/constants";

const unprotectedPages = ['Welcome', 'Onboarding', 'Legal', 'AboutUs', 'Checkout'];

const navItems = [
  { name: 'Dashboard', icon: Home, href: createPageUrl('Dashboard') },
  { name: 'Find Venues', icon: Search, href: createPageUrl('VenueSearch') },
  { name: 'Find Partners', icon: Users, href: createPageUrl('PartnerFinder') },
  { name: 'My Games', icon: Trophy, href: createPageUrl('MyMatches') },
  { name: 'AI Concierge', icon: Bot, href: createPageUrl('AIBot') },
];

const BackToTopButton = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 300);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={scrollToTop}
          className="fixed bottom-32 lg:bottom-8 right-4 z-50 bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
});

const UserProfileButton = memo(({ user, onLogout }) => {
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full p-1">
          <Avatar className="h-9 w-9 border-2 border-gray-200 dark:border-gray-700">
            <AvatarImage src={user.profile_image} alt={user.full_name || user.email} />
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 mr-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl rounded-xl">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white truncate">{user.full_name || 'User'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
        </div>
        <div className="py-2">
          <button onClick={() => navigate(createPageUrl('Settings'))} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Settings className="w-4 h-4 mr-3" /> Account Settings
          </button>
          <button onClick={() => navigate(createPageUrl('Subscriptions'))} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <CreditCard className="w-4 h-4 mr-3" /> AI Concierge Pro
          </button>
          <button onClick={() => navigate(createPageUrl('DevTools'))} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
            <Code className="w-4 h-4 mr-3" /> Developer Tools
          </button>
          <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="w-4 h-4 mr-3" /> Logout
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

const ThemeToggle = memo(() => {
  const { theme, changeTheme } = useTheme();
  
  const toggleTheme = useCallback(() => {
    changeTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, changeTheme]);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
});

const NotificationBell = memo(() => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const unseenNotifs = await Notification.filter({ is_read: false });
        setNotifications(unseenNotifs);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => navigate(createPageUrl('Notifications'))}
      className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
    >
      <Bell className="w-5 h-5" />
      {notifications.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
        >
          {notifications.length}
        </motion.div>
      )}
    </button>
  );
});

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await UserEntity.me();
      setUser(userData);
      if (currentPageName === 'Welcome' || currentPageName === 'Onboarding') {
        navigate(createPageUrl('Dashboard'));
      }
    } catch (error) {
      setUser(null);
      if (!unprotectedPages.includes(currentPageName)) {
        navigate(createPageUrl('Welcome'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPageName, navigate]);

  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  const handleLogout = useCallback(async () => {
    await UserEntity.logout();
    setUser(null);
    navigate(createPageUrl('Welcome'));
  }, [navigate]);

  if (isLoading && !unprotectedPages.includes(currentPageName)) {
    return <LoadingScreen />;
  }

  const isProtectedPage = user && !unprotectedPages.includes(currentPageName);
  const isPublicPage = !isProtectedPage;

  if (isPublicPage) {
    return (
      <ThemeProvider defaultTheme="system" storageKey="28sporting-theme">
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <ErrorBoundary>
            <main>{children}</main>
          </ErrorBoundary>
          <CookieConsent />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="28sporting-theme">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to={createPageUrl('Dashboard')} className="flex-shrink-0 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-sm font-black text-white">28</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:inline">28SPORTING</span>
                </Link>
              </div>
              <div className="hidden lg:flex lg:ml-10 lg:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                      createPageUrl(currentPageName) === item.href
                        ? 'text-emerald-600 dark:text-emerald-500'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                  >
                    {item.name}
                    {createPageUrl(currentPageName) === item.href && (
                      <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" layoutId="underline" />
                    )}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <NotificationBell />
                <UserProfileButton user={user} onLogout={handleLogout} />
                <div className="lg:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-64 bg-white dark:bg-gray-950 p-0">
                      <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3" onClick={() => setMobileMenuOpen(false)}>
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-black text-white">28</span>
                            </div>
                            <span className="font-bold text-xl text-gray-800 dark:text-white">28SPORTING</span>
                          </Link>
                        </div>
                        <nav className="flex-grow px-2 py-4 space-y-1">
                          {navItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center px-3 py-3 rounded-xl text-base font-medium transition-colors duration-200 ${
                                createPageUrl(currentPageName) === item.href
                                  ? 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <item.icon className="mr-3 h-5 w-5" />
                              {item.name}
                            </Link>
                          ))}
                          <Link
                            to={createPageUrl('DevTools')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-3 py-3 rounded-xl text-base font-medium transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Code className="mr-3 h-5 w-5" />
                            Developer Tools
                          </Link>
                        </nav>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="pt-16 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
        
        <footer className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-30">
          <div className="grid grid-cols-5 gap-1 px-2 py-2">
            {navItems.map((item) => (
              <Link
                key={`mobile-${item.name}`}
                to={item.href}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${
                  createPageUrl(currentPageName) === item.href
                    ? 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium leading-tight">{item.name.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
        </footer>

        <BackToTopButton />
        <CookieConsent />
      </div>
    </ThemeProvider>
  );
}
