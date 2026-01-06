import { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState({
    owner: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      zipCode: ''
    },
    jewelry: {
      hasMultipleItems: '',
      hasMoreItems: '',
      items: [],
      images: []
    },
    coverage: {
      tier: ''
    }
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [quoteResult, setQuoteResult] = useState(null);
  const [flowState, setFlowState] = useState({
    currentStep: 0,
    isComplete: false,
    isLoading: false,
    error: null
  });

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, { ...message, id: Date.now() + Math.random(), timestamp: new Date() }]);
  }, []);

  const updateUserData = useCallback((field, value) => {
    setUserData((prev) => {
      const keys = field.split('.');

      // Handle nested array items (e.g., jewelry.items.0.type)
      if (keys.length === 4 && keys[1] === 'items') {
        const itemIndex = parseInt(keys[2]);
        const itemField = keys[3];
        const newItems = [...(prev[keys[0]]?.items || [])];

        // Ensure the array has enough elements
        while (newItems.length <= itemIndex) {
          newItems.push({});
        }

        newItems[itemIndex] = {
          ...newItems[itemIndex],
          [itemField]: value
        };

        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            items: newItems
          }
        };
      }

      // Handle simple nested fields (e.g., owner.zipCode)
      if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value
          }
        };
      }

      return prev;
    });
  }, []);

  const resetChat = useCallback(() => {
    setMessages([]);
    setUserData({
      owner: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        zipCode: ''
      },
      jewelry: {
        hasMultipleItems: '',
        hasMoreItems: '',
        items: [],
        images: []
      },
      coverage: {
        tier: ''
      }
    });
    setCurrentQuestion(null);
    setQuoteResult(null);
    setFlowState({ currentStep: 0, isComplete: false, isLoading: false, error: null });
  }, []);

  const value = {
    messages,
    setMessages,
    addMessage,
    userData,
    setUserData,
    updateUserData,
    currentQuestion,
    setCurrentQuestion,
    quoteResult,
    setQuoteResult,
    flowState,
    setFlowState,
    resetChat
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
