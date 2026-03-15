/**
 * Jest-safe import.meta.env mock - dùng process.env
 */
const getEnv = (key) => {
  if (key.startsWith("VITE_")) {
    const reactAppKey = key.replace("VITE_", "REACT_APP_");
    return process.env[reactAppKey] || process.env[key] || "";
  }
  if (key === "DEV") return process.env.NODE_ENV !== "production";
  if (key === "PROD") return process.env.NODE_ENV === "production";
  if (key === "MODE") return process.env.NODE_ENV || "development";
  return process.env[key] || process.env[`REACT_APP_${key}`] || "";
};

const importMetaEnv = new Proxy(
  {},
  {
    get: (_, prop) => (typeof prop === "string" ? getEnv(prop) : undefined),
  }
);

export default importMetaEnv;
