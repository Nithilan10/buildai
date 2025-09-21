'use client';

import React, { useState, useEffect } from 'react';
import NotificationToast from '../components/NotificationToast';
import LoadingSpinner from '../components/LoadingSpinner';
import ColorPaletteSwitcher from '../components/ColorPaletteSwitcher';
import styles from './home.module.css';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: 'Upload Your Room',
      description: 'Take a photo of your space and upload it to get started',
      icon: '📷',
      href: '/upload'
    },
    {
      title: 'AR Visualization',
      description: 'See furniture in your room using augmented reality',
      icon: '🪟',
      href: '/ar'
    },
    {
      title: 'Product Catalog',
      description: 'Browse our curated collection of furniture',
      icon: '🪑',
      href: '/products'
    },
    {
      title: 'AI Recommendations',
      description: 'Get personalized suggestions based on your style',
      icon: '🤖',
      href: '/recommend'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setNotification({
        message: 'Welcome to Reno Visualizer! Start by uploading a photo of your room.',
        type: 'success',
        duration: 5000
      });
    }, 1500);
  };

  const handleFeatureClick = (feature) => {
    setNotification({
      message: `Navigating to ${feature.title}...`,
      type: 'info',
      duration: 2000
    });

    setTimeout(() => {
      window.location.href = feature.href;
    }, 500);
  };

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Visualize Furniture in Your Space
            </h1>
            <p className={styles.heroSubtitle}>
              Use augmented reality to see how furniture looks in your room before you buy.
              Upload a photo, browse products, and place them virtually in your space.
            </p>

            <div className={styles.heroActions}>
              <button
                className={styles.primaryButton}
                onClick={handleGetStarted}
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner size="small" color="white" />
                ) : (
                  'Get Started'
                )}
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => handleFeatureClick(features[1])}
              >
                Try AR Demo
              </button>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.featureShowcase}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {features[currentFeature].icon}
                </div>
                <h3 className={styles.featureTitle}>
                  {features[currentFeature].title}
                </h3>
                <p className={styles.featureDescription}>
                  {features[currentFeature].description}
                </p>
                <button
                  className={styles.featureButton}
                  onClick={() => handleFeatureClick(features[currentFeature])}
                >
                  Try Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              How It Works
            </h2>
            <p className={styles.sectionSubtitle}>
              Four simple steps to transform your space
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={styles.featureCard}
                onClick={() => handleFeatureClick(feature)}
              >
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h3 className={styles.featureTitle}>
                  {feature.title}
                </h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
                <button className={styles.featureButton}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>10K+</div>
              <div className={styles.statLabel}>Rooms Visualized</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Furniture Items</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>95%</div>
              <div className={styles.statLabel}>Accuracy Rate</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>24/7</div>
              <div className={styles.statLabel}>AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to Transform Your Space?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of users who have already visualized their perfect room.
            </p>
            <button
              className={styles.primaryButton}
              onClick={() => handleFeatureClick(features[0])}
            >
              Start Visualizing Now
            </button>
          </div>
        </div>
      </section>

      {/* Color Palette Switcher */}
      <ColorPaletteSwitcher
        currentPalette="default"
        position="bottom-right"
      />

      {/* Notification System */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => setNotification(null)}
          position="top-right"
        />
      )}
    </div>
  );
}
