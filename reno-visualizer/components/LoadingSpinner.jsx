import React from 'react';
import PropTypes from 'prop-types';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({
  size = 'medium',
  color = 'primary',
  text = '',
  overlay = false,
  className = ''
}) => {
  const spinnerSize = {
    small: '16px',
    medium: '32px',
    large: '48px',
    xl: '64px'
  };

  const spinnerColor = {
    primary: '#3b82f6',
    secondary: '#64748b',
    white: '#ffffff',
    current: 'currentColor'
  };

  const containerClasses = [
    styles.spinnerContainer,
    overlay ? styles.overlay : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div
        className={styles.spinner}
        style={{
          width: spinnerSize[size],
          height: spinnerSize[size],
          borderColor: spinnerColor[color],
          borderTopColor: 'transparent'
        }}
      />
      {text && (
        <p className={styles.spinnerText} style={{ color: spinnerColor[color] }}>
          {text}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'white', 'current']),
  text: PropTypes.string,
  overlay: PropTypes.bool,
  className: PropTypes.string
};

export default LoadingSpinner;
