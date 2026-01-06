import { useEffect, useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useChat } from '../../hooks/useChat';
import { useQuoteFlow } from '../../hooks/useQuoteFlow';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuoteResultModern from './QuoteResultModern';
import ProgressStepper from './ProgressStepper';
import ItemSummaryCards from './ItemSummaryCards';
import Confetti from './Confetti';
import './../../styles/chat.css';

const ChatContainer = () => {
  const { quoteResult, flowState, userData } = useChatContext();
  const { messages } = useChat();
  const { startFlow, isLoading } = useQuoteFlow();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Start the conversation flow when component mounts
    if (flowState.currentStep === 0) {
      startFlow();
    }
  }, [startFlow, flowState.currentStep]);

  // Show confetti when quote is generated
  useEffect(() => {
    if (quoteResult) {
      setShowConfetti(true);
    }
  }, [quoteResult]);

  // Check if we have any complete items to show summary
  const hasCompleteItems = userData.jewelry?.items?.some(
    item => item?.type && item?.value
  );

  return (
    <div className="chat-container">
      <Confetti show={showConfetti} duration={4000} />

      <div className="chat-header">
        <div className="header-icon">💎</div>
        <div className="header-text">
          <h1>Lavalier Jewelry Insurance</h1>
          <p>Protect your precious jewelry with personalized coverage</p>
        </div>
      </div>

      {!quoteResult && <ProgressStepper />}

      <MessageList messages={messages} isTyping={isLoading}>
        {hasCompleteItems && !quoteResult && <ItemSummaryCards />}
      </MessageList>

      {quoteResult && <QuoteResultModern />}

      {!quoteResult && <ChatInput />}
    </div>
  );
};

export default ChatContainer;
