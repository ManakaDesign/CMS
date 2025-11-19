import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiFileText,
  FiMenu,
  FiImage,
  FiPackage,
  FiUsers,
  FiMail,
  FiClipboard,
  FiLogOut,
} from 'react-icons/fi';
import { removeAuthToken } from '../../api/client';
import { useNavigate } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeAuthToken();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/pages', icon: FiFileText, label: 'Seiten' },
    { path: '/menu', icon: FiMenu, label: 'Menü' },
    { path: '/media', icon: FiImage, label: 'Media' },
    { path: '/plugins', icon: FiPackage, label: 'Plugins' },
    { path: '/users', icon: FiUsers, label: 'Benutzer' },
    { path: '/mail', icon: FiMail, label: 'Mail' },
    { path: '/forms', icon: FiClipboard, label: 'Formulare' },
  ];

  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="text-xl font-bold text-light-text">CMS Admin</h1>
        <p className="text-xs text-light-muted mt-1">Page Builder</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-primary text-white'
                        : 'text-light-text hover:bg-dark-hover hover:text-white'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-dark-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-light-text hover:bg-dark-hover hover:text-white rounded-lg transition-colors"
        >
          <FiLogOut size={20} />
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </div>
  );
};
