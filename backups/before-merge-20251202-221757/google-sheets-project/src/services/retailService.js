/**
 * 🛒 MIA Retail Service
 *
 * Service layer for retail API calls
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.REACT_APP_API_URL ||
  "http://localhost:3001";

/**
 * Fetch retail dashboard summary
 */
export const fetchRetailDashboard = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/retail/dashboard`);
    if (!response.ok) {
      throw new Error("Failed to fetch retail dashboard");
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching retail dashboard:", error);
    throw error;
  }
};

/**
 * Fetch sales metrics
 */
export const fetchSalesMetrics = async (timeframe = "30d") => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/retail/sales?timeframe=${timeframe}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch sales metrics");
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching sales metrics:", error);
    throw error;
  }
};

/**
 * Fetch inventory status
 */
export const fetchInventoryStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/retail/inventory`);
    if (!response.ok) {
      throw new Error("Failed to fetch inventory status");
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching inventory status:", error);
    throw error;
  }
};

/**
 * Fetch customer analytics
 */
export const fetchCustomerAnalytics = async (timeframe = "30d") => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/retail/customers?timeframe=${timeframe}`,
    );
    if (!response.ok) {
      throw new Error("Failed to fetch customer analytics");
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching customer analytics:", error);
    throw error;
  }
};

/**
 * Fetch store performance
 */
export const fetchStorePerformance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/retail/stores`);
    if (!response.ok) {
      throw new Error("Failed to fetch store performance");
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching store performance:", error);
    throw error;
  }
};

/**
 * Fetch product performance
 */
export const fetchProductPerformance = async (
  category = null,
  timeframe = "30d",
) => {
  try {
    let url = `${API_BASE_URL}/api/retail/products?timeframe=${timeframe}`;
    if (category) {
      url += `&category=${category}`;
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to fetch product performance");
    }
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching product performance:", error);
    throw error;
  }
};

/**
 * Format currency for Vietnamese Dong
 */
export const formatVND = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format number with Vietnamese locale
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat("vi-VN").format(number);
};

/**
 * Calculate growth percentage
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Get status color based on value
 */
export const getStatusColor = (
  value,
  thresholds = { good: 0.8, excellent: 1.2 },
) => {
  if (value >= thresholds.excellent) return "#06a77d"; // Green - Excellent
  if (value >= thresholds.good) return "#3b82f6"; // Blue - Good
  if (value >= 0.5) return "#f59e0b"; // Orange - Average
  return "#d62828"; // Red - Poor
};

export default {
  fetchRetailDashboard,
  fetchSalesMetrics,
  fetchInventoryStatus,
  fetchCustomerAnalytics,
  fetchStorePerformance,
  fetchProductPerformance,
  formatVND,
  formatNumber,
  calculateGrowth,
  getStatusColor,
};
