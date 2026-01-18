/**
 * Tests for ErrorBoundary Component
 * Tests error catching and fallback UI
 */

import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

// Component that throws an error
const ThrowError = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>No error</div>;
};

// Component that throws on render
const ThrowOnRender = () => {
  throw new Error("Render error");
};

// Component that throws async error
const ThrowAsyncError = () => {
  setTimeout(() => {
    throw new Error("Async error");
  }, 0);
  return <div>Async component</div>;
};

// Suppress console.error for these tests
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Error Catching", () => {
    test("catches errors and displays fallback UI", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test("renders children when no error", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });

    test("catches errors from nested components", () => {
      render(
        <ErrorBoundary>
          <div>
            <div>
              <ThrowError />
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test("catches render errors", () => {
      render(
        <ErrorBoundary>
          <ThrowOnRender />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe("Error Display", () => {
    test("displays error message in development", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/test error/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test("hides error details in production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test("displays custom fallback message", () => {
      render(
        <ErrorBoundary fallbackMessage="Custom error message">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
    });
  });

  describe("Error Recovery", () => {
    test("provides retry button", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole("button", { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    test("resets error state on retry", () => {
      let shouldThrow = true;

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Fix the error
      shouldThrow = false;

      const retryButton = screen.getByRole("button", { name: /try again/i });
      retryButton.click();

      // Re-render with fixed component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
    });
  });

  describe("Error Reporting", () => {
    test("calls onError callback when error occurs", () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    test("logs error to console in development", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(consoleSpy).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe("Multiple Children", () => {
    test("catches errors in any child", () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <ThrowError />
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText("Child 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Child 3")).not.toBeInTheDocument();
    });

    test("renders all children when no error", () => {
      render(
        <ErrorBoundary>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </ErrorBoundary>
      );

      expect(screen.getByText("Child 1")).toBeInTheDocument();
      expect(screen.getByText("Child 2")).toBeInTheDocument();
      expect(screen.getByText("Child 3")).toBeInTheDocument();
    });
  });

  describe("Nested ErrorBoundaries", () => {
    test("inner boundary catches errors first", () => {
      render(
        <ErrorBoundary fallbackMessage="Outer boundary">
          <div>
            <ErrorBoundary fallbackMessage="Inner boundary">
              <ThrowError />
            </ErrorBoundary>
          </div>
        </ErrorBoundary>
      );

      expect(screen.getByText(/inner boundary/i)).toBeInTheDocument();
      expect(screen.queryByText(/outer boundary/i)).not.toBeInTheDocument();
    });
  });

  describe("Component Stack", () => {
    test("includes component stack in error info", () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <div>
            <div>
              <ThrowError />
            </div>
          </div>
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.stringContaining("ThrowError"),
        })
      );
    });
  });

  describe("Edge Cases", () => {
    test("handles null children", () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });

    test("handles undefined children", () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });

    test("handles empty children", () => {
      render(<ErrorBoundary></ErrorBoundary>);
      expect(
        screen.queryByText(/something went wrong/i)
      ).not.toBeInTheDocument();
    });

    test("handles errors with no message", () => {
      const ThrowEmptyError = () => {
        throw new Error();
      };

      render(
        <ErrorBoundary>
          <ThrowEmptyError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    test("maintains error state until reset", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Re-render with same props
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error should still be shown
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    test("clears error state on key change", () => {
      const { rerender } = render(
        <ErrorBoundary key="1">
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Change key to force reset
      rerender(
        <ErrorBoundary key="2">
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
    });
  });
});
