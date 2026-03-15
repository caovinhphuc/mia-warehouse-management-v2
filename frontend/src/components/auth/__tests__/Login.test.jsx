/**
 * Tests for Login Component
 * Tests authentication flow, form validation, and SSO
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProvidersAndRouter } from "@utils/test-utils";
import {
  mockUser,
  mockAuthResponse,
  mockUnauthorizedError,
} from "../../../__fixtures__/mockData";
import Login from "../Login";
import * as securityService from "@services/securityService";

// Mock the security service
jest.mock("@services/securityService");

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams()],
}));

// Mock antd App.useApp
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  App: {
    useApp: () => ({
      message: {
        success: jest.fn(),
        error: jest.fn(),
        loading: jest.fn(() => jest.fn()),
        info: jest.fn(),
      },
    }),
  },
}));

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  describe("Rendering", () => {
    test("renders login form", () => {
      renderWithProvidersAndRouter(<Login />);

      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/mật khẩu/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /đăng nhập/i })
      ).toBeInTheDocument();
    });

    test("renders SSO options", () => {
      renderWithProvidersAndRouter(<Login />);

      expect(screen.getByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText(/microsoft/i)).toBeInTheDocument();
      expect(screen.getByText(/github/i)).toBeInTheDocument();
    });

    test("shows register form when toggle is clicked", async () => {
      const user = userEvent.setup();
      renderWithProvidersAndRouter(<Login />);

      const registerLink = screen.getByText(/chưa có tài khoản/i);
      await user.click(registerLink);

      expect(
        screen.getByRole("button", { name: /đăng ký/i })
      ).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    test("shows error when submitting empty form", async () => {
      const user = userEvent.setup();
      renderWithProvidersAndRouter(<Login />);

      const submitButton = screen.getByRole("button", { name: /đăng nhập/i });
      await user.click(submitButton);

      // Antd form validation messages
      await waitFor(() => {
        expect(screen.getByText(/vui lòng nhập email/i)).toBeInTheDocument();
      });
    });

    test("validates email format", async () => {
      const user = userEvent.setup();
      renderWithProvidersAndRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      await user.type(emailInput, "invalid-email");
      await user.tab(); // Trigger blur validation

      await waitFor(() => {
        expect(screen.getByText(/email không hợp lệ/i)).toBeInTheDocument();
      });
    });

    test("validates password length", async () => {
      const user = userEvent.setup();
      renderWithProvidersAndRouter(<Login />);

      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      await user.type(passwordInput, "123"); // Too short
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText(/mật khẩu phải có ít nhất/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Login Flow", () => {
    test("handles successful login", async () => {
      const user = userEvent.setup();
      securityService.loginUser.mockResolvedValue({
        success: true,
        user: mockUser,
        token: "test-token",
      });

      renderWithProvidersAndRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const submitButton = screen.getByRole("button", { name: /đăng nhập/i });

      await user.type(emailInput, mockUser.email);
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(securityService.loginUser).toHaveBeenCalledWith(
          mockUser.email,
          "password123"
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    test("handles login with invalid credentials", async () => {
      const user = userEvent.setup();
      securityService.loginUser.mockRejectedValue(
        new Error("Invalid email or password")
      );

      renderWithProvidersAndRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const submitButton = screen.getByRole("button", { name: /đăng nhập/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
      });
    });

    test("handles MFA requirement", async () => {
      const user = userEvent.setup();
      securityService.loginUser.mockResolvedValue({
        requiresMFA: true,
      });

      renderWithProvidersAndRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const submitButton = screen.getByRole("button", { name: /đăng nhập/i });

      await user.type(emailInput, mockUser.email);
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          "/security",
          expect.any(Object)
        );
      });
    });

    test("redirects to returnUrl after successful login", async () => {
      const user = userEvent.setup();
      const returnUrl = "/dashboard";

      // Mock useSearchParams to return returnUrl
      jest
        .spyOn(require("react-router-dom"), "useSearchParams")
        .mockReturnValue([new URLSearchParams(`?returnUrl=${returnUrl}`)]);

      securityService.loginUser.mockResolvedValue({
        success: true,
        user: mockUser,
        token: "test-token",
      });

      renderWithProvidersAndRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const submitButton = screen.getByRole("button", { name: /đăng nhập/i });

      await user.type(emailInput, mockUser.email);
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(returnUrl);
      });
    });
  });

  describe("Registration Flow", () => {
    test("handles successful registration", async () => {
      const user = userEvent.setup();
      securityService.registerUser.mockResolvedValue({
        success: true,
      });

      renderWithProvidersAndRouter(<Login />);

      // Switch to register mode
      const registerLink = screen.getByText(/chưa có tài khoản/i);
      await user.click(registerLink);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const submitButton = screen.getByRole("button", { name: /đăng ký/i });

      await user.type(emailInput, "newuser@example.com");
      await user.type(passwordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(securityService.registerUser).toHaveBeenCalledWith(
          "newuser@example.com",
          "newpassword123",
          "user"
        );
      });

      // Should switch back to login mode after successful registration
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /đăng nhập/i })
        ).toBeInTheDocument();
      });
    });

    test("handles registration error", async () => {
      const user = userEvent.setup();
      securityService.registerUser.mockRejectedValue(
        new Error("Email already exists")
      );

      renderWithProvidersAndRouter(<Login />);

      const registerLink = screen.getByText(/chưa có tài khoản/i);
      await user.click(registerLink);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const submitButton = screen.getByRole("button", { name: /đăng ký/i });

      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe("SSO Login", () => {
    test("handles Google SSO login", async () => {
      const user = userEvent.setup();
      securityService.default.loginWithGoogle = jest.fn().mockResolvedValue({
        success: true,
        user: mockUser,
      });

      renderWithProvidersAndRouter(<Login />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(securityService.default.loginWithGoogle).toHaveBeenCalled();
      });
    });

    test("handles Microsoft SSO login", async () => {
      const user = userEvent.setup();
      securityService.default.loginWithMicrosoft = jest.fn().mockResolvedValue({
        success: true,
        user: mockUser,
      });

      renderWithProvidersAndRouter(<Login />);

      const microsoftButton = screen.getByRole("button", {
        name: /microsoft/i,
      });
      await user.click(microsoftButton);

      await waitFor(() => {
        expect(securityService.default.loginWithMicrosoft).toHaveBeenCalled();
      });
    });

    test("handles SSO error", async () => {
      const user = userEvent.setup();
      securityService.default.loginWithGoogle = jest
        .fn()
        .mockRejectedValue(new Error("SSO authentication failed"));

      renderWithProvidersAndRouter(<Login />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      await user.click(googleButton);

      await waitFor(() => {
        expect(
          screen.getByText(/sso authentication failed/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading States", () => {
    test("shows loading indicator during login", async () => {
      const user = userEvent.setup();
      let resolveLogin;
      securityService.loginUser.mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve;
        })
      );

      renderWithProvidersAndRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const submitButton = screen.getByRole("button", { name: /đăng nhập/i });

      await user.type(emailInput, mockUser.email);
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Resolve login
      resolveLogin({ success: true, user: mockUser, token: "test-token" });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    test("disables form during SSO login", async () => {
      const user = userEvent.setup();
      let resolveSSO;
      securityService.default.loginWithGoogle = jest.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveSSO = resolve;
        })
      );

      renderWithProvidersAndRouter(<Login />);

      const googleButton = screen.getByRole("button", { name: /google/i });
      await user.click(googleButton);

      // SSO button should show loading
      await waitFor(() => {
        expect(googleButton).toHaveClass("ant-btn-loading");
      });

      resolveSSO({ success: true, user: mockUser });
    });
  });

  describe("Remember Me", () => {
    test("saves credentials when remember me is checked", async () => {
      const user = userEvent.setup();
      securityService.loginUser.mockResolvedValue({
        success: true,
        user: mockUser,
        token: "test-token",
      });

      renderWithProvidersAndRouter(<Login />);

      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/mật khẩu/i);
      const rememberCheckbox = screen.getByRole("checkbox", {
        name: /ghi nhớ/i,
      });
      const submitButton = screen.getByRole("button", { name: /đăng nhập/i });

      await user.type(emailInput, mockUser.email);
      await user.type(passwordInput, "password123");
      await user.click(rememberCheckbox);
      await user.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem("authToken")).toBe("test-token");
      });
    });
  });

  describe("Auto-redirect", () => {
    test("redirects to home if already authenticated", () => {
      localStorage.setItem("authToken", "existing-token");

      renderWithProvidersAndRouter(<Login />);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
