import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

// Performance monitoring configuration
const ANALYTICS_ENDPOINT =
  import.meta.env.VITE_ANALYTICS_ENDPOINT ||
  import.meta.env.REACT_APP_ANALYTICS_ENDPOINT;
const APP_VERSION =
  import.meta.env.VITE_APP_VERSION ||
  import.meta.env.REACT_APP_VERSION ||
  "1.0.0";

// Send performance metrics to analytics
function sendToAnalytics({ name, value, id, delta }) {
  const body = JSON.stringify({
    metric: name,
    value: Math.round(value),
    id,
    delta: Math.round(delta),
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    appVersion: APP_VERSION,
    sessionId: getSessionId(),
  });

  // Use sendBeacon if available, fallback to fetch
  if (navigator.sendBeacon) {
    navigator.sendBeacon(ANALYTICS_ENDPOINT, body);
  } else {
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
    }).catch(console.error);
  }
}

// Get or create session ID
function getSessionId() {
  let sessionId = sessionStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("sessionId", sessionId);
  }
  return sessionId;
}

// Enhanced performance monitoring
export function initPerformanceMonitoring() {
  // Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);

  // Custom performance metrics
  measureCustomMetrics();

  // Resource timing
  measureResourceTiming();

  // User interactions
  measureUserInteractions();

  // Error tracking
  trackErrors();
}

// Measure custom application metrics
function measureCustomMetrics() {
  // Time to Interactive (TTI) approximation
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === "navigation") {
        const tti = entry.domContentLoadedEventEnd - entry.navigationStart;
        sendToAnalytics({
          name: "TTI",
          value: tti,
          id: `tti-${Date.now()}`,
          delta: 0,
        });
      }
    });
  });

  observer.observe({ entryTypes: ["navigation"] });

  // Component render time
  window.componentRenderTime = {};

  // API response time tracking
  trackAPIPerformance();
}

// Track API performance
function trackAPIPerformance() {
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const startTime = performance.now();
    const url = args[0];

    try {
      const response = await originalFetch.apply(this, args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      sendToAnalytics({
        name: "API_RESPONSE_TIME",
        value: duration,
        id: `api-${Date.now()}`,
        delta: 0,
        url: typeof url === "string" ? url : url.url,
        status: response.status,
      });

      return response;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      sendToAnalytics({
        name: "API_ERROR",
        value: duration,
        id: `api-error-${Date.now()}`,
        delta: 0,
        url: typeof url === "string" ? url : url.url,
        error: error.message,
      });

      throw error;
    }
  };
}

// Measure resource timing
function measureResourceTiming() {
  const observer = new PerformanceObserver((entryList) => {
    const entries = entryList.getEntries();

    entries.forEach((entry) => {
      if (entry.entryType === "resource") {
        const resourceType = entry.initiatorType;
        const duration = entry.responseEnd - entry.requestStart;

        sendToAnalytics({
          name: `RESOURCE_${resourceType.toUpperCase()}_TIME`,
          value: duration,
          id: `resource-${Date.now()}`,
          delta: 0,
          resource: entry.name,
          size: entry.transferSize || 0,
        });
      }
    });
  });

  observer.observe({ entryTypes: ["resource"] });
}

// Measure user interactions
function measureUserInteractions() {
  let clickCount = 0;
  const scrollDepth = 0;

  // Click tracking
  document.addEventListener("click", (event) => {
    clickCount++;

    sendToAnalytics({
      name: "USER_CLICK",
      value: 1,
      id: `click-${Date.now()}`,
      delta: 1,
      element: event.target.tagName,
      className: event.target.className,
    });
  });

  // Scroll depth tracking
  let maxScroll = 0;
  window.addEventListener("scroll", () => {
    const scrolled = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
        100,
    );

    if (scrolled > maxScroll) {
      maxScroll = scrolled;

      if (maxScroll % 25 === 0) {
        // Track every 25%
        sendToAnalytics({
          name: "SCROLL_DEPTH",
          value: maxScroll,
          id: `scroll-${Date.now()}`,
          delta: 0,
        });
      }
    }
  });
}

// Error tracking
function trackErrors() {
  // JavaScript errors
  window.addEventListener("error", (event) => {
    sendToAnalytics({
      name: "JS_ERROR",
      value: 1,
      id: `error-${Date.now()}`,
      delta: 1,
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    sendToAnalytics({
      name: "PROMISE_REJECTION",
      value: 1,
      id: `rejection-${Date.now()}`,
      delta: 1,
      reason: event.reason?.message || String(event.reason),
    });
  });
}

// Component performance HOC
export function withPerformanceTracking(WrappedComponent, componentName) {
  return function PerformanceTrackedComponent(props) {
    const startTime = performance.now();

    React.useEffect(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      sendToAnalytics({
        name: "COMPONENT_RENDER_TIME",
        value: renderTime,
        id: `component-${Date.now()}`,
        delta: 0,
        component: componentName,
      });
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}
