// Validation utilities

// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation (Vietnamese format)
export const isValidPhoneVN = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// URL validation
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Google Sheet ID validation
export const isValidSheetId = (sheetId) => {
  const sheetIdRegex = /^[a-zA-Z0-9-_]{44}$/;
  return sheetIdRegex.test(sheetId);
};

// Google Drive folder ID validation
export const isValidDriveFolderId = (folderId) => {
  const folderIdRegex = /^[a-zA-Z0-9-_]{25,}$/;
  return folderIdRegex.test(folderId);
};

// Number validation
export const isValidNumber = (value) => {
  return !isNaN(value) && isFinite(value);
};

// Integer validation
export const isValidInteger = (value) => {
  return Number.isInteger(Number(value));
};

// Positive number validation
export const isValidPositiveNumber = (value) => {
  return isValidNumber(value) && Number(value) > 0;
};

// Date validation
export const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

// Required field validation
export const isRequired = (value) => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined && value !== "";
};

// String length validation
export const isValidLength = (value, min = 0, max = Infinity) => {
  if (typeof value !== "string") return false;
  return value.length >= min && value.length <= max;
};

// Password strength validation
export const isValidPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return {
    isValid:
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  };
};

// Vietnamese ID card validation
export const isValidVietnamID = (id) => {
  const idRegex = /^[0-9]{9,12}$/;
  return idRegex.test(id);
};

// Vietnamese tax code validation
export const isValidVietnamTaxCode = (taxCode) => {
  const taxCodeRegex = /^[0-9]{10,13}$/;
  return taxCodeRegex.test(taxCode);
};

// Currency validation (Vietnamese Dong)
export const isValidCurrency = (amount) => {
  const currencyRegex = /^[0-9,]+(\.[0-9]{1,2})?$/;
  return currencyRegex.test(amount.toString());
};

// Percentage validation
export const isValidPercentage = (percentage) => {
  return isValidNumber(percentage) && percentage >= 0 && percentage <= 100;
};

// Range validation
export const isValidRange = (value, min, max) => {
  return isValidNumber(value) && value >= min && value <= max;
};

// Array validation
export const isValidArray = (value) => {
  return Array.isArray(value);
};

// Non-empty array validation
export const isValidNonEmptyArray = (value) => {
  return Array.isArray(value) && value.length > 0;
};

// Object validation
export const isValidObject = (value) => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

// File name validation
export const isValidFileName = (filename) => {
  const invalidChars = /[<>:"/\\|?*]/;
  return !invalidChars.test(filename) && filename.trim().length > 0;
};

// Google Sheets range validation
export const isValidSheetRange = (range) => {
  const rangeRegex = /^[A-Za-z]+[0-9]+:[A-Za-z]+[0-9]+$/;
  return rangeRegex.test(range);
};

// Color validation (hex)
export const isValidHexColor = (color) => {
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
};

// IP address validation
export const isValidIPAddress = (ip) => {
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};

  for (const field in rules) {
    const value = formData[field];
    const fieldRules = rules[field];

    for (const rule of fieldRules) {
      const { type, message, ...options } = rule;

      let isValid = true;

      switch (type) {
        case "required":
          isValid = isRequired(value);
          break;
        case "email":
          isValid = isValidEmail(value);
          break;
        case "phone":
          isValid = isValidPhoneVN(value);
          break;
        case "url":
          isValid = isValidURL(value);
          break;
        case "number":
          isValid = isValidNumber(value);
          break;
        case "integer":
          isValid = isValidInteger(value);
          break;
        case "positive":
          isValid = isValidPositiveNumber(value);
          break;
        case "length":
          isValid = isValidLength(value, options.min, options.max);
          break;
        case "range":
          isValid = isValidRange(value, options.min, options.max);
          break;
        case "sheetId":
          isValid = isValidSheetId(value);
          break;
        case "folderId":
          isValid = isValidDriveFolderId(value);
          break;
        case "custom":
          isValid = options.validator ? options.validator(value) : true;
          break;
        default:
          isValid = true;
      }

      if (!isValid) {
        errors[field] = message;
        break; // Stop at first error for this field
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, ""); // Remove event handlers
};

// Format validation error messages
export const formatValidationErrors = (errors) => {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message: `${field}: ${message}`,
  }));
};

// Common validation rules
export const commonRules = {
  required: (message = "This field is required") => ({
    type: "required",
    message,
  }),

  email: (message = "Please enter a valid email address") => ({
    type: "email",
    message,
  }),

  phone: (message = "Please enter a valid phone number") => ({
    type: "phone",
    message,
  }),

  url: (message = "Please enter a valid URL") => ({
    type: "url",
    message,
  }),

  number: (message = "Please enter a valid number") => ({
    type: "number",
    message,
  }),

  positive: (message = "Please enter a positive number") => ({
    type: "positive",
    message,
  }),

  length: (min, max, message) => ({
    type: "length",
    min,
    max,
    message: message || `Length must be between ${min} and ${max} characters`,
  }),

  range: (min, max, message) => ({
    type: "range",
    min,
    max,
    message: message || `Value must be between ${min} and ${max}`,
  }),

  sheetId: (message = "Please enter a valid Google Sheet ID") => ({
    type: "sheetId",
    message,
  }),

  folderId: (message = "Please enter a valid Google Drive folder ID") => ({
    type: "folderId",
    message,
  }),

  custom: (validator, message) => ({
    type: "custom",
    validator,
    message,
  }),
};
