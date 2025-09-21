import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './ColorPaletteSwitcher.module.css';

const ColorPaletteSwitcher = ({
  currentPalette = 'default',
  onPaletteChange,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState(currentPalette);

  // Color palettes with muted tones
  const palettes = {
    default: {
      name: 'Default',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
        accent: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0'
      }
    },
    ocean: {
      name: 'Ocean',
      colors: {
        primary: '#0891b2',
        secondary: '#64748b',
        accent: '#06b6d4',
        background: '#ffffff',
        surface: '#f0f9ff',
        text: '#164e63',
        textSecondary: '#64748b',
        border: '#bae6fd'
      }
    },
    forest: {
      name: 'Forest',
      colors: {
        primary: '#059669',
        secondary: '#64748b',
        accent: '#10b981',
        background: '#ffffff',
        surface: '#f0fdf4',
        text: '#14532d',
        textSecondary: '#64748b',
        border: '#bbf7d0'
      }
    },
    sunset: {
      name: 'Sunset',
      colors: {
        primary: '#dc2626',
        secondary: '#64748b',
        accent: '#f97316',
        background: '#ffffff',
        surface: '#fff7ed',
        text: '#7c2d12',
        textSecondary: '#64748b',
        border: '#fed7aa'
      }
    },
    lavender: {
      name: 'Lavender',
      colors: {
        primary: '#7c3aed',
        secondary: '#64748b',
        accent: '#a855f7',
        background: '#ffffff',
        surface: '#faf5ff',
        text: '#581c87',
        textSecondary: '#64748b',
        border: '#e9d5ff'
      }
    },
    slate: {
      name: 'Slate',
      colors: {
        primary: '#334155',
        secondary: '#64748b',
        accent: '#475569',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0'
      }
    }
  };

  useEffect(() => {
    setSelectedPalette(currentPalette);
  }, [currentPalette]);

  const handlePaletteSelect = (paletteKey) => {
    setSelectedPalette(paletteKey);
    setIsOpen(false);

    // Apply colors to CSS custom properties
    const palette = palettes[paletteKey];
    if (palette) {
      Object.entries(palette.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--color-${key}`, value);
      });

      onPaletteChange && onPaletteChange(paletteKey, palette.colors);
    }
  };

  const getPositionClasses = () => {
    const positions = {
      'top-left': styles.topLeft,
      'top-right': styles.topRight,
      'bottom-left': styles.bottomLeft,
      'bottom-right': styles.bottomRight
    };
    return positions[position] || styles.bottomRight;
  };

  return (
    <div className={`${styles.switcher} ${getPositionClasses()}`}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        title="Change color palette"
      >
        <div className={styles.colorPreview}>
          <div
            className={styles.primaryColor}
            style={{ backgroundColor: palettes[selectedPalette]?.colors.primary }}
          />
          <div
            className={styles.accentColor}
            style={{ backgroundColor: palettes[selectedPalette]?.colors.accent }}
          />
        </div>
        <svg
          className={`${styles.arrow} ${isOpen ? styles.open : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9"/>
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Color Palettes</h3>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.paletteGrid}>
            {Object.entries(palettes).map(([key, palette]) => (
              <button
                key={key}
                className={`${styles.paletteOption} ${selectedPalette === key ? styles.selected : ''}`}
                onClick={() => handlePaletteSelect(key)}
              >
                <div className={styles.palettePreview}>
                  <div
                    className={styles.previewPrimary}
                    style={{ backgroundColor: palette.colors.primary }}
                  />
                  <div
                    className={styles.previewAccent}
                    style={{ backgroundColor: palette.colors.accent }}
                  />
                  <div
                    className={styles.previewSecondary}
                    style={{ backgroundColor: palette.colors.secondary }}
                  />
                </div>
                <span className={styles.paletteName}>
                  {palette.name}
                </span>
                {selectedPalette === key && (
                  <div className={styles.checkmark}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ColorPaletteSwitcher.propTypes = {
  currentPalette: PropTypes.string,
  onPaletteChange: PropTypes.func,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right'])
};

export default ColorPaletteSwitcher;
