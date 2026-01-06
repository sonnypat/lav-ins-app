import { useState } from 'react';
import './../../styles/coverage-comparison.css';

const COVERAGE_TIERS = [
  {
    id: 'essential',
    name: 'Essential',
    icon: '🛡️',
    price: 0.012,
    popular: false,
    features: [
      { text: 'Theft protection', included: true },
      { text: 'Loss coverage', included: true },
      { text: 'Damage repair', included: true },
      { text: 'Worldwide coverage', included: false },
      { text: 'No deductible', included: false },
      { text: 'Instant claims', included: false }
    ],
    color: '#6b7280'
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: '✨',
    price: 0.015,
    popular: true,
    features: [
      { text: 'Theft protection', included: true },
      { text: 'Loss coverage', included: true },
      { text: 'Damage repair', included: true },
      { text: 'Worldwide coverage', included: true },
      { text: 'No deductible', included: true },
      { text: 'Instant claims', included: false }
    ],
    color: '#9b59b6'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: '👑',
    price: 0.02,
    popular: false,
    features: [
      { text: 'Theft protection', included: true },
      { text: 'Loss coverage', included: true },
      { text: 'Damage repair', included: true },
      { text: 'Worldwide coverage', included: true },
      { text: 'No deductible', included: true },
      { text: 'Instant claims', included: true }
    ],
    color: '#f59e0b'
  }
];

const CoverageComparison = ({ totalValue, onSelect }) => {
  const [selectedTier, setSelectedTier] = useState('premium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (tierId) => {
    if (isSubmitting) return;

    setSelectedTier(tierId);
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (onSelect) {
      onSelect(tierId);
    }
  };

  return (
    <div className="coverage-comparison">
      <div className="comparison-header">
        <h3>Choose Your Coverage</h3>
        <p>Select the protection level that's right for you</p>
      </div>

      <div className="tiers-container">
        {COVERAGE_TIERS.map((tier, index) => {
          const monthlyPrice = Math.round((totalValue * tier.price) / 12);

          return (
            <div
              key={tier.id}
              className={`tier-card ${selectedTier === tier.id ? 'selected' : ''} ${tier.popular ? 'popular' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleSelect(tier.id)}
            >
              {tier.popular && (
                <div className="popular-badge">Most Popular</div>
              )}

              <div className="tier-header">
                <div className="tier-icon">{tier.icon}</div>
                <div className="tier-name">{tier.name}</div>
              </div>

              <div className="tier-price">
                <span className="price-amount">${monthlyPrice}</span>
                <span className="price-period">/month</span>
              </div>

              <div className="tier-features">
                {tier.features.map((feature, fIndex) => (
                  <div
                    key={fIndex}
                    className={`feature-item ${feature.included ? 'included' : 'excluded'}`}
                  >
                    <span className="feature-icon">
                      {feature.included ? '✓' : '✗'}
                    </span>
                    <span className="feature-text">{feature.text}</span>
                  </div>
                ))}
              </div>

              <button
                className={`select-tier-button ${selectedTier === tier.id ? 'selected' : ''}`}
                disabled={isSubmitting}
              >
                {selectedTier === tier.id ? 'Selected' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="comparison-footer">
        <p>All plans include 24/7 customer support and easy online claims</p>
      </div>
    </div>
  );
};

export default CoverageComparison;
