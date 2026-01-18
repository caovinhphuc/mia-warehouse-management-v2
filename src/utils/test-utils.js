/**
 * Test Utilities for React Testing Library
 * Provides custom render methods with Redux Provider and Router
 */

import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "../store/store";

/**
 * Render component with Redux Provider
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export const renderWithProviders = (ui, options = {}) => {
  const { preloadedState, customStore = store, ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <Provider store={customStore}>{children}</Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Render component with Router
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export const renderWithRouter = (ui, options = {}) => {
  const { initialEntries = ["/"], ...renderOptions } = options;

  const Wrapper = ({ children }) => (
    <BrowserRouter initialEntries={initialEntries}>{children}</BrowserRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Render component with both Redux Provider and Router
 * @param {React.Component} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Render result
 */
export const renderWithProvidersAndRouter = (ui, options = {}) => {
  const {
    preloadedState,
    customStore = store,
    initialEntries = ["/"],
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <Provider store={customStore}>
      <BrowserRouter initialEntries={initialEntries}>{children}</BrowserRouter>
    </Provider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Create mock store for testing
 * @param {Object} initialState - Initial Redux state
 * @returns {Object} Mock store
 */
export const createMockStore = (initialState = {}) => {
  return {
    getState: () => initialState,
    dispatch: jest.fn(),
    subscribe: jest.fn(),
    replaceReducer: jest.fn(),
  };
};

/**
 * Wait for async operations
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 */
export const waitFor = (ms = 0) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

/**
 * Mock sessionStorage
 */
export const mockSessionStorage = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Re-export everything from React Testing Library
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
