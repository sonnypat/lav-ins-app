import { useChatContext } from '../../context/ChatContext';

const PurchaseActions = () => {
  const { quoteResult, resetChat } = useChatContext();

  if (!quoteResult) return null;

  const handlePurchase = () => {
    // This would integrate with the actual purchase flow
    alert('This would redirect to the purchase/binding flow. For now, the quote has been saved.');
  };

  const handleStartOver = () => {
    resetChat();
    window.location.reload();
  };

  const handleSaveForLater = () => {
    alert('Quote saved! We\'ll send you an email with your quote details.');
  };

  return (
    <div className="purchase-actions-container">
      <button onClick={handlePurchase} className="purchase-btn primary">
        Yes, Purchase Policy
      </button>
      <button onClick={handleSaveForLater} className="purchase-btn secondary">
        Save for Later
      </button>
      <button onClick={handleStartOver} className="purchase-btn tertiary">
        Start New Quote
      </button>
    </div>
  );
};

export default PurchaseActions;
