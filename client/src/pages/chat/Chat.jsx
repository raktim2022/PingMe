import React from 'react';
import ChatList from '../../components/chat/ChatList';
import ChatBox from '../../components/chat/ChatBox';
import { useChat } from '../../context/ChatContext';

const Chat = () => {
  const { selectedChat } = useChat();

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-base-200">
      {/* Chat List - Left Side */}
      <div className="w-1/4 border-r border-base-300 bg-base-100">
        <ChatList />
      </div>

      {/* Chat Area - Right Side */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatBox />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-base-content/70">
                Select a chat to start messaging
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;