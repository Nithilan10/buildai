'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ARCanvas from '../../components/ARCanvas';
import NotificationToast from '../../components/NotificationToast';
import LoadingSpinner from '../../components/LoadingSpinner';
import styles from './ar.module.css';

export default function ARPage() {
  const searchParams = useSearchParams();
  const [roomImage, setRoomImage] = useState(null);
  const [placedFurniture, setPlacedFurniture] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showFurniturePanel, setShowFurniturePanel] = useState(true);

  // Mock furniture catalog
  const furnitureCatalog = [
    {
      id: 'sofa-1',
      name: 'Modern Sofa',
      modelUrl: '/models/sofa.glb',
      category: 'Seating',
      price: 899,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    {
      id: 'chair-1',
      name: 'Accent Chair',
      modelUrl: '/models/chair.glb',
      category: 'Seating',
      price: 299,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    {
      id: 'table-1',
      name: 'Coffee Table',
      modelUrl: '/models/table.glb',
      category: 'Tables',
      price: 199,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    },
    {
      id: 'lamp-1',
      name: 'Floor Lamp',
      modelUrl: '/models/lamp.glb',
      category: 'Lighting',
      price: 149,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1]
    }
  ];

  useEffect(() => {
    // Get room image from URL parameters
    const imageUrl = searchParams.get('image');
    if (imageUrl) {
      setRoomImage(imageUrl);
    }

    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [searchParams]);

  const handleFurniturePlace = (furnitureId, position) => {
    const furniture = furnitureCatalog.find(f => f.id === furnitureId);
    if (furniture) {
      const newFurniture = {
        ...furniture,
        position,
        id: `${furniture.id}-${Date.now()}`, // Unique ID for placed instance
      };

      setPlacedFurniture(prev => [...prev, newFurniture]);

      setNotification({
        message: `${furniture.name} placed successfully!`,
        type: 'success',
        duration: 3000
      });
    }
  };

  const handleFurnitureSelect = (furnitureId) => {
    setSelectedFurniture(furnitureId);
  };

  const handleFurnitureMove = (furnitureId, newPosition) => {
    setPlacedFurniture(prev =>
      prev.map(f =>
        f.id === furnitureId
          ? { ...f, position: newPosition }
          : f
      )
    );
  };

  const handleAddFurniture = (furniture) => {
    setSelectedFurniture(furniture.id);
    setNotification({
      message: `Click on the floor to place ${furniture.name}`,
      type: 'info',
      duration: 4000
    });
  };

  const handleClearRoom = () => {
    setPlacedFurniture([]);
    setNotification({
      message: 'Room cleared successfully',
      type: 'info',
      duration: 3000
    });
  };

  const handleSaveDesign = () => {
    // Mock save functionality
    setNotification({
      message: 'Design saved successfully! You can view it in your saved designs.',
      type: 'success',
      duration: 4000
    });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner
          size="xl"
          text="Initializing AR environment..."
          overlay={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.arPage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>AR Room Visualizer</h1>
          <p className={styles.subtitle}>
            Place furniture in your room using augmented reality
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.toggleButton}
            onClick={() => setShowFurniturePanel(!showFurniturePanel)}
          >
            {showFurniturePanel ? 'Hide' : 'Show'} Furniture
          </button>
          <button
            className={styles.clearButton}
            onClick={handleClearRoom}
          >
            Clear Room
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSaveDesign}
          >
            Save Design
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.arSection}>
          <ARCanvas
            roomImage={roomImage}
            placedFurniture={placedFurniture}
            onFurniturePlace={handleFurniturePlace}
            onFurnitureSelect={handleFurnitureSelect}
            onFurnitureMove={handleFurnitureMove}
            isLoading={false}
          />
        </div>

        {showFurniturePanel && (
          <div className={styles.furniturePanel}>
            <div className={styles.panelHeader}>
              <h2>Furniture Catalog</h2>
              <p>Select furniture to place in your room</p>
            </div>

            <div className={styles.furnitureGrid}>
              {furnitureCatalog.map((furniture) => (
                <div
                  key={furniture.id}
                  className={`${styles.furnitureItem} ${selectedFurniture === furniture.id ? styles.selected : ''}`}
                  onClick={() => handleAddFurniture(furniture)}
                >
                  <div className={styles.furniturePreview}>
                    <div className={styles.furnitureIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.furnitureInfo}>
                    <h3 className={styles.furnitureName}>
                      {furniture.name}
                    </h3>
                    <p className={styles.furnitureCategory}>
                      {furniture.category}
                    </p>
                    <p className={styles.furniturePrice}>
                      ${furniture.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.panelFooter}>
              <p className={styles.instructions}>
                💡 Click on any furniture item above, then click on the floor to place it
              </p>
            </div>
          </div>
        )}
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
