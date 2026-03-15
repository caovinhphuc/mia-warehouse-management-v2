const PLACEHOLDER_PATTERNS = [/your_/i, /example/i, /placeholder/i, /^xxx$/i];

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function isPlaceholder(value, validator) {
  if (isBlank(value)) {
    return true;
  }

  const normalized = String(value).trim();
  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized))) {
    return true;
  }

  if (validator) {
    return !validator(normalized);
  }

  return false;
}

function hasGooglePrivateKey(value) {
  if (isBlank(value)) {
    return false;
  }

  const normalized = String(value).replace(/\\n/g, "\n");
  return (
    normalized.includes("-----BEGIN PRIVATE KEY-----") &&
    normalized.includes("-----END PRIVATE KEY-----") &&
    !normalized.includes("Your private key here")
  );
}

function isProbablyEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function isTelegramToken(value) {
  return /^\d+:[A-Za-z0-9_-]+$/.test(String(value).trim());
}

function isConfigured(value, validator) {
  return !isPlaceholder(value, validator);
}

module.exports = {
  hasGooglePrivateKey,
  isBlank,
  isConfigured,
  isPlaceholder,
  isProbablyEmail,
  isTelegramToken,
};
