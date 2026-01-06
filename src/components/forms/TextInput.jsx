import { useState, useEffect } from 'react';
import './../../styles/forms.css';

const TextInput = ({ placeholder, onSubmit, validation, autoFocus = true, defaultValue = '' }) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState(null);

  // Update value when defaultValue changes (for test mode)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validation) {
      const result = validation(value);
      if (!result.isValid) {
        setError(result.error);
        return;
      }
    }
    onSubmit(value.trim());
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
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`text-input ${error ? 'input-error' : ''}`}
          autoFocus={autoFocus}
          autoComplete="off"
        />
        <button type="submit" className="submit-button" disabled={!value.trim()}>
          Send
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default TextInput;
