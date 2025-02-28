import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout Components
import Navbar from './components/layout/Navbar';
import PageContainer from './components/layout/PageContainer';

// Pages
import Home from './pages/home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Chat from './pages/chat/Chat';
import Profile from './pages/profile/Profile';
import Settings from './pages/settings/Settings';

const App = () => {
  useEffect(() => {
      // Load user's saved theme or default to 'light'
      const theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
    }, []);
  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <div className="min-h-screen">
            <Navbar />
            <PageContainer>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/chat/:id" element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } />
                <Route path="/profile/:id" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
            </PageContainer>
          </div>
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;