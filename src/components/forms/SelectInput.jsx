import { useState, useEffect } from 'react';
import './../../styles/forms.css';

const SelectInput = ({ options, onSubmit, validation, autoFocus = true, defaultValue = '' }) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(null);

  // Update value when defaultValue changes (for test mode)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value) {
      setError('Please select an option');
      return;
    }
    if (validation) {
      const result = validation(value);
      if (!result.isValid) {
        setError(result.error);
        return;
      }
    }
    onSubmit(value);
    setValue('');
    setError(null);
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    if (error) setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="input-form">
      <div className="input-wrapper">
        <select
          value={value}
          onChange={handleChange}
          className={`select-input ${error ? 'input-error' : ''}`}
          autoFocus={autoFocus}
          autoComplete="off"
        >
          <option value="">-- Select an option --</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="submit" className="submit-button" disabled={!value}>
          Send
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default SelectInput;
