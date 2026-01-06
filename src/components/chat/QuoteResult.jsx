import { useChatContext } from '../../context/ChatContext';
import { saveQuote } from '../../services/socotraAPI';
import { useState } from 'react';
import './../../styles/chat.css';

const QuoteResult = () => {
  const { quoteResult, resetChat } = useChatContext();
  const [saveStatus, setSaveStatus] = useState(null);

  if (!quoteResult) return null;

  const handleSave = async () => {
    const result = await saveQuote(quoteResult);
    setSaveStatus(result.message);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleStartOver = () => {
    resetChat();
    window.location.reload();
  };

  return (
    <div className="quote-result">
      <div className="quote-header">
        <div className="success-icon">✅</div>
        <h2>Your Quote is Ready!</h2>
        <div className="quote-id">Quote #{quoteResult.quoteId?.substring(0, 8) || 'N/A'}</div>
      </div>

      <div className="premium-display">
        <div className="premium-main">
          <div className="premium-label">Your Monthly Payment</div>
          <div className="premium-amount">${quoteResult.monthlyPremium || 0}</div>
          <div className="premium-note">per month</div>
        </div>
        <div className="premium-secondary">
          <div className="premium-label">Total Annual Cost</div>
          <div className="premium-amount">${quoteResult.annualPremium || 0}</div>
          <div className="premium-note">per year • Save ${Math.round((quoteResult.monthlyPremium * 12 - quoteResult.annualPremium) || 0)} with annual payment</div>
        </div>
      </div>

      <div className="jewelry-items">
        <h3>Insured Items</h3>
        <div className="items-list">
          {quoteResult.items && quoteResult.items.map((item, index) => (
            <div key={index} className="jewelry-item">
              <div className="item-icon">💎</div>
              <div className="item-details">
                <div className="item-type">{item.type}</div>
                <div className="item-value">${item.value?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="total-coverage">
          <span>Total Coverage Value</span>
          <span className="total-value">${quoteResult.totalValue?.toLocaleString()}</span>
        </div>
      </div>

      <div className="coverage-breakdown">
        <h3>Coverage Details</h3>
        <div className="breakdown-list">
          <div className="breakdown-item">
            <span>Base Monthly Premium</span>
            <span>${quoteResult.coverageBreakdown?.baseMonthly || quoteResult.monthlyPremium}/mo</span>
          </div>
          {quoteResult.coverageBreakdown?.multiItemDiscount && quoteResult.coverageBreakdown.multiItemDiscount !== 'N/A' && (
            <div className="breakdown-item discount">
              <span>Multi-Item Discount</span>
              <span>-{quoteResult.coverageBreakdown.multiItemDiscount}</span>
            </div>
          )}
          <div className="breakdown-item">
            <span>Coverage Type</span>
            <span>All Risk (Theft, Loss, Damage)</span>
          </div>
        </div>
      </div>

      <div className="policy-info">
        <h3>Policy Information</h3>
        <p>Location: {quoteResult.ownerInfo?.zipCode}</p>
        <p>Effective Date: {new Date(quoteResult.effectiveDate).toLocaleDateString()}</p>
      </div>

      <div className="quote-validity">
        <p>This quote is valid until {new Date(quoteResult.expirationDate).toLocaleDateString()}</p>
      </div>

      <div className="quote-actions">
        <button onClick={handleSave} className="action-button primary">
          Save Quote
        </button>
        <button onClick={handleStartOver} className="action-button secondary">
          Start Over
        </button>
      </div>

      {saveStatus && <div className="save-status">{saveStatus}</div>}
    </div>
  );
};

export default QuoteResult;
