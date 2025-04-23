import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = ({ hideSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const isLoginPage = location.pathname === '/login';

  return (
    <nav
      className={`bg-white shadow-md py-4 px-6 fixed top-0 left-0 right-0 z-30 ${
        isLoginPage ? 'w-full' : hideSidebar ? 'md:left-0' : 'md:left-64'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center h-[var(--navbar-height)]">
        <Link to="/" className="text-xl font-bold text-gray-900">
          EduFlex
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition duration-200"
                aria-label="Profile menu"
              >
                <FaUserCircle className="text-2xl" />
                <span className="hidden md:inline">{user.email}</span>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-10">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition duration-200"
                    aria-label="Logout"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-amber-500 hover:text-gray-900 transition duration-200"
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;