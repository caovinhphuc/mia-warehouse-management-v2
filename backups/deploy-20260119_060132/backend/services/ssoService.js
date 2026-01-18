/* eslint-disable */
/**
 * Single Sign-On (SSO) Service
 * Handles OAuth2, SAML, and Google OAuth integration
 */

const crypto = require("crypto");
const querystring = require("querystring");

// OAuth2 configuration
const OAUTH2_CONFIG = {
  google: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || "",
    redirectUri:
      process.env.GOOGLE_OAUTH_REDIRECT_URI ||
      "http://localhost:3001/auth/google/callback",
    authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: ["openid", "profile", "email"],
  },
  github: {
    clientId: process.env.GITHUB_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET || "",
    redirectUri:
      process.env.GITHUB_OAUTH_REDIRECT_URI ||
      "http://localhost:3001/auth/github/callback",
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: ["read:user", "user:email"],
  },
  microsoft: {
    clientId: process.env.MICROSOFT_OAUTH_CLIENT_ID || "",
    clientSecret: process.env.MICROSOFT_OAUTH_CLIENT_SECRET || "",
    redirectUri:
      process.env.MICROSOFT_OAUTH_REDIRECT_URI ||
      "http://localhost:3001/auth/microsoft/callback",
    authorizationUrl:
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    userInfoUrl: "https://graph.microsoft.com/v1.0/me",
    scopes: ["openid", "profile", "email"],
  },
};

// OAuth state storage (use Redis in production)
const oauthStates = new Map();

/**
 * Generate OAuth2 authorization URL
 */
const generateAuthorizationUrl = (provider, state = null) => {
  const config = OAUTH2_CONFIG[provider.toLowerCase()];

  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const authState = state || crypto.randomBytes(32).toString("hex");
  oauthStates.set(authState, {
    provider,
    createdAt: Date.now(),
  });

  const params = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scopes.join(" "),
    state: authState,
  };

  return {
    url: `${config.authorizationUrl}?${querystring.stringify(params)}`,
    state: authState,
  };
};

/**
 * Verify OAuth state
 */
const verifyOAuthState = (state) => {
  const stateData = oauthStates.get(state);

  if (!stateData) {
    return false;
  }

  // Check if state is expired (5 minutes)
  if (Date.now() - stateData.createdAt > 5 * 60 * 1000) {
    oauthStates.delete(state);
    return false;
  }

  oauthStates.delete(state);
  return stateData;
};

/**
 * Exchange authorization code for access token
 */
const exchangeCodeForToken = async (provider, code) => {
  const config = OAUTH2_CONFIG[provider.toLowerCase()];

  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  try {
    const response = await fetch(config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: querystring.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();
    return tokenData;
  } catch (error) {
    console.error("Token exchange error:", error);
    throw error;
  }
};

/**
 * Get user info from OAuth provider
 */
const getUserInfo = async (provider, accessToken) => {
  const config = OAUTH2_CONFIG[provider.toLowerCase()];

  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  try {
    const response = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const userInfo = await response.json();

    // Normalize user info across providers
    return normalizeUserInfo(provider, userInfo);
  } catch (error) {
    console.error("Get user info error:", error);
    throw error;
  }
};

/**
 * Normalize user info across different OAuth providers
 */
const normalizeUserInfo = (provider, userInfo) => {
  const normalized = {
    provider,
    id: null,
    email: null,
    name: null,
    picture: null,
    raw: userInfo,
  };

  switch (provider.toLowerCase()) {
    case "google":
      normalized.id = userInfo.id;
      normalized.email = userInfo.email;
      normalized.name = userInfo.name;
      normalized.picture = userInfo.picture;
      break;

    case "github":
      normalized.id = userInfo.id.toString();
      normalized.email = userInfo.email || userInfo.login + "@github.com";
      normalized.name = userInfo.name || userInfo.login;
      normalized.picture = userInfo.avatar_url;
      break;

    case "microsoft":
      normalized.id = userInfo.id;
      normalized.email = userInfo.mail || userInfo.userPrincipalName;
      normalized.name = userInfo.displayName;
      normalized.picture = null; // Microsoft Graph requires separate API call
      break;

    default:
      normalized.id = userInfo.id?.toString() || userInfo.sub?.toString();
      normalized.email = userInfo.email || userInfo.mail;
      normalized.name = userInfo.name || userInfo.displayName;
      normalized.picture = userInfo.picture || userInfo.avatar_url;
  }

  return normalized;
};

/**
 * SAML SSO (simplified implementation)
 */
const generateSAMLAuthnRequest = (idpUrl, spEntityId) => {
  const samlRequest = {
    id: `_${crypto.randomBytes(16).toString("hex")}`,
    issuer: spEntityId,
    destination: idpUrl,
    issueInstant: new Date().toISOString(),
  };

  // In production, use proper SAML library like 'passport-saml'
  return {
    samlRequest: Buffer.from(JSON.stringify(samlRequest)).toString("base64"),
    relayState: crypto.randomBytes(16).toString("hex"),
  };
};

module.exports = {
  generateAuthorizationUrl,
  verifyOAuthState,
  exchangeCodeForToken,
  getUserInfo,
  generateSAMLAuthnRequest,
  supportedProviders: Object.keys(OAUTH2_CONFIG),
};
