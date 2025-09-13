// src/components/Modal.js
import React from 'react';

function Modal({ children, onClose, size }) {
  const contentClassName = size === 'large' ? 'modal-content modal-content-large' : 'modal-content';

  return (
    <div className="modal-backdrop">
      <div className={contentClassName}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;