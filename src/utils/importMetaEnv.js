/**
 * import.meta.env compatibility layer for Create React App
 * Maps VITE_* and import.meta.env.* to process.env.REACT_APP_*
 */

const getEnv = (key) => {
  // Map VITE_* to REACT_APP_*
  if (key.startsWith("VITE_")) {
    const reactAppKey = key.replace("VITE_", "REACT_APP_");
    return process.env[reactAppKey] || process.env[key] || "";
  }
  // Handle special cases
  if (key === "DEV") {
    return process.env.NODE_ENV !== "production";
  }
  if (key === "PROD") {
    return process.env.NODE_ENV === "production";
  }
  if (key === "MODE") {
    return process.env.NODE_ENV || "development";
  }
  // Direct access to REACT_APP_* or process.env
  return process.env[key] || process.env[`REACT_APP_${key}`] || "";
};

// Create import.meta.env-like object
const importMetaEnv = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (typeof prop === "string") {
        return getEnv(prop);
      }
      return undefined;
    },
  }
);

export default importMetaEnv;
