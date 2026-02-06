import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  MessageSquare,
  Users,
  Kanban,
  BarChart3,
  MapPin,
  UserCog,
  Settings,
  Plug,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout, hasPermission } = useAuthStore();

  const closeSidebar = () => {
    setMobileMenuOpen(false);
    setSidebarOpen(false);
  };
  const openSidebar = () => setSidebarOpen(true);

  const navigation = [
    { name: 'Inbox', icon: MessageSquare, href: '/inbox', permission: 'view_messages' },
    { name: 'Clients', icon: Users, href: '/clients', permission: 'view_clients' },
    { name: 'Mijozlar oqimi', icon: Kanban, href: '/kanban', permission: 'view_clients' },
    { name: 'Analytics', icon: BarChart3, href: '/analytics', permission: 'view_analytics' },
    { name: 'Branches', icon: MapPin, href: '/branches', permission: 'view_branches' },
    { name: 'Users', icon: UserCog, href: '/users', permission: 'view_users' },
    { name: 'Rollar va ruxsatlar', icon: Shield, href: '/role-permissions', permission: 'manage_roles' },
    { name: 'Integrations', icon: Plug, href: '/integrations', permission: 'manage_integrations' },
    { name: 'Settings', icon: Settings, href: '/settings', permission: null },
  ];

  const visibleNavigation = navigation.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`h-screen flex ${darkMode ? 'dark' : ''}`}>
      {/* Mobil: orqa fon — drawer yopiladi */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: mobil da drawer (fixed), desktop da odatdagi */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-72 md:flex-shrink-0
          ${sidebarOpen ? 'md:w-64' : 'md:w-20'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-out flex flex-col
        `}
      >
        {/* Logo */}
        <div className="h-14 md:h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white truncate">
              {sidebarOpen ? 'Acoustic CRM' : ''}
            </span>
          </div>
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 -m-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center md:block"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {visibleNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className={`${(sidebarOpen || mobileMenuOpen) ? 'mr-3' : 'md:mx-auto'} w-5 h-5 flex-shrink-0`} />
              {(sidebarOpen || mobileMenuOpen) && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          {(sidebarOpen || mobileMenuOpen) ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleDarkMode}
                  className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:opacity-90 min-h-[44px] flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={toggleDarkMode}
                className="w-full px-3 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={logout}
                className="w-full px-3 py-2 text-white bg-primary rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Bar */}
        <header className="h-14 md:h-16 flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 rounded-lg"
            aria-label="Menyu"
          >
            <Menu className="w-6 h-6" />
          </button>
          {!sidebarOpen && (
            <button
              type="button"
              onClick={openSidebar}
              className="hidden md:flex mr-2 p-2 min-h-[44px] min-w-[44px] items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-400 rounded-lg"
              aria-label="Menyuni ochish"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          {user?.branch && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {user.branch.name}
              </span>
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
