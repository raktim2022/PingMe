import React, { useEffect, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const ChatList = () => {
  const { getAllUsers, users, selectedChat, setSelectedChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserSelect = (user) => {
    if (selectedChat?._id === user._id) {
      setSelectedChat(null); // Deselect if clicking the same user
    } else {
      setSelectedChat(user); // Select new user
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-base-300">
        <div className="form-control">
          <input
            type="text"
            placeholder="Search users..."
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleUserSelect(user)}
            className={`flex items-center gap-3 p-4 cursor-pointer transition-colors
              ${selectedChat?._id === user._id 
                ? 'bg-primary/10 hover:bg-primary/20' 
                : 'hover:bg-base-200'
              }`}
          >
            <div className={`avatar ${user.isOnline ? 'online' : 'offline'}`}>
              <div className="w-12 rounded-full">
                <img
                  src={user.avatar || "/default-avatar.png"}
                  alt={user.username}
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${
                selectedChat?._id === user._id ? 'text-primary' : ''
              }`}>
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-base-content/70 truncate">
                {user.status || 'Hey there! I am using PingMe'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;