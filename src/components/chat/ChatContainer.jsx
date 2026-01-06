import { useEffect, useState } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { useChat } from '../../hooks/useChat';
import { useQuoteFlow } from '../../hooks/useQuoteFlow';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuoteResultModern from './QuoteResultModern';
import ProgressStepper from './ProgressStepper';
import ItemSummaryCards from './ItemSummaryCards';
import PurchaseActions from './PurchaseActions';
import Confetti from './Confetti';
import './../../styles/chat.css';

const ChatContainer = () => {
  const { quoteResult, flowState, userData } = useChatContext();
  const { messages } = useChat();
  const { startFlow, isLoading, currentQuestion } = useQuoteFlow();
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

  // Show item summary in right panel before coverage selection
  const shouldShowItemSummaryInPanel = hasCompleteItems &&
                                        !quoteResult &&
                                        currentQuestion?.id !== 'coverage_tier' &&
                                        !currentQuestion?.id?.startsWith('owner_');

  // Determine if current question needs rich media input
  const isRichMediaQuestion = !quoteResult && (
    currentQuestion?.inputType === 'coverage_comparison' ||
    currentQuestion?.inputType === 'image_upload' ||
    (currentQuestion?.id?.includes('item') && currentQuestion?.id?.includes('type')) ||
    currentQuestion?.id?.includes('value')
  );

  // Show right panel for: rich media questions, item summary, or quote result
  const showRightPanel = isRichMediaQuestion || shouldShowItemSummaryInPanel || quoteResult;

  return (
    <div className="chat-layout">
      <Confetti show={showConfetti} duration={4000} />

      <div className="chat-header">
        <div className="header-icon">💎</div>
        <div className="header-text">
          <h1>Lavalier Jewelry Insurance</h1>
          <p>Personalized jewelry coverage, quickly and simply</p>
        </div>

        <div className="trust-badges">
          <div className="trust-badge">
            <div className="trust-badge-label">A.M. Best Rating</div>
            <div className="trust-badge-value">A</div>
          </div>
          <div className="trust-badge">
            <div className="trust-badge-label">S&P Rating</div>
            <div className="trust-badge-value">A+</div>
          </div>
        </div>

        <div className="sidebar-features">
          <div className="sidebar-feature">
            <span className="feature-icon">✓</span>
            <span>Worldwide coverage</span>
          </div>
          <div className="sidebar-feature">
            <span className="feature-icon">✓</span>
            <span>Easy claims settlement</span>
          </div>
          <div className="sidebar-feature">
            <span className="feature-icon">✓</span>
            <span>No deductible</span>
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className={`chat-container ${showRightPanel ? 'has-right-panel' : ''}`}>
          {!quoteResult && <ProgressStepper />}

          <div className="chat-content">
            <MessageList messages={messages} isTyping={isLoading} />
            {/* Show quote inline on mobile (hidden on desktop via CSS) */}
            {quoteResult && (
              <div className="mobile-quote-container">
                <QuoteResultModern />
              </div>
            )}
          </div>

          {!quoteResult && <ChatInput showRichMedia={false} />}
          {quoteResult && <PurchaseActions />}
        </div>

        {showRightPanel && (
          <div className={`rich-media-panel ${isRichMediaQuestion ? 'has-connector' : ''}`}>
            {/* Visual connector indicator */}
            {isRichMediaQuestion && <div className="panel-connector" />}

            {/* Rich media input for current question */}
            {isRichMediaQuestion && <ChatInput showRichMedia={true} />}

            {/* Item summary when not on rich media question */}
            {shouldShowItemSummaryInPanel && !isRichMediaQuestion && <ItemSummaryCards />}

            {/* Quote result in right panel */}
            {quoteResult && <QuoteResultModern />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
