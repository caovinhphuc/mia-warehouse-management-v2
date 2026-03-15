/**
 * Standalone Login Entry Point
 * Entry point riêng cho trang login - tối ưu bundle size
 */
import Login from "@components/auth/Login";
import { BRAND_CONFIG } from "@config/brand";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/es/locale/vi_VN";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import "./components/auth/Auth.css";
import "./global.css";
import { store } from "./store/store";

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
