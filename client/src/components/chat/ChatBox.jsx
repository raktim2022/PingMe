import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import MessageBubble from './MessageBubble';

const ChatBox = () => {
  const { socket, isTyping } = useSocket();
  const { selectedChat, messages, sendMessage, replyToMessage, getConversation, setMessages, updateMessages, replyingTo, setReplyingTo } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Add message handlers
  const handleNewMessage = useCallback((message) => {
    updateMessages(prev => {
      // Prevent duplicate messages
      if (prev.some(m => m._id === message._id)) return prev;
      return [...prev, message];
    });
  }, [updateMessages]);

  const handleMessageSeen = useCallback(({ messageId, userId }) => {
    setMessages(prev => prev.map(msg => 
      msg._id === messageId 
        ? { ...msg, readBy: [...msg.readBy, { user: userId, readAt: new Date() }] }
        : msg
    ));
  }, []);

  const handleMessageReaction = useCallback(({ messageId, userId, reaction, timestamp }) => {
    updateMessages(prev => prev.map(msg => {
      if (msg._id !== messageId) return msg;

      let newReactions = [...(msg.reactions || [])];
      const existingIndex = newReactions.findIndex(r => r.user === userId);

      if (existingIndex > -1) {
        if (!reaction) {
          // Remove reaction
          newReactions = newReactions.filter(r => r.user !== userId);
        } else {
          // Update existing reaction
          newReactions[existingIndex] = { 
            user: userId, 
            reaction, 
            timestamp 
          };
        }
      } else if (reaction) {
        // Add new reaction
        newReactions.push({ 
          user: userId, 
          reaction, 
          timestamp 
        });
      }

      return {
        ...msg,
        reactions: newReactions
      };
    }));
  }, [updateMessages]);

  useEffect(() => {
    if (selectedChat) {
      getConversation(selectedChat._id);
      setIsFirstLoad(true);
    }
  }, [selectedChat, getConversation]);

  // Add these handlers before the socket effect
  useEffect(() => {
    if (socket && selectedChat) {
      socket.on('message:receive', handleNewMessage);
      socket.on('message:seen', handleMessageSeen);
      socket.on('message:reaction', handleMessageReaction);

      return () => {
        socket.off('message:receive');
        socket.off('message:seen');
        socket.off('message:reaction');
      };
    }
  }, [socket, selectedChat, handleNewMessage, handleMessageSeen, handleMessageReaction]);

  const scrollToBottom = () => {
    if (isFirstLoad || messages.length === 0) {
      messagesEndRef.current?.scrollIntoView();
      setIsFirstLoad(false);
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) { // 20MB limit
        alert('File size should be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    setLoading(true);
    try {
      // Clear typing timeout and status
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      setIsUserTyping(false);
      socket?.emit('typing:stop', selectedChat._id);

      let messageType = 'text';
      if (selectedFile) {
        const fileType = selectedFile.type.split('/')[0];
        messageType = fileType === 'image' ? 'image' : 
                     fileType === 'video' ? 'video' : 'file';
      }

      let message;
      if (replyingTo) {
        message = await replyToMessage(replyingTo._id, newMessage.trim(), messageType, selectedFile);
      } else {
        message = await sendMessage(selectedChat._id, newMessage.trim(), messageType, selectedFile);
      }
      
      socket.emit('message:send', {
        receiverId: selectedChat._id,
        message
      });

      setNewMessage('');
      setSelectedFile(null);
      setReplyingTo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = useCallback(() => {
    if (!socket || !selectedChat) return;

    if (!isUserTyping) {
      setIsUserTyping(true);
      socket.emit('typing:start', selectedChat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
      socket.emit('typing:stop', selectedChat._id);
    }, 1000);
  }, [socket, selectedChat, isUserTyping]);

  useEffect(() => {
    let typingTimeout;
    if (socket && selectedChat && newMessage) {
      socket.emit('typing:start', selectedChat._id);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        socket.emit('typing:stop', selectedChat._id);
      }, 1000);
    }
    return () => clearTimeout(typingTimeout);
  }, [newMessage, socket, selectedChat]);

  const ReplyPreview = () => {
    if (!replyingTo) return null;

    return (
      <div className="px-4 py-2 bg-base-200 border-t flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-10 bg-primary rounded"></div>
          <div>
            <p className="text-sm font-medium">
              Replying to {replyingTo.sender.username}
            </p>
            <p className="text-sm text-base-content/70 truncate max-w-md">
              {replyingTo.content}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setReplyingTo(null)}
          className="btn btn-ghost btn-sm"
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Chat Header */}
      <div className="p-4 border-b border-base-300 flex items-center gap-4">
        <div className="avatar online">
          <div className="w-12 rounded-full">
            <img
              src={selectedChat.avatar || "/default-avatar.png"}
              alt={selectedChat.username}
            />
          </div>
        </div>
        <div>
          <h3 className="font-semibold">{selectedChat.firstName} {selectedChat.lastName}</h3>
          <p className="text-sm text-base-content/70">
            {selectedChat.isOnline ? 'Online':new Date(selectedChat.lastSeen).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
        {messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      <ReplyPreview />

      {/* Show typing indicator */}
      {isTyping(selectedChat._id) && (
        <div className="p-2 text-sm text-base-content/70">
          {selectedChat.username} is typing...
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-base-300">
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-base-200 rounded-lg">
            <span className="text-sm truncate flex-1">
              {selectedFile.name}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="btn btn-ghost btn-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="input input-bordered flex-1"
            disabled={loading}
          />
          
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-ghost"
            disabled={loading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-6 h-6"
            >
              <path d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>

          {/* Send Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || (!newMessage.trim() && !selectedFile)}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;