import { useState } from 'react';
import './../../styles/jewelry-cards.css';

const JEWELRY_TYPES = [
  { value: 'Engagement Ring', icon: '💍', description: 'Diamond & gemstone rings' },
  { value: 'Wedding Ring', icon: '💒', description: 'Wedding bands & sets' },
  { value: 'Necklace', icon: '📿', description: 'Chains, pendants & chokers' },
  { value: 'Bracelet', icon: '⭐', description: 'Bangles, cuffs & chains' },
  { value: 'Earrings', icon: '✨', description: 'Studs, hoops & drops' },
  { value: 'Watch', icon: '⌚', description: 'Luxury timepieces' },
  { value: 'Other', icon: '💎', description: 'Brooches, anklets & more' }
];

const JewelryTypeCards = ({ onSubmit, defaultValue }) => {
  const [selected, setSelected] = useState(defaultValue || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = async (type) => {
    if (isSubmitting) return;

    setSelected(type.value);
    setIsSubmitting(true);

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    onSubmit(type.value);
  };

  return (
    <div className="jewelry-type-cards">
      <div className="cards-grid">
        {JEWELRY_TYPES.map((type, index) => (
          <button
            key={type.value}
            className={`jewelry-card ${selected === type.value ? 'selected' : ''}`}
            onClick={() => handleSelect(type)}
            disabled={isSubmitting}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="card-icon">{type.icon}</div>
            <div className="card-content">
              <div className="card-title">{type.value}</div>
              <div className="card-description">{type.description}</div>
            </div>
            {selected === type.value && (
              <div className="card-check">✓</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JewelryTypeCards;
