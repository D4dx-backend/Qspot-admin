import React from 'react';
import { 
  FaUsers, 
  FaUserTie, 
  FaQuestionCircle, 
  FaCalendarAlt, 
  FaVideo, 
  FaBell, 
  FaImage,
  FaSignOutAlt,
  FaBook
} from 'react-icons/fa';

const Sidebar = ({ currentPage, onNavigate }) => {
  const menuItems = [
    {
      id: 'users',
      label: 'Users',
      icon: FaUsers,
      path: '/admin/dashboard'
    },
    {
      id: 'speakers',
      label: 'Speakers',
      icon: FaUserTie,
      path: '/admin/speakers'
    },
    {
      id: 'subjects',
      label: 'Subjects',
      icon: FaBook,
      path: '/admin/subjects'
    },
    {
      id: 'questions',
      label: 'Questions',
      icon: FaQuestionCircle,
      path: '/admin/questions'
    },
    {
      id: 'schedules',
      label: 'Schedules',
      icon: FaCalendarAlt,
      path: '/admin/schedules'
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: FaVideo,
      path: '/admin/videos'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FaBell,
      path: '/admin/notifications'
    },
    {
      id: 'banner',
      label: 'Banner',
      icon: FaImage,
      path: '/admin/banner'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="fixed top-0 left-0 bg-gray-800 text-white w-64 h-screen flex flex-col z-50">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700 flex justify-center">
        <img 
          src="/src/assets/Logo 01.png" 
          alt="QSpot Logo" 
          className="h-12 w-auto"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                  currentPage === item.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="text-lg mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="text-lg mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
