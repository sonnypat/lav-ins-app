import { useChatContext } from '../../context/ChatContext';
import { issueQuote } from '../../services/socotraAPI';
import { useState } from 'react';

const PurchaseActions = () => {
  const { quoteResult, resetChat } = useChatContext();
  const [isIssuing, setIsIssuing] = useState(false);
  const [issueError, setIssueError] = useState(null);
  const [issueSuccess, setIssueSuccess] = useState(false);

  if (!quoteResult) return null;

  const handlePurchase = async () => {
    if (!quoteResult.quoteLocator) {
      alert('Quote locator is missing. Please generate a new quote.');
      return;
    }

    setIsIssuing(true);
    setIssueError(null);
    setIssueSuccess(false);

    try {
      console.log('[Purchase] Issuing quote:', quoteResult.quoteLocator);
      const result = await issueQuote(quoteResult.quoteLocator);

      if (result.success) {
        setIssueSuccess(true);
        alert(`Policy issued successfully! Policy ID: ${result.policyLocator}`);
        console.log('[Purchase] ✅ Policy issued:', result.policyLocator);
      } else {
        // Handle validation errors
        if (result.validationErrors && result.validationErrors.length > 0) {
          const errorMessages = result.validationErrors.map(err => 
            typeof err === 'string' ? err : err.message || JSON.stringify(err)
          ).join('\n');
          setIssueError(`Validation errors:\n${errorMessages}`);
          alert(`Cannot issue policy due to validation errors:\n\n${errorMessages}`);
        } else {
          setIssueError(result.error || 'Failed to issue policy');
          alert(`Failed to issue policy: ${result.error || 'Unknown error'}`);
        }
        console.error('[Purchase] ❌ Failed to issue policy:', result);
      }
    } catch (error) {
      setIssueError(error.message || 'An unexpected error occurred');
      alert(`Error: ${error.message || 'An unexpected error occurred'}`);
      console.error('[Purchase] ❌ Error issuing quote:', error);
    } finally {
      setIsIssuing(false);
    }
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
      {issueError && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '10px', 
          backgroundColor: '#fee', 
          color: '#c33', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {issueError}
        </div>
      )}
      {issueSuccess && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '10px', 
          backgroundColor: '#efe', 
          color: '#3c3', 
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          Policy issued successfully!
        </div>
      )}
      <button 
        onClick={handlePurchase} 
        className="purchase-btn primary"
        disabled={isIssuing}
      >
        {isIssuing ? 'Issuing Policy...' : 'Get Started'}
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
