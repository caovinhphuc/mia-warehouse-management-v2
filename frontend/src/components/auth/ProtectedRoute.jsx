import importMetaEnv from "@utils/importMetaEnv";
import { message } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { logout } from "../../store/actions/authActions";
import Loading from "../Common/Loading";

/**
 * ProtectedRoute - Component để bảo vệ routes yêu cầu authentication
 * Tự động kiểm tra session và redirect về login nếu hết hạn
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, sessionId } = useSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // Nếu không có authentication state, kiểm tra token trong localStorage
      const token =
        localStorage.getItem("authToken") || localStorage.getItem("token");
      const storedSessionId = localStorage.getItem("sessionId");

      if (!token && !isAuthenticated) {
        setIsChecking(false);
        setIsValid(false);
        return;
      }

      // Có token nhưng Redux chưa có (vd: refresh page) → verify session rồi restore state
      if (token && !isAuthenticated) {
        try {
          const API_BASE_URL =
            importMetaEnv.VITE_API_URL ||
            importMetaEnv.REACT_APP_API_URL ||
            "http://localhost:3001";
          const currentToken =
            localStorage.getItem("authToken") || localStorage.getItem("token");

          const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(currentToken && { Authorization: `Bearer ${currentToken}` }),
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.valid && data.success) {
              setIsValid(true);
              // Restore Redux để đồng bộ state sau refresh
              if (data.user) {
                dispatch({
                  type: "LOGIN_SUCCESS",
                  payload: {
                    user: data.user,
                    sessionId: data.sessionId,
                    serviceAccount: { email: null, projectId: null, isConfigured: false },
                  },
                });
              }
            } else {
              setIsValid(false);
              localStorage.removeItem("authToken");
              localStorage.removeItem("token");
              localStorage.removeItem("sessionId");
            }
          } else {
            setIsValid(false);
            localStorage.removeItem("authToken");
            localStorage.removeItem("token");
            localStorage.removeItem("sessionId");
          }
        } catch (error) {
          console.error("Session check error:", error);
          setIsValid(false);
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          localStorage.removeItem("sessionId");
        }
      } else if (isAuthenticated) {
        // Đã authenticated trong Redux, kiểm tra session với backend
        if (sessionId || storedSessionId) {
          try {
            const API_BASE_URL =
              importMetaEnv.VITE_API_URL ||
              importMetaEnv.REACT_APP_API_URL ||
              "http://localhost:3001";

            const token =
              localStorage.getItem("authToken") ||
              localStorage.getItem("token");

            const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            });

            if (response.ok) {
              const data = await response.json();
              if (data.valid && data.success) {
                setIsValid(true);
              } else {
                // Session không hợp lệ
                setIsValid(false);
                // Auto logout
                try {
                  await dispatch(logout(false));
                } catch (e) {
                  // Ignore logout errors
                }
                message.warning(
                  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
                );
              }
            } else if (response.status === 401) {
              // Session expired
              setIsValid(false);
              // Auto logout
              try {
                await dispatch(logout(false));
              } catch (e) {
                // Ignore logout errors
              }
              message.warning(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
            } else {
              // Other error
              setIsValid(false);
              try {
                await dispatch(logout(false));
              } catch (e) {
                // Ignore logout errors
              }
            }
          } catch (error) {
            // Network error - backend có thể chưa chạy hoặc không kết nối được
            // Chỉ log trong development mode
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "Session verification error (backend may not be running):",
                error.message
              );
            }
            // Nếu lỗi network, cho phép truy cập (có thể là backend chưa chạy)
            // Nhưng nếu là 401, thì session đã hết hạn
            if (
              error.message?.includes("401") ||
              error.message?.includes("Unauthorized")
            ) {
              setIsValid(false);
              try {
                await dispatch(logout(false));
              } catch (e) {
                // Ignore logout errors
              }
              message.warning(
                "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
              );
            } else {
              // Network error, cho phép truy cập (có thể backend chưa chạy)
              setIsValid(true);
            }
          }
        } else {
          // Có authentication nhưng không có sessionId
          setIsValid(true); // Cho phép truy cập
        }
      } else {
        setIsValid(false);
      }

      setIsChecking(false);
    };

    checkSession();

    // Kiểm tra session định kỳ mỗi 5 phút
    const interval = setInterval(
      () => {
        checkSession();
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, sessionId, dispatch]);

  // Đang kiểm tra
  if (isChecking) {
    return <Loading text="Đang kiểm tra phiên đăng nhập..." />;
  }

  // Redirect khi session không hợp lệ (token hết hạn/invalid hoặc chưa đăng nhập)
  // Cho phép vào khi isValid (đã verify token với backend thành công, kể cả sau refresh)
  if (!isValid) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("sessionId");
    const returnUrl = location.pathname !== "/login" ? location.pathname : "/";
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
        replace
      />
    );
  }

  // Hợp lệ và đã authenticated, render children
  return children;
};

export default ProtectedRoute;
