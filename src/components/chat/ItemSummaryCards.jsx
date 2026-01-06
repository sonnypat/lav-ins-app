import { useChatContext } from '../../context/ChatContext';
import './../../styles/item-summary.css';

const JEWELRY_ICONS = {
  'Engagement Ring': '💍',
  'Wedding Ring': '💒',
  'Necklace': '📿',
  'Bracelet': '⭐',
  'Earrings': '✨',
  'Watch': '⌚',
  'Other': '💎'
};

const ItemSummaryCards = () => {
  const { userData } = useChatContext();
  const items = userData.jewelry?.items || [];

  // Filter out incomplete items
  const completeItems = items.filter(item => item?.type && item?.value);

  if (completeItems.length === 0) return null;

  const totalValue = completeItems.reduce((sum, item) => sum + (item?.value || 0), 0);
  const estimatedMonthly = Math.round(totalValue * 0.015 / 12);

  return (
    <div className="item-summary-container">
      <div className="summary-header">
        <div className="summary-icon">🛡️</div>
        <div className="summary-title">Your Coverage</div>
      </div>

      <div className="items-stack">
        {completeItems.map((item, index) => (
          <div
            key={index}
            className="item-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="item-card-icon">
              {JEWELRY_ICONS[item.type] || '💎'}
            </div>
            <div className="item-card-details">
              <div className="item-card-type">{item.type}</div>
              <div className="item-card-value">${item.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="summary-totals">
        <div className="total-row">
          <span className="total-label">Total Value</span>
          <span className="total-value">${totalValue.toLocaleString()}</span>
        </div>
        <div className="total-row premium">
          <span className="total-label">Est. Premium</span>
          <span className="total-premium">${estimatedMonthly}/mo</span>
        </div>
      </div>

      <div className="coverage-badge">
        <span className="badge-icon">✓</span>
        <span className="badge-text">Full coverage: theft, loss & damage</span>
      </div>
    </div>
  );
};

export default ItemSummaryCards;
