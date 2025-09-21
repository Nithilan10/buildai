'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard.jsx';
import NotificationToast from '../../components/NotificationToast.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import styles from './products.module.css';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [notification, setNotification] = useState(null);
  const [placingProduct, setPlacingProduct] = useState(null);
  const [isUpdatingCatalog, setIsUpdatingCatalog] = useState(false);

  // Mock product catalog
  const mockProducts = [
    {
      id: 'sofa-modern-1',
      name: 'Contemporary Velvet Sofa',
      category: 'Seating',
      price: 899,
      originalPrice: 1200,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
      rating: 4.5,
      reviewCount: 128,
      features: ['Velvet upholstery', 'Solid wood frame', '3-year warranty'],
      isNew: false,
      discount: 25
    },
    {
      id: 'chair-accent-1',
      name: 'Mid-Century Accent Chair',
      category: 'Seating',
      price: 299,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
      rating: 4.2,
      reviewCount: 89,
      features: ['Walnut legs', 'Linen fabric', 'Ergonomic design'],
      isNew: true,
      discount: 0
    },
    {
      id: 'table-coffee-1',
      name: 'Rustic Coffee Table',
      category: 'Tables',
      price: 199,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      rating: 4.7,
      reviewCount: 156,
      features: ['Reclaimed wood', 'Storage drawer', 'Easy assembly'],
      isNew: false,
      discount: 0
    },
    {
      id: 'lamp-floor-1',
      name: 'Industrial Floor Lamp',
      category: 'Lighting',
      price: 149,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=300&fit=crop',
      rating: 4.3,
      reviewCount: 73,
      features: ['Adjustable height', 'LED bulb included', 'Matte black finish'],
      isNew: false,
      discount: 25
    },
    {
      id: 'bookshelf-1',
      name: 'Minimalist Bookshelf',
      category: 'Storage',
      price: 349,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      rating: 4.6,
      reviewCount: 94,
      features: ['5 adjustable shelves', 'Oak veneer', 'Wall mounting kit'],
      isNew: true,
      discount: 0
    },
    {
      id: 'rug-area-1',
      name: 'Geometric Area Rug',
      category: 'Decor',
      price: 89,
      originalPrice: null,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      rating: 4.4,
      reviewCount: 167,
      features: ['100% wool', 'Non-slip backing', 'Easy to clean'],
      isNew: false,
      discount: 0
    }
  ];

  const categories = ['all', 'Seating', 'Tables', 'Lighting', 'Storage', 'Decor', 'Bedroom', 'Porcelain Floor & Wall Tile', 'Natural Stone Tile (Slate)', 'Vinyl Tile (Self-Adhesive)', 'Ceramic Tile', 'Porcelain Mosaic Tile (Sheet-Mounted)', 'Ceramic Mosaic Tile', 'Porcelain Paver (Outdoor)', 'Ceramic Floor Tile (Patterned)', 'Porcelain Floor Tile (Wood-Look)'];

  useEffect(() => {
    // Load products from API
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?q=all&category=all&style=all&maxPrice=2000');
        const data = await response.json();
        const apiProducts = data.products.length > 0 ? data.products : mockProducts;
        setProducts(apiProducts);
        setFilteredProducts(apiProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      }
      setIsLoading(false);
    };
    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategory, sortBy]);

  const handlePlaceInRoom = (product) => {
    setPlacingProduct(product.id);

    // Simulate AR placement
    setTimeout(() => {
      setPlacingProduct(null);
      setNotification({
        message: `${product.name} is ready to place in your room!`,
        type: 'success',
        duration: 4000
      });

      // Navigate to AR page with product data
      window.location.href = `/ar?product=${product.id}`;
    }, 1000);
  };

  const handleViewDetails = (product) => {
    setNotification({
      message: `Viewing details for ${product.name}`,
      type: 'info',
      duration: 3000
    });
  };

  const handleUpdateCatalog = async () => {
    setIsUpdatingCatalog(true);
    try {
      const response = await fetch('/api/products/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: 'tile' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNotification({
          message: `Catalog updated! Added ${data.productsAdded} new products`,
          type: 'success',
          duration: 5000
        });
        
        // Reload products to show the new ones
        const productsResponse = await fetch('/api/products?q=all&category=all&style=all&maxPrice=2000');
        const productsData = await productsResponse.json();
        setProducts(productsData.products);
        setFilteredProducts(productsData.products);
      } else {
        setNotification({
          message: `Failed to update catalog: ${data.message}`,
          type: 'error',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Failed to update catalog:', error);
      setNotification({
        message: 'Failed to update catalog. Please try again.',
        type: 'error',
        duration: 5000
      });
    } finally {
      setIsUpdatingCatalog(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner
          size="xl"
          text="Loading product catalog..."
          overlay={true}
        />
      </div>
    );
  }

  return (
    <div className={styles.productsPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Product Catalog</h1>
            <p className={styles.subtitle}>
              Discover furniture that matches your style
            </p>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>
                {filteredProducts.length}
              </span>
              <span className={styles.statLabel}>Products</span>
            </div>
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category:</label>
            <select
              className={styles.filterSelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort by:</label>
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <button
              className={styles.updateButton}
              onClick={handleUpdateCatalog}
              disabled={isUpdatingCatalog}
            >
              {isUpdatingCatalog ? 'Updating...' : '🔄 Update Catalog'}
            </button>
          </div>
        </div>

        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onPlaceInRoom={handlePlaceInRoom}
              onViewDetails={handleViewDetails}
              isLoading={placingProduct === product.id}
              showPlaceButton={true}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
            </div>
            <h3>No products found</h3>
            <p>Try adjusting your filters to see more products.</p>
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
