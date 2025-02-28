import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.MODE === 'production'
  ? '/api'
  : 'http://localhost:5000/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Save auth data to localStorage
  const saveAuthData = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Clear auth data from localStorage
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Check auth status on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuthStatus();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/check`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setIsAuthenticated(true);
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      saveAuthData(data.token, data.user);
      setUser(data.user);
      setIsAuthenticated(true);

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user._id);
      saveAuthData(data.token, data.user);
      navigate(`/chat/${data.user.id}`);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      localStorage.removeItem('theme')
      clearAuthData();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      clearAuthData();
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading,
        login,
        logout,
        register,
        updateProfile,
        userId: user?.id || localStorage.getItem('userId')
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

 export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};