'use client';

import React, { useState, useEffect } from 'react';
import RecommendationList from '../../components/RecommendationList';
import NotificationToast from '../../components/NotificationToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './recommend.module.css';

export default function RecommendPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [userName, setUserName] = useState('there');
  const [notification, setNotification] = useState(null);

  // Mock AI recommendations data
  const mockRecommendations = [
    {
      id: 'rec-1',
      name: 'Scandinavian Lounge Set',
      description: 'Clean lines and natural materials create a serene living space. This set includes a comfortable sofa, coffee table, and accent chair perfect for modern living.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      price: 1299,
      category: 'Living Room',
      reason: 'style-match',
      confidence: 0.95
    },
    {
      id: 'rec-2',
      name: 'Industrial Workspace',
      description: 'Raw materials and functional design for the modern professional. Features a sturdy desk, ergonomic chair, and storage solutions.',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
      price: 899,
      category: 'Office',
      reason: 'trending',
      confidence: 0.87
    },
    {
      id: 'rec-3',
      name: 'Cozy Reading Nook',
      description: 'Create your personal sanctuary with plush seating, warm lighting, and book storage. Perfect for relaxation and contemplation.',
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
      price: 599,
      category: 'Reading Area',
      reason: 'similar-users',
      confidence: 0.92
    },
    {
      id: 'rec-4',
      name: 'Minimalist Bedroom Set',
      description: 'Simple elegance for restful nights. Platform bed, nightstands, and dresser in matching finishes with clean, contemporary styling.',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=400&h=300&fit=crop',
      price: 1599,
      category: 'Bedroom',
      reason: 'seasonal',
      confidence: 0.89
    },
    {
      id: 'rec-5',
      name: 'Rustic Dining Collection',
      description: 'Farmhouse charm meets modern functionality. Solid wood table, comfortable chairs, and storage buffet for memorable gatherings.',
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
      price: 1099,
      category: 'Dining Room',
      reason: 'price-drop',
      confidence: 0.91
    },
    {
      id: 'rec-6',
      name: 'Boho Chic Living Space',
      description: 'Eclectic patterns and textures for free-spirited style. Layered rugs, mixed materials, and global accents create visual interest.',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      price: 799,
      category: 'Living Room',
      reason: 'new-arrival',
      confidence: 0.88
    }
  ];

  useEffect(() => {
    // Simulate AI processing and loading
    const loadRecommendations = async () => {
      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get user name from localStorage or use default
      const savedName = localStorage.getItem('userName');
      if (savedName) {
        setUserName(savedName);
      }

      // Load initial recommendations
      setRecommendations(mockRecommendations.slice(0, 3));
      setIsLoading(false);
    };

    loadRecommendations();
  }, []);

  const handleRecommendationClick = (recommendation) => {
    setNotification({
      message: `Viewing ${recommendation.name} details...`,
      type: 'info',
      duration: 3000
    });

    // Navigate to product details or AR view
    // window.location.href = `/products/${recommendation.id}`;
  };

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);

    // Simulate loading more recommendations
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentLength = recommendations.length;
    const newRecommendations = mockRecommendations.slice(currentLength, currentLength + 2);

    if (newRecommendations.length > 0) {
      setRecommendations(prev => [...prev, ...newRecommendations]);
    } else {
      setHasMore(false);
    }

    setIsLoading(false);
  };

  const handleSavePreferences = () => {
    setNotification({
      message: 'Your preferences have been saved! We\'ll use them for future recommendations.',
      type: 'success',
      duration: 4000
    });
  };

  const handleGetPersonalizedName = () => {
    const name = prompt('What should we call you?');
    if (name && name.trim()) {
      setUserName(name.trim());
      localStorage.setItem('userName', name.trim());
      setNotification({
        message: `Welcome, ${name.trim()}! Your personalized recommendations are ready.`,
        type: 'success',
        duration: 4000
      });
    }
  };

  if (isLoading && recommendations.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner
          size="xl"
          text="Analyzing your style preferences..."
          overlay={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.recommendPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>AI Recommendations</h1>
            <p className={styles.subtitle}>
              Personalized furniture suggestions based on your style and preferences
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.personalizeButton}
              onClick={handleGetPersonalizedName}
            >
              Personalize Greeting
            </button>
            <button
              className={styles.saveButton}
              onClick={handleSavePreferences}
            >
              Save Preferences
            </button>
          </div>
        </div>

        <RecommendationList
          recommendations={recommendations}
          userName={userName}
          onRecommendationClick={handleRecommendationClick}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          hasMore={hasMore}
        />

        <div className={styles.aiInfo}>
          <div className={styles.aiCard}>
            <div className={styles.aiIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className={styles.aiContent}>
              <h3>How our AI works</h3>
              <p>
                Our recommendation system analyzes your browsing history, style preferences,
                and room dimensions to suggest furniture that perfectly matches your space
                and aesthetic. The more you interact with products, the better our suggestions become.
              </p>
            </div>
          </div>
        </div>
      </div>

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
