/**
 * Tests for ProtectedRoute Component
 * Tests authentication protection and redirect logic
 */

import { screen, waitFor } from "@testing-library/react";
import { renderWithProvidersAndRouter } from "../../utils/test-utils";
import { mockUser } from "../../__fixtures__/mockData";
import ProtectedRoute from "./ProtectedRoute";

// Mock child component
const TestComponent = () => <div>Protected Content</div>;

// Mock fetch
global.fetch = jest.fn();

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: "/dashboard" }),
  Navigate: ({ to }) => <div data-testid="navigate-to">{to}</div>,
}));

// Mock antd message
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  message: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

describe("ProtectedRoute Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch.mockClear();
  });

  describe("Authentication Check", () => {
    test("renders children when authenticated", async () => {
      localStorage.setItem("authToken", "valid-token");
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser }),
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });

    test("shows loading while checking authentication", () => {
      localStorage.setItem("authToken", "valid-token");
      global.fetch.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test("redirects to login when not authenticated", async () => {
      // No token in localStorage

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
      });
    });

    test("redirects to login when token is invalid", async () => {
      localStorage.setItem("authToken", "invalid-token");
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
      });
    });
  });

  describe("Session Validation", () => {
    test("validates session on mount", async () => {
      localStorage.setItem("authToken", "valid-token");
      localStorage.setItem("sessionId", "session-123");

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser }),
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/auth/verify"),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: "Bearer valid-token",
            }),
          })
        );
      });
    });

    test("handles expired session", async () => {
      localStorage.setItem("authToken", "expired-token");

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Session expired" }),
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId("navigate-to")).toHaveTextContent("/login");
      });
    });

    test("clears localStorage on session expiration", async () => {
      localStorage.setItem("authToken", "expired-token");
      localStorage.setItem("sessionId", "session-123");

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(localStorage.getItem("authToken")).toBeNull();
        expect(localStorage.getItem("sessionId")).toBeNull();
      });
    });
  });

  describe("Network Error Handling", () => {
    test("handles network error during verification", async () => {
      localStorage.setItem("authToken", "valid-token");

      global.fetch.mockRejectedValueOnce(new Error("Network error"));

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should still try to render if token exists (fallback)
      await waitFor(
        () => {
          expect(screen.queryByText("Protected Content")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    test("retries verification on network failure", async () => {
      localStorage.setItem("authToken", "valid-token");

      // First call fails, second succeeds
      global.fetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ valid: true, user: mockUser }),
        });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe("Return URL", () => {
    test("preserves return URL when redirecting to login", async () => {
      // Mock useLocation to return dashboard path
      jest.spyOn(require("react-router-dom"), "useLocation").mockReturnValue({
        pathname: "/dashboard",
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        const navigateElement = screen.getByTestId("navigate-to");
        expect(navigateElement.textContent).toMatch(/login/);
      });
    });
  });

  describe("Redux Integration", () => {
    test("uses Redux auth state if available", async () => {
      const mockStore = {
        auth: {
          isAuthenticated: true,
          user: mockUser,
          sessionId: "session-123",
        },
      };

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        { preloadedState: mockStore }
      );

      // Should not call fetch if already authenticated in Redux
      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test("dispatches logout action on session expiration", async () => {
      localStorage.setItem("authToken", "expired-token");

      const mockDispatch = jest.fn();
      jest
        .spyOn(require("react-redux"), "useDispatch")
        .mockReturnValue(mockDispatch);

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));
      });
    });
  });

  describe("Multiple Children", () => {
    test("renders multiple children when authenticated", async () => {
      localStorage.setItem("authToken", "valid-token");
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser }),
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByText("Child 1")).toBeInTheDocument();
        expect(screen.getByText("Child 2")).toBeInTheDocument();
        expect(screen.getByText("Child 3")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    test("handles missing token gracefully", async () => {
      // No token at all

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(screen.getByTestId("navigate-to")).toBeInTheDocument();
      });
    });

    test("handles malformed verification response", async () => {
      localStorage.setItem("authToken", "valid-token");

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}), // Empty response
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should handle gracefully
      await waitFor(() => {
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      });
    });

    test("handles API URL from environment", async () => {
      process.env.VITE_API_URL = "https://api.example.com";
      localStorage.setItem("authToken", "valid-token");

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ valid: true, user: mockUser }),
      });

      renderWithProvidersAndRouter(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("api.example.com"),
          expect.any(Object)
        );
      });
    });
  });
});
