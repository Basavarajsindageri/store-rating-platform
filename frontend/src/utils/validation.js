/**
 * Client-side validation utilities mirroring backend rules
 */

export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  const len = name.trim().length;
  if (len < 20 || len > 60) return 'Name must be between 20 and 60 characters';
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email.trim())) return 'Must be a valid email address';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8 || password.length > 16) {
    return 'Password must be between 8 and 16 characters long';
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || !address.trim()) return 'Address is required';
  if (address.trim().length > 400) return 'Address cannot exceed 400 characters';
  return null;
};

export const validateRating = (rating) => {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return 'Rating must be an integer between 1 and 5';
  }
  return null;
};
