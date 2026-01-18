import React from 'react';

const ActionButton = ({ icon, title, onClick, className = '' }) => {
  return (
    <button
      className={`action-btn ${className}`}
      title={title}
      onClick={onClick}
      aria-label={title}
    >
      {icon}
    </button>
  );
};

export default ActionButton;
