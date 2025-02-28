import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, userId } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        logout();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <div className="lg:hidden">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            )}
          </button>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">
          PingMe
        </Link>
      </div>

      <div className={`navbar-end ${isOpen ? 'flex' : 'hidden'} lg:flex`}>
        {!isAuthenticated ? (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to={`/chat/${userId}`} className="btn btn-ghost">
              Chat
            </Link>
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img 
                    src={user?.avatar || "/default-avatar.png"}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </label>
              <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                <li><Link to={`/profile/${userId}`}>Profile</Link></li>
                <li><Link to="/settings">Settings</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;