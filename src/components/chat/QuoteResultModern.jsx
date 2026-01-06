import { useChatContext } from '../../context/ChatContext';
import { saveQuote } from '../../services/socotraAPI';
import { useState } from 'react';
import './../../styles/quote-result-modern.css';

const QuoteResultModern = () => {
  const { quoteResult, resetChat } = useChatContext();
  const [saveStatus, setSaveStatus] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('monthly');

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

  const monthlyPrice = quoteResult.monthlyPremium || 0;
  const annualPrice = quoteResult.annualPremium || 0;
  const savings = Math.round((monthlyPrice * 12 - annualPrice) || 0);

  return (
    <div className="quote-result-modern">
      {/* Success Header */}
      <div className="quote-success-header">
        <div className="success-icon-container">
          <div className="success-checkmark">✓</div>
        </div>
        <h2 className="success-title">Your Quote is Ready</h2>
        <p className="success-subtitle">
          Comprehensive coverage for your precious jewelry
        </p>
      </div>

      {/* Payment Toggle */}
      <div className="payment-toggle-container">
        <div className="payment-toggle">
          <button
            className={`payment-option ${selectedPayment === 'monthly' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('monthly')}
          >
            <span className="payment-label">Monthly</span>
          </button>
          <button
            className={`payment-option ${selectedPayment === 'annual' ? 'active' : ''}`}
            onClick={() => setSelectedPayment('annual')}
          >
            <span className="payment-label">Annual</span>
            {savings > 0 && (
              <span className="payment-savings">Save ${savings}</span>
            )}
          </button>
        </div>
      </div>

      {/* Premium Card */}
      <div className="premium-card-modern">
        <div className="premium-amount-large">
          ${selectedPayment === 'monthly' ? monthlyPrice : annualPrice}
        </div>
        <div className="premium-period">
          per {selectedPayment === 'monthly' ? 'month' : 'year'}
        </div>
        {selectedPayment === 'annual' && savings > 0 && (
          <div className="annual-savings-note">
            Save ${savings} compared to monthly payments
          </div>
        )}
      </div>

      {/* Coverage Summary */}
      <div className="coverage-summary-grid">
        <div className="summary-card">
          <div className="summary-icon">💎</div>
          <div className="summary-content">
            <div className="summary-label">Total Value</div>
            <div className="summary-value">${quoteResult.totalValue?.toLocaleString()}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">🛡️</div>
          <div className="summary-content">
            <div className="summary-label">Coverage</div>
            <div className="summary-value">Full Protection</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📍</div>
          <div className="summary-content">
            <div className="summary-label">Location</div>
            <div className="summary-value">{quoteResult.ownerInfo?.zipCode}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">📅</div>
          <div className="summary-content">
            <div className="summary-label">Effective</div>
            <div className="summary-value">
              {new Date(quoteResult.effectiveDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="items-section-modern">
        <h3 className="section-title">Insured Items</h3>
        <div className="items-grid">
          {quoteResult.items && quoteResult.items.map((item, index) => (
            <div key={index} className="item-card-modern">
              <div className="item-icon-modern">💎</div>
              <div className="item-info">
                <div className="item-type-modern">{item.type}</div>
                <div className="item-value-modern">${item.value?.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Features */}
      <div className="features-section">
        <h3 className="section-title">What's Covered</h3>
        <div className="features-grid">
          <div className="feature-item-modern">
            <div className="feature-check">✓</div>
            <span>Theft & Mysterious Disappearance</span>
          </div>
          <div className="feature-item-modern">
            <div className="feature-check">✓</div>
            <span>Loss & Damage</span>
          </div>
          <div className="feature-item-modern">
            <div className="feature-check">✓</div>
            <span>Worldwide Coverage</span>
          </div>
          <div className="feature-item-modern">
            <div className="feature-check">✓</div>
            <span>No Deductible</span>
          </div>
          <div className="feature-item-modern">
            <div className="feature-check">✓</div>
            <span>Fast Claims Processing</span>
          </div>
          <div className="feature-item-modern">
            <div className="feature-check">✓</div>
            <span>24/7 Customer Support</span>
          </div>
        </div>
      </div>

      {/* Quote Details */}
      <div className="quote-details">
        <div className="detail-row">
          <span className="detail-label">Quote ID</span>
          <span className="detail-value">#{quoteResult.quoteId?.substring(0, 8)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Valid Until</span>
          <span className="detail-value">
            {new Date(quoteResult.expirationDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="quote-actions-modern">
        <button onClick={handleSave} className="action-btn primary-btn">
          <span className="btn-icon">💾</span>
          Save Quote
        </button>
        <button onClick={handleStartOver} className="action-btn secondary-btn">
          <span className="btn-icon">🔄</span>
          Start Over
        </button>
      </div>

      {saveStatus && (
        <div className="save-status-modern">{saveStatus}</div>
      )}
    </div>
  );
};

export default QuoteResultModern;
