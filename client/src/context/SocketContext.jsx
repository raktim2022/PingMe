import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.MODE === 'production'
  ? ''
  : 'http://localhost:5000';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map());

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: localStorage.getItem('token')
        },
        withCredentials: true
      });

      // Socket event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected');
      });

      newSocket.on('user:online', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('user:offline', (userId) => {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      });

      newSocket.on('typing:start', (userId) => {
        setTypingUsers(prev => new Map(prev).set(userId, true));
      });

      newSocket.on('typing:stop', (userId) => {
        setTypingUsers(prev => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (socket) {
      socket.on('typing:start', (userId) => {
        setTypingUsers(prev => new Map(prev).set(userId, true));
      });

      socket.on('typing:stop', (userId) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      });

      return () => {
        socket.off('typing:start');
        socket.off('typing:stop');
      };
    }
  }, [socket]);

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    isOnline: (userId) => onlineUsers.has(userId),
    isTyping: (userId) => typingUsers.has(userId)
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};