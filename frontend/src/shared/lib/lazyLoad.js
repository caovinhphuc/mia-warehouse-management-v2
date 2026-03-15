/**
 * Route-Based Code Splitting Utilities
 *
 * Use React.lazy() and Suspense for route-based code splitting
 * This significantly reduces initial bundle size
 */

import { lazy, Suspense } from "react";

const fallbackContainerStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  gap: "0.75rem",
  color: "#475569",
};

const spinnerStyle = {
  width: "3rem",
  height: "3rem",
};

const RouteLoadingFallback = ({ text = "Loading..." }) => (
  <div style={fallbackContainerStyle}>
    <svg
      aria-hidden="true"
      viewBox="0 0 50 50"
      style={spinnerStyle}
      role="presentation"
    >
      <circle
        cx="25"
        cy="25"
        fill="none"
        opacity="0.2"
        r="20"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        d="M45 25c0-11.046-8.954-20-20-20"
        fill="none"
        stroke="#2563eb"
        strokeLinecap="round"
        strokeWidth="4"
      >
        <animateTransform
          attributeName="transform"
          dur="0.75s"
          from="0 25 25"
          repeatCount="indefinite"
          to="360 25 25"
          type="rotate"
        />
      </path>
    </svg>
    <span>{text}</span>
  </div>
);

/**
 * Create a lazy-loaded component with loading fallback
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Optional custom fallback component
 * @returns {React.Component} Lazy-loaded component wrapped in Suspense
 */
export const lazyLoad = (importFunc, fallback = null) => {
  const LazyComponent = lazy(importFunc);
  const defaultFallback = <RouteLoadingFallback />;

  return (props) => (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Create a lazy-loaded component with error boundary
 * @param {Function} importFunc - Dynamic import function
 * @param {React.Component} fallback - Optional custom fallback component
 * @param {Function} onError - Optional error handler
 * @returns {React.Component} Lazy-loaded component with error handling
 */
export const lazyLoadWithRetry = (
  importFunc,
  fallback = null,
  onError = null
) => {
  const LazyComponent = lazy(() =>
    importFunc().catch((error) => {
      if (onError) {
        onError(error);
      }
      console.error("Failed to load component:", error);
      // Retry once after 1 second
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(importFunc());
        }, 1000);
      });
    })
  );

  const defaultFallback = <RouteLoadingFallback />;

  return (props) => (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Preload a lazy component
 * @param {Function} importFunc - Dynamic import function
 */
export const preloadComponent = (importFunc) => {
  importFunc();
};

/**
 * Example usage:
 *
 * // Basic usage
 * const Dashboard = lazyLoad(() => import('./pages/Dashboard'));
 *
 * // With custom fallback
 * const Analytics = lazyLoad(
 *   () => import('./pages/Analytics'),
 *   <CustomLoader />
 * );
 *
 * // With retry and error handling
 * const Reports = lazyLoadWithRetry(
 *   () => import('./pages/Reports'),
 *   <CustomLoader />,
 *   (error) => console.error('Failed to load Reports:', error)
 * );
 *
 * // Preload on hover
 * <Link
 *   to="/dashboard"
 *   onMouseEnter={() => preloadComponent(() => import('./pages/Dashboard'))}
 * >
 *   Dashboard
 * </Link>
 */

export default lazyLoad;
