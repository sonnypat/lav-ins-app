import { useState, useEffect } from 'react';
import './../../styles/value-slider.css';

const VALUE_PRESETS = [
  { value: 1000, label: '$1K' },
  { value: 5000, label: '$5K' },
  { value: 10000, label: '$10K' },
  { value: 25000, label: '$25K' },
  { value: 50000, label: '$50K' },
  { value: 100000, label: '$100K+' }
];

const ValueSlider = ({ onSubmit, defaultValue, validation }) => {
  const [value, setValue] = useState(defaultValue || 5000);
  const [customInput, setCustomInput] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estimate monthly premium (rough calculation for preview)
  const estimatedMonthlyPremium = Math.round(value * 0.015 / 12);

  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    setError('');
  };

  const handlePresetClick = (presetValue) => {
    setValue(presetValue);
    setShowCustom(false);
    setError('');
  };

  const handleCustomInputChange = (e) => {
    const input = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(input);
    if (input) {
      setValue(parseInt(input) || 0);
    }
    setError('');
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validate
    if (validation) {
      const validationResult = validation(value);
      if (!validationResult.isValid) {
        setError(validationResult.error);
        return;
      }
    }

    if (value < 100) {
      setError('Minimum value is $100');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    onSubmit(value);
  };

  // Calculate slider position percentage for gradient
  const minLog = Math.log(100);
  const maxLog = Math.log(150000);
  const valueLog = Math.log(Math.max(100, Math.min(150000, value)));
  const percentage = ((valueLog - minLog) / (maxLog - minLog)) * 100;

  return (
    <div className="value-slider-container">
      <div className="value-display">
        <div className="value-amount">
          ${value.toLocaleString()}
        </div>
        <div className="premium-preview">
          <span className="premium-label">Est. monthly premium:</span>
          <span className="premium-amount">${estimatedMonthlyPremium}/mo</span>
        </div>
      </div>

      <div className="slider-wrapper">
        <input
          type="range"
          min="100"
          max="150000"
          value={value}
          onChange={handleSliderChange}
          className="value-range-slider"
          style={{
            background: `linear-gradient(to right, #9b59b6 0%, #a855f7 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%)`
          }}
        />
        <div className="slider-labels">
          <span>$100</span>
          <span>$150K</span>
        </div>
      </div>

      <div className="preset-buttons">
        {VALUE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            className={`preset-button ${value === preset.value ? 'active' : ''}`}
            onClick={() => handlePresetClick(preset.value)}
            disabled={isSubmitting}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="custom-input-section">
        {showCustom ? (
          <div className="custom-input-wrapper">
            <span className="currency-symbol">$</span>
            <input
              type="text"
              value={customInput}
              onChange={handleCustomInputChange}
              placeholder="Enter exact amount"
              className="custom-value-input"
              autoFocus
            />
          </div>
        ) : (
          <button
            className="show-custom-button"
            onClick={() => setShowCustom(true)}
            disabled={isSubmitting}
          >
            Enter exact amount
          </button>
        )}
      </div>

      {error && <div className="value-error">{error}</div>}

      <button
        className="submit-value-button"
        onClick={handleSubmit}
        disabled={isSubmitting || value < 100}
      >
        {isSubmitting ? (
          <span className="button-loading">
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
          </span>
        ) : (
          <>Continue with ${value.toLocaleString()}</>
        )}
      </button>
    </div>
  );
};

export default ValueSlider;
