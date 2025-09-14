// src/components/SkeletonLoader.js
import React from 'react';

const SkeletonLoader = ({ type = 'table', rows = 5 }) => {
  if (type === 'form') {
    return (
      <div className="skeleton-form">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton-form-group">
            <div className="skeleton-label"></div>
            <div className="skeleton-input"></div>
          </div>
        ))}
        <div className="skeleton-button"></div>
      </div>
    );
  }

  // Default to table loader
  return (
    <div className="skeleton-table">
      <div className="skeleton-row-header">
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
        <div className="skeleton-cell"></div>
      </div>
      {[...Array(rows)].map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
          <div className="skeleton-cell"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;