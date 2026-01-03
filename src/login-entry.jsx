/**
 * Standalone Login Entry Point
 * Entry point riêng cho trang login - tối ưu bundle size
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";
import Login from "./components/auth/Login";
import { store } from "./store/store";
import { BRAND_CONFIG } from "./config/brand";
import "./global.css";
import "./components/auth/Auth.css";

// Minimal setup cho login page
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider
        locale={viVN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: BRAND_CONFIG.colors.primary,
            borderRadius: 8,
          },
        }}
      >
        <Router>
          <Login />
        </Router>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
