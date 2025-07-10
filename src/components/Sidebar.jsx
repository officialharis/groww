import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Briefcase,
  Heart,
  Wallet,
  History,
  PieChart,
  Settings,
  X,
  Menu
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/stocks', icon: TrendingUp, label: 'Stocks' },
    { to: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { to: '/watchlist', icon: Heart, label: 'Watchlist' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/transactions', icon: History, label: 'Transactions' },
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar
        fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ease-in-out
        ${isMobile
          ? `w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
          : 'w-64 lg:w-64 md:w-48 translate-x-0'
        }
      `}>
        {/* Mobile Close Button */}
        {isMobile && (
          <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 min-h-[44px] ${
                    isActive
                      ? 'bg-groww-light dark:bg-groww-primary/20 text-groww-primary border border-groww-primary/20'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;