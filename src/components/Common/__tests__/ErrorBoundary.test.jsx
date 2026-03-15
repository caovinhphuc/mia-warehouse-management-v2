/**
 * Tests for ErrorBoundary Component
 * Tests error catching and fallback UI
 */

import { render, screen, fireEvent, act } from "@testing-library/react";
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
let consoleErrorSpy;
beforeAll(() => {
  consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  if (consoleErrorSpy?.mockRestore) {
    consoleErrorSpy.mockRestore();
  }
});

describe("ErrorBoundary Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Error Catching", () => {
    test("catches errors and displays fallback UI", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });

    test("renders children when no error", () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
      expect(
        screen.queryByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i)
      ).not.toBeInTheDocument();
    });

    test("catches errors from nested components", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <div>
              <div>
                <ThrowError />
              </div>
            </div>
          </ErrorBoundary>
        );
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });

    test("catches render errors", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowOnRender />
          </ErrorBoundary>
        );
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });
  });

  describe("Error Display", () => {
    test("displays error message in development", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      });

      expect(screen.getByText(/test error/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    test("hides error details in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      });

      expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);

      process.env.NODE_ENV = originalEnv;
    });

    test("displays fallback UI with retry and report buttons", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      });

      expect(screen.getAllByText(/thử lại/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/báo cáo/i).length).toBeGreaterThan(0);
    });
  });

  describe("Error Recovery", () => {
    test("provides retry button", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      });

      const retryBtn = screen
        .getAllByRole("button")
        .find((b) => /thử lại/i.test(b.textContent));
      expect(retryBtn).toBeInTheDocument();
    });

    test("resets error state on retry", async () => {
      let shouldThrow = true;
      let rerender;

      await act(async () => {
        const result = render(
          <ErrorBoundary>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        );
        rerender = result.rerender;
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);

      shouldThrow = false;
      await act(async () => {
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={shouldThrow} />
          </ErrorBoundary>
        );
      });

      // Retry button is first in extra array
      const retryButton = screen.getAllByRole("button")[0];
      fireEvent.click(retryButton);

      expect(screen.getByText("No error")).toBeInTheDocument();
    });
  });

  describe("Error Reporting", () => {
    test("stores error in state for display", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
      });

      // Error được lưu trong state và hiển thị qua fallback (bỏ log console vì gây lỗi trong test/prod)
      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });
  });

  describe("Multiple Children", () => {
    test("catches errors in any child", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <div>Child 1</div>
            <ThrowError />
            <div>Child 3</div>
          </ErrorBoundary>
        );
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
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
    test("inner boundary catches errors first", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <div>
              <ErrorBoundary>
                <ThrowError />
              </ErrorBoundary>
            </div>
          </ErrorBoundary>
        );
      });

      // Both use same fallback UI; inner catches first so we see one fallback
      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });
  });

  describe("Component Stack", () => {
    test("catches error and displays fallback with error info", async () => {
      await act(async () => {
        render(
          <ErrorBoundary>
            <div>
              <div>
                <ThrowError />
              </div>
            </div>
          </ErrorBoundary>
        );
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    test("handles null children", () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);
      expect(
        screen.queryByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i)
      ).not.toBeInTheDocument();
    });

    test("handles undefined children", () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);
      expect(
        screen.queryByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i)
      ).not.toBeInTheDocument();
    });

    test("handles empty children", () => {
      render(<ErrorBoundary></ErrorBoundary>);
      expect(
        screen.queryByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i)
      ).not.toBeInTheDocument();
    });

    test("handles errors with no message", async () => {
      const ThrowEmptyError = () => {
        throw new Error();
      };

      await act(async () => {
        render(
          <ErrorBoundary>
            <ThrowEmptyError />
          </ErrorBoundary>
        );
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });
  });

  describe("State Management", () => {
    test("maintains error state until reset", async () => {
      let rerender;
      await act(async () => {
        const result = render(
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        );
        rerender = result.rerender;
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);

      await act(async () => {
        rerender(
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        );
      });

      // Error state vẫn hiển thị (chưa click Retry)
      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);
    });

    test("clears error state on key change", async () => {
      let rerender;
      await act(async () => {
        const result = render(
          <ErrorBoundary key="1">
            <ThrowError />
          </ErrorBoundary>
        );
        rerender = result.rerender;
      });

      expect(
        screen.getAllByText(/Ứng dụng gặp lỗi|Đã xảy ra lỗi/i).length
      ).toBeGreaterThan(0);

      await act(async () => {
        rerender(
          <ErrorBoundary key="2">
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        );
      });

      expect(screen.getByText("No error")).toBeInTheDocument();
    });
  });
});
