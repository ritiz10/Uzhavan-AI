import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Tractor,
  Wheat,
  ScanLine,
  Droplets,
  CloudSun,
  History,
  FileText,
  User,
  Settings,
  LogOut,
  Users,
  Database,
  Bug,
  Activity,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const farmerNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Farm', path: '/farms', icon: Tractor },
    { name: 'Crop Recommendation', path: '/crop-recommendation', icon: Wheat },
    { name: 'Disease Detection', path: '/disease-detection', icon: ScanLine },
    { name: 'Irrigation Advisory', path: '/irrigation', icon: Droplets },
    { name: 'Weather Intelligence', path: '/weather', icon: CloudSun },
    { name: 'Prediction History', path: '/history', icon: History },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Farmer Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Farmers', path: '/admin/farmers', icon: Users },
    { name: 'Farms Directory', path: '/admin/farms', icon: Tractor },
    { name: 'All Predictions', path: '/admin/predictions', icon: Activity },
    { name: 'Crop Management', path: '/admin/crops', icon: Database },
    { name: 'Disease Management', path: '/admin/diseases', icon: Bug },
    { name: 'System Logs', path: '/admin/logs', icon: Layers },
  ];

  const currentItems = isAdmin ? adminNavItems : farmerNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Header branding in sidebar (visible on mobile drawer) */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 lg:hidden">
            <span className="font-bold text-slate-900 text-sm">
              {isAdmin ? "Admin Directorate" : "Farmer Portal"}
            </span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
              ✕
            </button>
          </div>

          {/* Role header in sidebar desktop */}
          <div className="px-6 py-4 border-b border-slate-100 hidden lg:block">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {isAdmin ? "Agri Directorate Administration" : "Farmer Precision Dashboard"}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {currentItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/dashboard'}
                  onClick={() => onClose && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-agri-50 text-agri-800 shadow-sm font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-agri-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer: User summary & Logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
