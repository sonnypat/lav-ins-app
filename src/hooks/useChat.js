import { useCallback } from 'react';
import { useChatContext } from '../context/ChatContext';
import { MESSAGE_TYPES } from '../constants/messageTypes';

export const useChat = () => {
  const { messages, addMessage } = useChatContext();

  const addBotMessage = useCallback((content, delay = 1000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        addMessage({
          type: MESSAGE_TYPES.BOT,
          content
        });
        resolve();
      }, delay);
    });
  }, [addMessage]);

  const addUserMessage = useCallback((content) => {
    addMessage({
      type: MESSAGE_TYPES.USER,
      content
    });
  }, [addMessage]);

  return {
    messages,
    addBotMessage,
    addUserMessage
  };
};
