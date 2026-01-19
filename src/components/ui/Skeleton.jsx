/**
 * Skeleton Loading Component
 * Provides elegant loading placeholders
 */

import React from "react";
import "./Skeleton.css";

const Skeleton = ({
  variant = "text",
  width,
  height,
  circle = false,
  animation = "wave",
  className = "",
  count = 1,
  ...props
}) => {
  const skeletonClasses = [
    "skeleton",
    `skeleton--${variant}`,
    `skeleton--animation-${animation}`,
    circle && "skeleton--circle",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {
    width: width,
    height: height,
  };

  if (count === 1) {
    return <div className={skeletonClasses} style={style} {...props} />;
  }

  return (
    <div className="skeleton-group">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={skeletonClasses} style={style} {...props} />
      ))}
    </div>
  );
};

// Skeleton Avatar
Skeleton.Avatar = ({ size = 48, className = "", ...props }) => (
  <Skeleton variant="avatar" width={size} height={size} circle className={className} {...props} />
);

// Skeleton Button
Skeleton.Button = ({ width = 100, height = 40, className = "", ...props }) => (
  <Skeleton variant="button" width={width} height={height} className={className} {...props} />
);

// Skeleton Input
Skeleton.Input = ({ width = "100%", height = 40, className = "", ...props }) => (
  <Skeleton variant="input" width={width} height={height} className={className} {...props} />
);

// Skeleton Image
Skeleton.Image = ({ width = "100%", height = 200, className = "", ...props }) => (
  <Skeleton variant="image" width={width} height={height} className={className} {...props} />
);

// Skeleton Card
Skeleton.Card = ({ className = "", ...props }) => (
  <div className={`skeleton-card ${className}`} {...props}>
    <Skeleton.Image height={160} />
    <div className="skeleton-card__content">
      <Skeleton variant="title" width="60%" />
      <Skeleton variant="text" count={3} />
      <div className="skeleton-card__footer">
        <Skeleton.Avatar size={32} />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
  </div>
);

// Skeleton List
Skeleton.List = ({ rows = 5, className = "", ...props }) => (
  <div className={`skeleton-list ${className}`} {...props}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="skeleton-list__item">
        <Skeleton.Avatar size={40} />
        <div className="skeleton-list__content">
          <Skeleton variant="title" width="30%" />
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    ))}
  </div>
);

// Skeleton Table
Skeleton.Table = ({ rows = 5, columns = 4, className = "", ...props }) => (
  <div className={`skeleton-table ${className}`} {...props}>
    <div className="skeleton-table__header">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} variant="text" height={20} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="skeleton-table__row">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" height={16} />
        ))}
      </div>
    ))}
  </div>
);

export default Skeleton;
