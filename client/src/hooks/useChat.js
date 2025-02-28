import { useChat } from '../context/ChatContext';

export const useChatService = () => {
  const chat = useChat();
  return chat;
};