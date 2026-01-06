import { useChatContext } from '../../context/ChatContext';

const PurchaseActions = () => {
  const { quoteResult, resetChat } = useChatContext();

  if (!quoteResult) return null;

  const handlePurchase = () => {
    // This would integrate with the actual purchase/binding flow
    alert('Ready to apply for coverage! This would take you to our secure application in under 10 minutes.');
  };

  const handleStartOver = () => {
    resetChat();
    window.location.reload();
  };

  const handleSaveForLater = () => {
    alert('Quote saved! We\'ll email you the details so you can review at your convenience.');
  };

  return (
    <div className="purchase-actions-container">
      <button onClick={handlePurchase} className="purchase-btn primary">
        Get Started
      </button>
      <button onClick={handleSaveForLater} className="purchase-btn secondary">
        Email Quote
      </button>
      <button onClick={handleStartOver} className="purchase-btn tertiary">
        New Quote
      </button>
    </div>
  );
};

export default PurchaseActions;
