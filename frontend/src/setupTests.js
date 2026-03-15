// jest-dom adds custom jest matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";

const silentConsoleMethods = ["log", "info", "warn"];

beforeEach(() => {
  silentConsoleMethods.forEach((method) => {
    jest.spyOn(console, method).mockImplementation(() => {});
  });
});

// Mock window.matchMedia (Ant Design, responsive)
Object.defineProperty(window, "matchMedia", {
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

// Shared localStorage mock (securityService and other tests can use global.__localStorageStore)
const storageStore = {};
global.__localStorageStore = storageStore;
const storageApi = {
  getItem: (k) => storageStore[k] ?? null,
  setItem: (k, v) => {
    storageStore[k] = String(v);
  },
  removeItem: (k) => {
    delete storageStore[k];
  },
  clear: () => {
    Object.keys(storageStore).forEach((k) => delete storageStore[k]);
  },
};
try {
  Object.defineProperty(global, "localStorage", {
    value: storageApi,
    writable: true,
    configurable: true,
  });
} catch (_) {
  global.localStorage = storageApi;
}
