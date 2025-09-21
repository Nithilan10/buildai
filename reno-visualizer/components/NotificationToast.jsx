import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './NotificationToast.module.css';

const NotificationToast = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  position = 'top-right',
  showIcon = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300); // Match animation duration
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      default: // info
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
    }
  };

  const getToastStyles = () => {
    const baseStyles = [styles.toast, styles[type]];

    if (isExiting) {
      baseStyles.push(styles.exiting);
    }

    return baseStyles.join(' ');
  };

  const getPositionStyles = () => {
    const positions = {
      'top-left': styles.topLeft,
      'top-right': styles.topRight,
      'top-center': styles.topCenter,
      'bottom-left': styles.bottomLeft,
      'bottom-right': styles.bottomRight,
      'bottom-center': styles.bottomCenter
    };
    return positions[position] || styles.topRight;
  };

  if (!isVisible) return null;

  return (
    <div className={`${getToastStyles()} ${getPositionStyles()}`}>
      <div className={styles.toastContent}>
        {showIcon && (
          <div className={styles.toastIcon}>
            {getToastIcon()}
          </div>
        )}

        <div className={styles.toastBody}>
          <p className={styles.toastMessage}>
            {message}
          </p>
        </div>

        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close notification"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {duration > 0 && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
};

NotificationToast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  position: PropTypes.oneOf([
    'top-left', 'top-right', 'top-center',
    'bottom-left', 'bottom-right', 'bottom-center'
  ]),
  showIcon: PropTypes.bool
};

export default NotificationToast;
