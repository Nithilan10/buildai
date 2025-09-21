'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ARViewer from '../../components/ARViewer.jsx';
import NotificationToast from '../../components/NotificationToast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import styles from './ar.module.css';

export default function ARPage() {
  const searchParams = useSearchParams();
  const [roomImage, setRoomImage] = useState(null);
  const [roomAnalysis, setRoomAnalysis] = useState(null);
  const [placedFurniture, setPlacedFurniture] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wastageData, setWastageData] = useState(null);
  const [isCalculatingWastage, setIsCalculatingWastage] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showFurniturePanel, setShowFurniturePanel] = useState(true);
  const [selectedRoomElement, setSelectedRoomElement] = useState(null);

  // Product catalog from database
  const [productCatalog, setProductCatalog] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Get room image and analysis from sessionStorage
    const imageUrl = sessionStorage.getItem('roomImageUrl');
    const analysisData = sessionStorage.getItem('roomAnalysisData');
    
    console.log('AR Page - imageUrl from sessionStorage:', imageUrl ? 'Present' : 'Missing');
    console.log('AR Page - analysisData from sessionStorage:', analysisData ? 'Present' : 'Missing');
    
    if (imageUrl) {
      console.log('AR Page - imageUrl:', imageUrl);
      console.log('AR Page - imageUrl type:', imageUrl.startsWith('/') ? 'server URL' : 'other');
      setRoomImage(imageUrl);
      console.log('AR Page - setRoomImage called with server URL');
    }
    
    if (analysisData) {
      try {
        const parsedAnalysis = JSON.parse(analysisData);
        setRoomAnalysis(parsedAnalysis);
        console.log('AR Page - setRoomAnalysis called with:', parsedAnalysis);
      } catch (error) {
        console.error('Failed to parse room analysis:', error);
      }
    }

    // Load products from database
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?q=all&category=all&style=all&maxPrice=2000');
        const data = await response.json();
        if (data.products) {
          setProductCatalog(data.products);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      }
    };

    loadProducts();

    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, [searchParams]);

  const handleFurniturePlace = async (productId, position, surface = 'floor') => {
    const product = productCatalog.find(p => p.id === productId);
    if (product) {
      console.log('Placing furniture:', product.name, 'at position:', position, 'on surface:', surface);
      
      // Use pre-generated 3D model from database
      const modelUrl = product.model_url || null;
      console.log('Using pre-generated model URL:', modelUrl);

      const newProduct = {
        ...product,
        modelUrl: modelUrl, // Use the pre-generated model URL
        position,
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        id: `${product.id}-${Date.now()}`, // Unique ID for placed instance
        originalImage: product.image, // Store original image for fallback
        surface: surface, // Track which surface the tile is placed on
      };

      setPlacedFurniture(prev => [...prev, newProduct]);

      setNotification({
        message: `${product.name} placed on ${surface} successfully! ${modelUrl ? '3D model loaded.' : 'Using 2D representation.'}`,
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

  // Calculate wastage for placed tiles
  const calculateWastage = async () => {
    if (!roomAnalysis || placedFurniture.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please place some tiles first!'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setIsCalculatingWastage(true);
    
    try {
      // Filter only tiles from placed furniture
      const placedTiles = placedFurniture
        .filter(item => item.category && item.category.includes('Tile'))
        .map(tile => ({
          name: tile.name,
          dimensions: tile.dimensions,
          surface: tile.surface || 'floor', // Default to floor if not specified
          price: tile.price
        }));

      if (placedTiles.length === 0) {
        setNotification({
          type: 'error',
          message: 'No tiles found in placed items!'
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      console.log('Calculating wastage for tiles:', placedTiles);

      const response = await fetch('/api/calculate-wastage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomDimensions: roomAnalysis.dimensions,
          placedTiles
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWastageData(data.wastageData);
        
        setNotification({
          type: 'success',
          message: `Wastage calculated! ${data.wastageData.totalWastage.percentage}% wastage estimated.`
        });
        setTimeout(() => setNotification(null), 5000);
      } else {
        throw new Error('Failed to calculate wastage');
      }
    } catch (error) {
      console.error('Wastage calculation error:', error);
      setNotification({
        type: 'error',
        message: 'Failed to calculate wastage. Please try again.'
      });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsCalculatingWastage(false);
    }
  };

  const handleAddProduct = (product) => {
    setSelectedFurniture(product.id);
    setNotification({
      message: `Click on the floor to place ${product.name}`,
      type: 'info',
      duration: 4000
    });
  };

  const handleRoomElementSelect = (element) => {
    setSelectedRoomElement(element);
    setNotification({
      message: `Selected ${element.type}: ${element.id}`,
      type: 'info',
      duration: 3000
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
                    Place furniture in your uploaded room image and see how it looks
                  </p>
                  <p style={{color: '#fbbf24', fontSize: '0.75rem', marginTop: '0.5rem'}}>
                    Debug: roomImage = {roomImage ? 'Present' : 'Missing'} | roomAnalysis = {roomAnalysis ? 'Present' : 'Missing'}
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
          <button
            className={styles.wastageButton}
            onClick={calculateWastage}
            disabled={isCalculatingWastage}
          >
            {isCalculatingWastage ? 'Calculating...' : 'Calculate Wastage'}
          </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.arSection}>
          <ARViewer
            roomImage={roomImage}
            roomAnalysis={roomAnalysis}
            placedFurniture={placedFurniture}
            productCatalog={productCatalog}
            selectedFurniture={selectedFurniture}
            onFurniturePlace={handleFurniturePlace}
            onFurnitureSelect={handleFurnitureSelect}
            onFurnitureMove={handleFurnitureMove}
            onRoomElementSelect={handleRoomElementSelect}
            isLoading={isLoading}
          />
        </div>

        {/* Room Element Info Panel */}
        {selectedRoomElement && (
          <div className={styles.roomElementPanel}>
            <div className={styles.panelHeader}>
              <h2>Room Element</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedRoomElement(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.elementInfo}>
              <h3>{selectedRoomElement.type.charAt(0).toUpperCase() + selectedRoomElement.type.slice(1)}</h3>
              <p><strong>ID:</strong> {selectedRoomElement.id}</p>
              <p><strong>Material:</strong> {selectedRoomElement.material || 'Unknown'}</p>
              <p><strong>Color:</strong> {selectedRoomElement.color || 'Unknown'}</p>
              <p><strong>Dimensions:</strong> {selectedRoomElement.dimensions.width} × {selectedRoomElement.dimensions.height} × {selectedRoomElement.dimensions.depth} ft</p>
              <p><strong>Position:</strong> ({selectedRoomElement.position.x}, {selectedRoomElement.position.y}, {selectedRoomElement.position.z})</p>
            </div>
          </div>
        )}

        {/* Wastage Results Panel */}
        {wastageData && (
          <div className={styles.wastagePanel}>
            <div className={styles.panelHeader}>
              <h2>Tile Wastage Analysis</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setWastageData(null)}
              >
                ×
              </button>
            </div>
            <div className={styles.wastageInfo}>
              <div className={styles.wastageSummary}>
                <h3>Total Wastage: {wastageData.totalWastage.percentage}%</h3>
                <p className={styles.wastageReasoning}>{wastageData.totalWastage.reasoning}</p>
              </div>
              
              <div className={styles.surfacesBreakdown}>
                <h4>Surface Breakdown:</h4>
                {wastageData.surfaces.map((surface, index) => (
                  <div key={index} className={styles.surfaceItem}>
                    <h5>{surface.surface.charAt(0).toUpperCase() + surface.surface.slice(1)}</h5>
                    <p><strong>Dimensions:</strong> {surface.dimensions}</p>
                    <p><strong>Tile Size:</strong> {surface.tileSize}</p>
                    <p><strong>Tiles Needed:</strong> {surface.tilesNeeded}</p>
                    <p><strong>Wastage:</strong> {surface.wastagePercentage}%</p>
                    <p><strong>Total with Wastage:</strong> {surface.totalTilesWithWastage}</p>
                    <p><strong>Cost Estimate:</strong> ${surface.costEstimate}</p>
                    <p className={styles.wastageReasoning}>{surface.wastageReasoning}</p>
                  </div>
                ))}
              </div>

              {wastageData.recommendations && (
                <div className={styles.recommendations}>
                  <h4>Recommendations:</h4>
                  <ul>
                    {wastageData.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {wastageData.installationTips && (
                <div className={styles.installationTips}>
                  <h4>Installation Tips:</h4>
                  <ul>
                    {wastageData.installationTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {showFurniturePanel && (
          <div className={styles.furniturePanel}>
            <div className={styles.panelHeader}>
              <h2>Product Catalog</h2>
              <p>Select products to place in your room</p>
              
              {/* Category Filter */}
              <div className={styles.categoryFilter}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={styles.categorySelect}
                >
                  <option value="all">All Products</option>
                  <option value="Seating">Furniture</option>
                  <option value="Tables">Tables</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Storage">Storage</option>
                  <option value="Decor">Decor</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Porcelain Floor & Wall Tile">Tiles</option>
                  <option value="Natural Stone Tile (Slate)">Stone Tiles</option>
                  <option value="Vinyl Tile (Self-Adhesive)">Vinyl Tiles</option>
                  <option value="Ceramic Tile">Ceramic Tiles</option>
                </select>
              </div>
            </div>

            <div className={styles.furnitureGrid}>
              {productCatalog
                .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
                .map((product) => (
                <div
                  key={product.id}
                  className={`${styles.furnitureItem} ${selectedFurniture === product.id ? styles.selected : ''}`}
                  onClick={() => handleAddProduct(product)}
                >
                  <div className={styles.furniturePreview}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className={styles.furnitureIcon} style={{ display: 'none' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                      </svg>
                    </div>
                  </div>
                  <div className={styles.furnitureInfo}>
                    <h3 className={styles.furnitureName}>
                      {product.name}
                    </h3>
                    <p className={styles.furnitureCategory}>
                      {product.category}
                    </p>
                    <p className={styles.furniturePrice}>
                      ${product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.panelFooter}>
              <p className={styles.instructions}>
                💡 Click on any product above, then click on the floor to place it. Click on room elements (walls, vanity, etc.) to see details.
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
