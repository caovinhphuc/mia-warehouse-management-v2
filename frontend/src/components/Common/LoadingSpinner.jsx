import React from "react";

const LoadingSpinner = ({
  size = "medium",
  color = "#1976d2",
  text = "Loading...",
  overlay = false,
}) => {
  const sizeMap = {
    small: "20px",
    medium: "40px",
    large: "60px",
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid #f3f3f3`,
    borderTop: `3px solid ${color}`,
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  };

  const containerStyle = overlay
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {text && (
        <p
          style={{
            marginTop: "10px",
            color: color,
            fontSize: size === "small" ? "12px" : "14px",
          }}
        >
          {text}
        </p>
      )}

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

// Inline spinner component for buttons
export const InlineSpinner = ({ size = "16px", color = "#ffffff" }) => (
  <div
    style={{
      display: "inline-block",
      width: size,
      height: size,
      border: `2px solid transparent`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      marginRight: "8px",
    }}
  />
);

// Dots spinner for smaller spaces
export const DotsSpinner = ({ color = "#1976d2" }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
    <div
      style={{
        width: "8px",
        height: "8px",
        backgroundColor: color,
        borderRadius: "50%",
        animation: "bounce 1.4s ease-in-out infinite both",
      }}
    />
    <div
      style={{
        width: "8px",
        height: "8px",
        backgroundColor: color,
        borderRadius: "50%",
        animation: "bounce 1.4s ease-in-out infinite both",
        animationDelay: "-0.16s",
      }}
    />
    <div
      style={{
        width: "8px",
        height: "8px",
        backgroundColor: color,
        borderRadius: "50%",
        animation: "bounce 1.4s ease-in-out infinite both",
        animationDelay: "-0.32s",
      }}
    />

    <style jsx>{`
      @keyframes bounce {
        0%,
        80%,
        100% {
          transform: scale(0);
        }
        40% {
          transform: scale(1);
        }
      }
    `}</style>
  </div>
);

// Skeleton loader for content
export const SkeletonLoader = ({ lines = 3, width = "100%" }) => (
  <div style={{ width }}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        style={{
          height: "16px",
          backgroundColor: "#f0f0f0",
          borderRadius: "4px",
          marginBottom: "8px",
          animation: "pulse 1.5s ease-in-out infinite",
          width: index === lines - 1 ? "60%" : "100%",
        }}
      />
    ))}

    <style jsx>{`
      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }
    `}</style>
  </div>
);

export default LoadingSpinner;
