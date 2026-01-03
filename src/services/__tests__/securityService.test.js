/**
 * Unit Tests for Security Service
 * Tests authentication, MFA, and security functions
 */

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock importMetaEnv
jest.mock("../../utils/importMetaEnv", () => ({
  __esModule: true,
  default: {
    VITE_API_URL: "http://localhost:8000",
    REACT_APP_API_URL: "http://localhost:8000",
  },
}));

import * as securityService from "../securityService";

describe("SecurityService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    fetch.mockClear();
    console.error = jest.fn();
  });

  describe("registerUser", () => {
    it("should register user successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", email: "test@example.com", role: "user" },
          token: "test-token",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await securityService.registerUser(
        "test@example.com",
        "password123",
        "user"
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            role: "user",
          }),
        }
      );
      expect(result).toEqual(mockResponse.data);
      // registerUser doesn't set token, only loginUser does
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });

    it("should handle registration errors", async () => {
      const mockResponse = {
        success: false,
        error: "Email already exists",
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse,
      });

      await expect(
        securityService.registerUser("existing@example.com", "password123")
      ).rejects.toThrow("Email already exists");
    });

    it("should handle network errors", async () => {
      fetch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(
        securityService.registerUser("test@example.com", "password123")
      ).rejects.toThrow();
    });
  });

  describe("loginUser", () => {
    it("should login user successfully", async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", email: "test@example.com" },
          token: "login-token",
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await securityService.loginUser(
        "test@example.com",
        "password123"
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            mfaToken: null,
          }),
        }
      );
      expect(result).toEqual(mockResponse.data);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "authToken",
        "login-token"
      );
    });

    it("should handle MFA requirement", async () => {
      const mockResponse = {
        success: true,
        requiresMFA: true,
        message: "MFA token required",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await securityService.loginUser(
        "test@example.com",
        "password123"
      );

      expect(result.requiresMFA).toBe(true);
      expect(result.message).toBe("MFA token required");
    });

    it("should handle login errors", async () => {
      const mockResponse = {
        success: false,
        error: "Invalid credentials",
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockResponse,
      });

      await expect(
        securityService.loginUser("test@example.com", "wrong-password")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logoutUser", () => {
    it("should logout user and clear token", () => {
      localStorageMock.setItem("authToken", "test-token");
      localStorageMock.setItem("token", "test-token");

      securityService.logoutUser();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user successfully", async () => {
      localStorageMock.setItem("authToken", "valid-token");

      const mockResponse = {
        success: true,
        data: {
          user: { id: "1", email: "test@example.com", role: "user" },
        },
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await securityService.getCurrentUser();

      expect(fetch).toHaveBeenCalledWith("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: "Bearer valid-token",
          "Content-Type": "application/json",
        },
      });
      // getCurrentUser returns data.data (which is { user: {...} } in this case)
      expect(result).toEqual(mockResponse.data);
    });

    it("should return null if no token", async () => {
      localStorageMock.getItem.mockReturnValue(null);

      // getCurrentUser will still call fetch, but without Authorization header
      // It will throw error if fetch fails, so we need to mock it
      fetch.mockRejectedValueOnce(new Error("No token"));

      await expect(securityService.getCurrentUser()).rejects.toThrow();
    });

    it("should handle unauthorized errors", async () => {
      localStorageMock.getItem.mockReturnValue("invalid-token");

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      });

      await expect(securityService.getCurrentUser()).rejects.toThrow(
        "Unauthorized"
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("authToken");
    });
  });

  describe("isAuthenticated", () => {
    it("should return true if token exists", () => {
      localStorageMock.setItem("authToken", "test-token");
      localStorageMock.getItem.mockReturnValue("test-token");

      const result = securityService.isAuthenticated();

      expect(result).toBe(true);
    });

    it("should return false if no token", () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = securityService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
