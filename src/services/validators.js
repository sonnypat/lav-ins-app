// Input Validation Functions

export const validators = {
  firstName: (value) => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Please enter your first name' };
    }
    if (value.trim().length < 2) {
      return { isValid: false, error: 'First name must be at least 2 characters' };
    }
    return { isValid: true, error: null };
  },

  lastName: (value) => {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: 'Please enter your last name' };
    }
    if (value.trim().length < 2) {
      return { isValid: false, error: 'Last name must be at least 2 characters' };
    }
    return { isValid: true, error: null };
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || !emailRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    return { isValid: true, error: null };
  },

  phone: (value) => {
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    const digitsOnly = value.replace(/\D/g, '');
    if (!phoneRegex.test(value) || digitsOnly.length < 10) {
      return { isValid: false, error: 'Please enter a valid phone number' };
    }
    return { isValid: true, error: null };
  },

  appraisedValue: (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Please enter a valid value' };
    }
    if (numValue < 500) {
      return { isValid: false, error: 'Minimum insurable value is $500' };
    }
    if (numValue > 1000000) {
      return { isValid: false, error: 'For items over $1M, please contact us directly' };
    }
    return { isValid: true, error: null };
  },

  caratWeight: (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Please enter a valid carat weight' };
    }
    if (numValue <= 0) {
      return { isValid: false, error: 'Carat weight must be greater than 0' };
    }
    if (numValue > 50) {
      return { isValid: false, error: 'Please enter a realistic carat weight' };
    }
    return { isValid: true, error: null };
  },

  date: (value) => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(value)) {
      return { isValid: false, error: 'Please enter date in MM/DD/YYYY format' };
    }

    const [month, day, year] = value.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();

    if (date > now) {
      return { isValid: false, error: 'Purchase date cannot be in the future' };
    }

    const minDate = new Date(1900, 0, 1);
    if (date < minDate) {
      return { isValid: false, error: 'Please enter a valid purchase date' };
    }

    return { isValid: true, error: null };
  },

  zipCode: (value) => {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(value)) {
      return { isValid: false, error: 'Please enter a valid 5-digit zip code' };
    }
    return { isValid: true, error: null };
  },

  jewelryValue: (value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Please enter a valid value' };
    }
    if (numValue < 500) {
      return { isValid: false, error: 'Minimum insurable value is $500' };
    }
    if (numValue > 1000000) {
      return { isValid: false, error: 'For items over $1M, please contact us directly' };
    }
    return { isValid: true, error: null };
  }
};
