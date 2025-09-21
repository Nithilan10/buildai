import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './ProductCard.module.css';

const ProductCard = ({
  product,
  onPlaceInRoom,
  onViewDetails,
  isLoading = false,
  showPlaceButton = true
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const handlePlaceInRoom = (e) => {
    e.stopPropagation();
    onPlaceInRoom && onPlaceInRoom(product);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    onViewDetails && onViewDetails(product);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        {!imageLoaded && (
          <div className={styles.imageSkeleton}>
            <div className={styles.skeletonPulse} />
          </div>
        )}

        {imageError ? (
          <div className={styles.imageError}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            <span>Image not available</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className={`${styles.productImage} ${imageLoaded ? styles.loaded : ''}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {product.isNew && (
          <div className={styles.newBadge}>
            New
          </div>
        )}

        {product.discount > 0 && (
          <div className={styles.discountBadge}>
            -{product.discount}%
          </div>
        )}
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.productName} title={product.name}>
          {product.name}
        </h3>

        <p className={styles.productCategory}>
          {product.category}
        </p>

        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        <div className={styles.ratingContainer}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`${styles.star} ${i < Math.floor(product.rating) ? styles.filled : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            ))}
          </div>
          <span className={styles.ratingText}>
            {product.rating} ({product.reviewCount})
          </span>
        </div>

        <div className={styles.productFeatures}>
          {product.features && product.features.slice(0, 2).map((feature, index) => (
            <span key={index} className={styles.featureTag}>
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.productActions}>
        <button
          className={styles.viewDetailsButton}
          onClick={handleViewDetails}
          disabled={isLoading}
        >
          View Details
        </button>

        {showPlaceButton && (
          <button
            className={styles.placeButton}
            onClick={handlePlaceInRoom}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className={styles.buttonSpinner} />
            ) : (
              'Place in Room'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    image: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    reviewCount: PropTypes.number.isRequired,
    features: PropTypes.arrayOf(PropTypes.string),
    isNew: PropTypes.bool,
    discount: PropTypes.number
  }).isRequired,
  onPlaceInRoom: PropTypes.func,
  onViewDetails: PropTypes.func,
  isLoading: PropTypes.bool,
  showPlaceButton: PropTypes.bool
};

export default ProductCard;
