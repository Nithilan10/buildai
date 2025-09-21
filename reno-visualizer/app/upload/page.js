'use client';

import React, { useState, useCallback } from 'react';
import ImageUploader from '../../components/ImageUploader';
import NotificationToast from '../../components/NotificationToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './upload.module.css';

export default function UploadPage() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = useCallback((imageData) => {
    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      setUploadedImage(imageData);
      setIsProcessing(false);

      setNotification({
        message: 'Image uploaded successfully! You can now proceed to AR visualization.',
        type: 'success',
        duration: 4000
      });
    }, 1500);
  }, []);

  const handleImageError = useCallback((error) => {
    setNotification({
      message: error,
      type: 'error',
      duration: 5000
    });
  }, []);

  const handleProceedToAR = () => {
    if (uploadedImage) {
      // Navigate to AR page with image data
      window.location.href = `/ar?image=${encodeURIComponent(uploadedImage.previewUrl)}`;
    }
  };

  const handleStartOver = () => {
    setUploadedImage(null);
    setNotification(null);
  };

  return (
    <div className={styles.uploadPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upload Your Room</h1>
          <p className={styles.subtitle}>
            Upload a photo of your room to start visualizing furniture in AR
          </p>
        </div>

        <div className={styles.uploadSection}>
          {!uploadedImage ? (
            <div className={styles.uploadContainer}>
              <ImageUploader
                onImageUpload={handleImageUpload}
                onError={handleImageError}
                maxFileSize={15 * 1024 * 1024} // 15MB
                acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
                maxResolution={{ width: 4096, height: 4096 }}
              />

              {isProcessing && (
                <div className={styles.processingOverlay}>
                  <LoadingSpinner
                    size="large"
                    text="Processing your image..."
                    overlay={false}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className={styles.successContainer}>
              <div className={styles.successContent}>
                <div className={styles.successIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12"/>
                  </svg>
                </div>
                <h2 className={styles.successTitle}>Image Uploaded Successfully!</h2>
                <p className={styles.successMessage}>
                  Your room image has been processed and is ready for AR visualization.
                </p>

                <div className={styles.imagePreview}>
                  <img
                    src={uploadedImage.previewUrl}
                    alt="Uploaded room"
                    className={styles.previewImage}
                  />
                </div>

                <div className={styles.actionButtons}>
                  <button
                    className={styles.primaryButton}
                    onClick={handleProceedToAR}
                  >
                    Proceed to AR View
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={handleStartOver}
                  >
                    Upload Different Image
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.tipsSection}>
          <h3>Tips for best results:</h3>
          <ul className={styles.tipsList}>
            <li>Take photos in good lighting conditions</li>
            <li>Ensure the entire room is visible in the frame</li>
            <li>Keep the camera steady for clear images</li>
            <li>Include floor space where you want to place furniture</li>
          </ul>
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
