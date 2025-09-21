import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './RecommendationList.module.css';

const RecommendationList = ({
  recommendations = [],
  userName = 'there',
  onRecommendationClick,
  onLoadMore,
  isLoading = false,
  hasMore = false
}) => {
  const [displayedRecommendations, setDisplayedRecommendations] = useState([]);

  useEffect(() => {
    setDisplayedRecommendations(recommendations);
  }, [recommendations]);

  const handleRecommendationClick = (recommendation) => {
    onRecommendationClick && onRecommendationClick(recommendation);
  };

  const getPersonalizedGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (hour < 12) timeGreeting = 'Good morning';
    else if (hour < 17) timeGreeting = 'Good afternoon';
    else timeGreeting = 'Good evening';

    return `${timeGreeting}, ${userName}!`;
  };

  const getRecommendationReason = (recommendation) => {
    const reasons = {
      'style-match': 'Matches your style preferences',
      'trending': 'Trending in your area',
      'similar-users': 'Liked by users with similar taste',
      'seasonal': 'Perfect for this season',
      'price-drop': 'Great value with recent price drop',
      'new-arrival': 'Just arrived in our collection'
    };

    return reasons[recommendation.reason] || 'Curated just for you';
  };

  if (displayedRecommendations.length === 0 && !isLoading) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <h3>No recommendations yet</h3>
        <p>We'll analyze your preferences and show personalized suggestions soon.</p>
      </div>
    );
  }

  return (
    <div className={styles.recommendationList}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.greeting}>
          <h1 className={styles.title}>
            {getPersonalizedGreeting()}
          </h1>
          <p className={styles.subtitle}>
            Here&apos;s what we think you&apos;ll love
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {displayedRecommendations.length}
            </span>
            <span className={styles.statLabel}>Recommendations</span>
          </div>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className={styles.recommendationsGrid}>
        {displayedRecommendations.map((recommendation, index) => (
          <div
            key={recommendation.id}
            className={styles.recommendationCard}
            onClick={() => handleRecommendationClick(recommendation)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.recommendationImage}>
              <img
                src={recommendation.image}
                alt={recommendation.name}
                loading="lazy"
              />
              <div className={styles.recommendationBadge}>
                {getRecommendationReason(recommendation)}
              </div>
              <div className={styles.recommendationOverlay}>
                <button className={styles.viewButton}>
                  View Details
                </button>
              </div>
            </div>

            <div className={styles.recommendationContent}>
              <div className={styles.recommendationHeader}>
                <h3 className={styles.recommendationName}>
                  {recommendation.name}
                </h3>
                <div className={styles.recommendationPrice}>
                  ${recommendation.price}
                </div>
              </div>

              <p className={styles.recommendationDescription}>
                {recommendation.description}
              </p>

              <div className={styles.recommendationMeta}>
                <div className={styles.recommendationCategory}>
                  {recommendation.category}
                </div>
                <div className={styles.recommendationConfidence}>
                  {Math.round(recommendation.confidence * 100)}% match
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Finding more recommendations...</p>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && !isLoading && (
        <div className={styles.loadMoreContainer}>
          <button
            className={styles.loadMoreButton}
            onClick={onLoadMore}
          >
            Load More Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

RecommendationList.propTypes = {
  recommendations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    category: PropTypes.string.isRequired,
    reason: PropTypes.string.isRequired,
    confidence: PropTypes.number.isRequired
  })),
  userName: PropTypes.string,
  onRecommendationClick: PropTypes.func,
  onLoadMore: PropTypes.func,
  isLoading: PropTypes.bool,
  hasMore: PropTypes.bool
};

export default RecommendationList;
