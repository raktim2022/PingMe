import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showReactions, setShowReactions] = useState(false);

  // Expose setMessages as updateMessages
  const updateMessages = useCallback((updater) => {
    setMessages(typeof updater === 'function' ? updater : () => updater);
  }, []);

  // Base fetch configuration
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    // Don't set Content-Type for FormData
    if (options.body instanceof FormData) {
      delete defaultOptions.headers['Content-Type'];
    }

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return data;
  }, []);

  // User Services
  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('/api/users/all');
      setUsers(response.users);
      return response.users;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const searchUsers = useCallback(async (query) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/users/search?query=${query}`);
      return response.users;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  // Message Services
  const sendMessage = useCallback(async (userId, content, messageType = 'text', file = null) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('messageType', messageType);
      if (file) formData.append('file', file);

      const data = await fetchWithAuth(`/api/messages/send/${userId}`, {
        method: 'POST',
        body: formData
      });

      setMessages(prev => [...prev, data.message]);
      return data.message;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchWithAuth]);

  const getConversation = useCallback(async (userId, page = 1, limit = 50) => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`/api/messages/conversation/${userId}?page=${page}&limit=${limit}`);
      setMessages(response.messages);
      return response;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const deleteMessage = useCallback(async (messageId) => {
    try {
      const response = await fetchWithAuth(`/api/messages/${messageId}`, {
        method: 'DELETE'
      });

      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  }, [fetchWithAuth]);

  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      const response = await fetchWithAuth(`/api/messages/read/${messageId}`, {
        method: 'PUT'
      });

      setMessages(prev => 
        prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, readBy: [...msg.readBy, { user: user.id, readAt: new Date() }] }
            : msg
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }, [fetchWithAuth, user]);

  const getUnreadMessages = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/messages/unread');
      return response.count;
    } catch (error) {
      setError(error.message);
      return 0;
    }
  }, [fetchWithAuth]);

  // Add reaction to message
  const addReaction = useCallback(async (messageId, reaction) => {
    try {
      const data = await fetchWithAuth(`/api/messages/reaction/${messageId}`, {
        method: 'POST',
        body: JSON.stringify({ reaction })
      });

      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? data.message : msg
      ));
      return data.message;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchWithAuth]);

  // Remove reaction from message
  const removeReaction = useCallback(async (messageId) => {
    try {
      await fetchWithAuth(`/api/messages/reaction/${messageId}`, {
        method: 'DELETE'
      });

      setMessages(prev => prev.map(msg => 
        msg._id === messageId 
          ? { ...msg, reactions: msg.reactions.filter(r => r.user !== user._id) }
          : msg
      ));
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchWithAuth, user]);

  // Reply to message
  const replyToMessage = useCallback(async (messageId, content, messageType = 'text', file = null) => {
    try {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('messageType', messageType);
      if (file) formData.append('file', file);

      const data = await fetchWithAuth(`/api/messages/reply/${messageId}`, {
        method: 'POST',
        body: formData
      });

      setMessages(prev => [...prev, data.message]);
      return data.message;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchWithAuth]);

  // Edit message
  const editMessage = useCallback(async (messageId, content) => {
    try {
      const data = await fetchWithAuth(`/api/messages/edit/${messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ content })
      });

      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? data.message : msg
      ));
      return data.message;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, [fetchWithAuth]);

  const value = {
    selectedChat,
    setSelectedChat,
    messages,
    users,
    loading,
    error,
    // User services
    getAllUsers,
    searchUsers,
    // Message services
    sendMessage,
    getConversation,
    deleteMessage,
    markMessageAsRead,
    getUnreadMessages,
    // New message features
    addReaction,
    removeReaction,
    replyToMessage,
    editMessage,
    replyingTo,
    setReplyingTo,
    editingMessage,
    setEditingMessage,
    showReactions,
    setShowReactions,
    // Helper functions
    clearError: () => setError(null),
    updateMessages // Expose the setter with a clearer name
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};