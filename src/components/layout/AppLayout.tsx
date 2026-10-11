import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  UploadCloud,
  History,
  BarChart3,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

interface AppLayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload' as NavigationTab, label: 'Upload', icon: UploadCloud },
    { id: 'history' as NavigationTab, label: 'Histori', icon: History },
    { id: 'insight' as NavigationTab, label: 'Insight', icon: BarChart3 },
    { id: 'profile' as NavigationTab, label: 'Profil Saya', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col md:flex-row text-zinc-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 bg-white shrink-0 justify-between">
        <div>
          {/* Logo & Brand */}
          <div className="h-16 flex items-center px-5 border-b border-zinc-100">
            <BrandLogo size={36} showText={true} textSize="text-base" />
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
              Menu Utama
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#F0F4F8] text-[#1E2E42] font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1E2E42]' : 'text-zinc-600'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#1E2E42]" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card in Bottom Corner */}
        <div className="p-4 border-t border-zinc-100 bg-[#FAFAFA]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-3 text-left overflow-hidden group flex-1 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#1E2E42] text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-800 truncate group-hover:text-[#1E2E42]">
                  {user?.displayName || 'Pengguna'}
                </p>
                <p className="text-[11px] text-zinc-600 truncate">{user?.email}</p>
              </div>
            </button>
            <button
              onClick={logout}
              title="Keluar"
              className="p-1.5 text-zinc-600 hover:text-zinc-800 hover:bg-zinc-200 rounded-md transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-zinc-200 sticky top-0 z-30">
        <BrandLogo size={30} showText={true} textSize="text-base" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('profile')}
            className="flex items-center gap-2 p-1 text-xs text-zinc-700 bg-zinc-100 rounded-md px-2"
          >
            <span className="truncate max-w-[120px] font-medium">{user?.displayName || 'Profil'}</span>
          </button>
          <button
            onClick={logout}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 rounded-md"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-zinc-200 flex items-center justify-around z-30 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center w-full py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#1E2E42] font-semibold' : 'text-zinc-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#1E2E42]' : 'text-zinc-600'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
