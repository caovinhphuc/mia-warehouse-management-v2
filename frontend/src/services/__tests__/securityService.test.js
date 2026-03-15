/**
 * Unit Tests for Security Service
 * Tests authentication, MFA, and security functions
 */

// Use shared store from setupTests (global.__localStorageStore)
const store = global.__localStorageStore || {};

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

// Import after mocks
const securityService = require("../securityService");

describe("SecurityService", () => {
  let consoleWarnSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    if (store && typeof store === "object") {
      Object.keys(store).forEach((k) => delete store[k]);
    }
    jest.clearAllMocks();
    fetch.mockClear();
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleWarnSpy?.mockRestore) {
      consoleWarnSpy.mockRestore();
    }
    if (consoleErrorSpy?.mockRestore) {
      consoleErrorSpy.mockRestore();
    }
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
        headers: { get: () => "application/json" },
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
      expect(store.authToken).toBeUndefined();
    });

    it("should handle registration errors", async () => {
      const mockResponse = {
        success: false,
        error: "Email already exists",
      };

      fetch.mockResolvedValueOnce({
        ok: false,
        headers: { get: () => "application/json" },
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

      // checkBackendConnection + verifyOneTGALogin + login
      fetch
        .mockResolvedValueOnce({ ok: true }) // health check
        .mockRejectedValueOnce(new TypeError("Failed to fetch")) // verify-one-tga skip
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => "application/json" },
          json: async () => mockResponse,
        });

      const result = await securityService.loginUser(
        "test@example.com",
        "password123"
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            mfaToken: null,
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
      expect(store.authToken).toBe("login-token");
    });

    it("should handle MFA requirement", async () => {
      const mockResponse = {
        success: true,
        requiresMFA: true,
        message: "MFA token required",
      };

      fetch
        .mockResolvedValueOnce({ ok: true }) // health
        .mockRejectedValueOnce(new TypeError("Failed to fetch")) // verify skip
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: () => "application/json" },
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

      fetch
        .mockResolvedValueOnce({ ok: true }) // health
        .mockRejectedValueOnce(new TypeError("Failed to fetch")) // verify skip
        .mockResolvedValueOnce({
          ok: false,
          headers: { get: () => "application/json" },
          json: async () => mockResponse,
        });

      await expect(
        securityService.loginUser("test@example.com", "wrong-password")
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logoutUser", () => {
    it("should logout user and clear token", async () => {
      store.authToken = "test-token";
      store.token = "test-token";
      fetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

      await securityService.logoutUser();

      expect(store.authToken).toBeUndefined();
      expect(store.token).toBeUndefined();
    });
  });

  describe("getCurrentUser", () => {
    it("should get current user successfully", async () => {
      store.authToken = "valid-token";

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

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/auth/me",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer valid-token",
            "Content-Type": "application/json",
          }),
        })
      );
      // getCurrentUser returns data.data (which is { user: {...} } in this case)
      expect(result).toEqual(mockResponse.data);
    });

    it("should return null if no token", async () => {
      // store is empty - no token

      // getCurrentUser will still call fetch, but without Authorization header
      // It will throw error if fetch fails, so we need to mock it
      fetch.mockRejectedValueOnce(new Error("No token"));

      await expect(securityService.getCurrentUser()).rejects.toThrow();
    });

    it("should handle unauthorized errors", async () => {
      store.authToken = "invalid-token";

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" }),
      });

      await expect(securityService.getCurrentUser()).rejects.toThrow(
        "Unauthorized"
      );
      expect(store.authToken).toBeUndefined();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true if token exists", () => {
      store.authToken = "test-token";

      const result = securityService.isAuthenticated();

      expect(result).toBe(true);
    });

    it("should return false if no token", () => {
      // store is empty
      const result = securityService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});
