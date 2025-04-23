import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaUsers, FaBars, FaTimes, FaFileAlt, FaUpload, FaChartBar, FaBell, FaCog } from 'react-icons/fa';

const Sidebar = ({ role }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const links = user
    ? {
        faculty: [
          { path: '#overview', label: 'Dashboard', icon: <FaTachometerAlt className="text-blue-600" /> },
          { path: '#courses', label: 'Courses', icon: <FaBook className="text-blue-600" /> },
          { path: '#assignments', label: 'Assignments', icon: <FaFileAlt className="text-blue-600" /> },
          { path: '#content', label: 'Content', icon: <FaUpload className="text-blue-600" /> },
          { path: '#analytics', label: 'Analytics', icon: <FaChartBar className="text-blue-600" /> },
          { path: '#notifications', label: 'Notifications', icon: <FaBell className="text-blue-600" /> },
          { path: '#settings', label: 'Settings', icon: <FaCog className="text-blue-600" /> },
        ],
        student: [
          { path: '/student/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="text-blue-600" /> },
          { path: '/student/courses', label: 'Courses', icon: <FaBook className="text-blue-600" /> },
          { path: '/student/assignments', label: 'Assignments', icon: <FaFileAlt className="text-blue-600" /> },
        ],
        admin: [
          { path: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt className="text-blue-600" /> },
          { path: '/admin/users', label: 'Users', icon: <FaUsers className="text-blue-600" /> },
          { path: '/admin/courses', label: 'Courses', icon: <FaBook className="text-blue-600" /> },
        ],
      }[user.role] || []
    : [];

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-blue-600 text-2xl"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-md p-6 transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0'
        } md:w-64 md:translate-x-0`}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">EduFlex</h2>
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <a
                href={link.path}
                className={`flex items-center p-3 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 ${
                  location.hash === link.path ? 'bg-blue-100 text-blue-600' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;