import "./Loading.css";

const Loading = ({
  size = "medium",
  color = "primary",
  text = "Đang tải...",
  fullScreen = false,
} = {}) => {
  const sizeClasses = {
    small: "loading-small",
    medium: "loading-medium",
    large: "loading-large",
  };

  const colorClasses = {
    primary: "loading-primary",
    secondary: "loading-secondary",
    success: "loading-success",
    warning: "loading-warning",
    danger: "loading-danger",
  };

  const containerClass = fullScreen
    ? "loading-fullscreen"
    : "loading-container";

  return (
    <div
      className={`${containerClass} ${sizeClasses[size]} ${colorClasses[color]}`}
    >
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <div className="loading-text">{text}</div>}
    </div>
  );
};

export default Loading;
