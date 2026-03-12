/**
 * import.meta.env compatibility layer for Create React App
 * Maps VITE_* and import.meta.env.* to process.env.REACT_APP_*
 */

const viteEnv = typeof import.meta !== "undefined" ? import.meta.env : null;

const getEnv = (key) => {
  if (viteEnv && key in viteEnv) {
    return viteEnv[key];
  }
  // Map VITE_* to REACT_APP_*
  if (key.startsWith("VITE_")) {
    const reactAppKey = key.replace("VITE_", "REACT_APP_");
    return process.env[reactAppKey] || process.env[key] || "";
  }
  // Handle special cases
  if (key === "DEV") {
    return viteEnv?.DEV ?? process.env.NODE_ENV !== "production";
  }
  if (key === "PROD") {
    return viteEnv?.PROD ?? process.env.NODE_ENV === "production";
  }
  if (key === "MODE") {
    return (viteEnv?.MODE ?? process.env.NODE_ENV) || "development";
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
