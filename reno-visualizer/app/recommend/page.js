'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './recommend.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import NotificationToast from '@/components/NotificationToast';

export default function RecommendPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [responses, setResponses] = useState({});
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Questions for the recommendation system
  const questions = [
    {
      id: 'mood',
      title: 'What mood are you trying to create?',
      type: 'select',
      options: [
        { value: 'calm', label: 'Calm & Serene', description: 'Peaceful, relaxing atmosphere' },
        { value: 'energetic', label: 'Energetic & Vibrant', description: 'Dynamic, lively space' },
        { value: 'elegant', label: 'Elegant & Sophisticated', description: 'Refined, luxurious feel' },
        { value: 'cozy', label: 'Cozy & Warm', description: 'Comfortable, inviting space' },
        { value: 'modern', label: 'Modern & Minimalist', description: 'Clean, contemporary design' },
        { value: 'rustic', label: 'Rustic & Natural', description: 'Earthly, organic feel' }
      ]
    },
    {
      id: 'color_preference',
      title: 'What color palette appeals to you?',
      type: 'select',
      options: [
        { value: 'neutral', label: 'Neutral Tones', description: 'Beiges, grays, whites' },
        { value: 'warm', label: 'Warm Colors', description: 'Reds, oranges, yellows' },
        { value: 'cool', label: 'Cool Colors', description: 'Blues, greens, purples' },
        { value: 'earth', label: 'Earth Tones', description: 'Browns, tans, terracotta' },
        { value: 'bold', label: 'Bold & Bright', description: 'Vibrant, saturated colors' },
        { value: 'monochrome', label: 'Monochrome', description: 'Black, white, grays' }
      ]
    },
    {
      id: 'room_type',
      title: 'What type of room is this?',
      type: 'select',
      options: [
        { value: 'bathroom', label: 'Bathroom', description: 'Wet area, moisture-resistant' },
        { value: 'kitchen', label: 'Kitchen', description: 'High traffic, easy to clean' },
        { value: 'living_room', label: 'Living Room', description: 'Comfortable, social space' },
        { value: 'bedroom', label: 'Bedroom', description: 'Private, relaxing retreat' },
        { value: 'entryway', label: 'Entryway', description: 'First impression, durable' },
        { value: 'outdoor', label: 'Outdoor', description: 'Weather-resistant, slip-resistant' }
      ]
    },
    {
      id: 'budget_range',
      title: 'What\'s your budget range?',
      type: 'select',
      options: [
        { value: 'budget', label: 'Budget-Friendly', description: 'Under $5/sq ft' },
        { value: 'mid_range', label: 'Mid-Range', description: '$5-15/sq ft' },
        { value: 'premium', label: 'Premium', description: '$15-30/sq ft' },
        { value: 'luxury', label: 'Luxury', description: '$30+/sq ft' }
      ]
    },
    {
      id: 'maintenance',
      title: 'How much maintenance are you willing to do?',
      type: 'select',
      options: [
        { value: 'low', label: 'Low Maintenance', description: 'Minimal cleaning, durable' },
        { value: 'medium', label: 'Medium Maintenance', description: 'Regular cleaning, some care' },
        { value: 'high', label: 'High Maintenance', description: 'Frequent care, special products' }
      ]
    },
    {
      id: 'style_preference',
      title: 'What style appeals to you most?',
      type: 'select',
      options: [
        { value: 'contemporary', label: 'Contemporary', description: 'Current, trendy designs' },
        { value: 'traditional', label: 'Traditional', description: 'Classic, timeless styles' },
        { value: 'industrial', label: 'Industrial', description: 'Raw, urban aesthetic' },
        { value: 'scandinavian', label: 'Scandinavian', description: 'Simple, functional beauty' },
        { value: 'mediterranean', label: 'Mediterranean', description: 'Warm, coastal vibes' },
        { value: 'bohemian', label: 'Bohemian', description: 'Eclectic, artistic flair' }
      ]
    }
  ];

  const handleResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateRecommendations();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const generateRecommendations = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend',
          preferences: responses,
          room: {
            type: responses.room_type || 'bathroom',
            dimensions: { width: 8, height: 8 }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.products || []);
        
    setNotification({
      type: 'success',
          message: 'Recommendations generated successfully!'
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error('Failed to generate recommendations');
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to generate recommendations. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(1);
    setResponses({});
    setRecommendations(null);
  };

  const currentQuestion = questions[currentStep - 1];
  const isLastStep = currentStep === questions.length;
  const canProceed = responses[currentQuestion?.id];

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner text="Generating personalized recommendations..." />
      </div>
    );
  }

  if (recommendations) {
  return (
      <div className={styles.recommendationsPage}>
        <div className={styles.header}>
          <h1>Your Personalized Recommendations</h1>
          <p>Based on your preferences, here are our top picks for you</p>
        </div>

        <div className={styles.recommendationsGrid}>
          {recommendations.map((product, index) => (
            <div key={index} className={styles.recommendationCard}>
              <div className={styles.productImage}>
                <img src={product.image || '/placeholder-tile.jpg'} alt={product.name} />
              </div>
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <div className={styles.productDetails}>
                  <span className={styles.price}>${product.price}</span>
                  <span className={styles.category}>{product.category}</span>
                </div>
                <div className={styles.recommendationReason}>
                  <strong>Why we recommend this:</strong>
                  <p>{product.recommendation_reason}</p>
                </div>
              </div>
            </div>
          ))}
          </div>

        <div className={styles.actions}>
          <button className={styles.resetButton} onClick={resetQuiz}>
            Take Quiz Again
            </button>
          <button className={styles.viewProductsButton} onClick={() => window.location.href = '/products'}>
            View All Products
            </button>
          </div>
        </div>
    );
  }

  return (
    <div className={styles.quizPage}>
      <div className={styles.header}>
        <h1>Personalized Tile Recommendations</h1>
        <p>Answer a few questions to get customized suggestions</p>
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${(currentStep / questions.length) * 100}%` }}
        />
        <span className={styles.progressText}>
          Step {currentStep} of {questions.length}
        </span>
      </div>

      <div className={styles.questionContainer}>
        <div className={styles.questionHeader}>
          <h2>{currentQuestion.title}</h2>
            </div>

        <div className={styles.optionsGrid}>
          {currentQuestion.options.map((option) => (
            <div
              key={option.value}
              className={`${styles.optionCard} ${
                responses[currentQuestion.id] === option.value ? styles.selected : ''
              }`}
              onClick={() => handleResponse(currentQuestion.id, option.value)}
            >
              <h3>{option.label}</h3>
              <p>{option.description}</p>
            </div>
          ))}
          </div>

        <div className={styles.navigation}>
          <button
            className={styles.previousButton}
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </button>
          <button
            className={styles.nextButton}
            onClick={handleNext}
            disabled={!canProceed}
          >
            {isLastStep ? 'Get Recommendations' : 'Next'}
          </button>
        </div>
      </div>

      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}