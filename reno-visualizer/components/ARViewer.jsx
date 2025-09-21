import React, { useRef, useState, useEffect, useCallback, Suspense } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Text } from '@react-three/drei';
import { TextureLoader } from 'three';
import PropTypes from 'prop-types';
import styles from './ARViewer.module.css';

// 3D Model Component
function Model3D({ url, position, rotation, scale, name }) {
  const { scene } = useGLTF(url);
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/helvetiker_regular.typeface.json"
      >
        {name}
      </Text>
    </group>
  );
}

// Room Floor Component
function RoomFloor({ roomDimensions, onClick, textureUrl }) {
  const { width = 8, depth = 6 } = roomDimensions || {};
  
  let texture = null;
  
  // Load texture if provided
  if (textureUrl) {
    try {
      texture = useLoader(TextureLoader, textureUrl);
    } catch (error) {
      console.error('RoomFloor - Failed to load floor texture:', error);
    }
  }
  
  return (
    <mesh 
      rotation={[-Math.PI / 2, 0, 0]} 
      position={[0, -0.1, 0]} 
      onClick={(event) => {
        console.log('Floor clicked!', { width, depth });
        onClick && onClick(event);
      }}
      onPointerOver={() => console.log('Hovering over floor')}
      onPointerOut={() => console.log('Left floor')}
    >
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial 
        map={texture}
        color="#f5f5f5"
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Wall Components
function Wall({ position, rotation, dimensions, textureUrl, wallType, onClick }) {
  let texture = null;
  
  // Only load texture if it's a tile texture (not room image)
  if (textureUrl) {
    try {
      texture = useLoader(TextureLoader, textureUrl);
    } catch (error) {
      console.error(`Wall ${wallType} - Failed to load tile texture:`, error);
    }
  }
  
  return (
    <mesh 
      position={position} 
      rotation={rotation} 
      onClick={(event) => {
        console.log(`Wall ${wallType} clicked!`, { position, rotation, dimensions });
        onClick && onClick(event);
      }}
      onPointerOver={() => console.log(`Hovering over ${wallType} wall`)}
      onPointerOut={() => console.log(`Left ${wallType} wall`)}
    >
      <planeGeometry args={dimensions} />
      <meshStandardMaterial 
        map={texture}
        color="#ffffff"
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

// Room Structure Component - Creates empty room with proper dimensions
function RoomStructure({ roomAnalysis, wallTextures, onWallClick }) {
  // Extract room dimensions from analysis or use defaults
  const roomWidth = roomAnalysis?.dimensions?.width || 8;
  const roomDepth = roomAnalysis?.dimensions?.depth || 6;
  const roomHeight = roomAnalysis?.dimensions?.height || 8;
  
  console.log('RoomStructure - dimensions:', { roomWidth, roomDepth, roomHeight });
  console.log('RoomStructure - roomAnalysis:', roomAnalysis);
  console.log('RoomStructure - wallTextures:', wallTextures);
  
  const halfWidth = roomWidth / 2;
  const halfDepth = roomDepth / 2;
  const halfHeight = roomHeight / 2;
  
  return (
    <group>
      {/* Floor */}
      <RoomFloor 
        roomDimensions={{ width: roomWidth, depth: roomDepth }}
        onClick={onWallClick}
        textureUrl={wallTextures.floor}
      />
      
      {/* Back Wall */}
      <Wall 
        position={[0, halfHeight, -halfDepth]} 
        rotation={[0, 0, 0]} 
        dimensions={[roomWidth, roomHeight]} 
        textureUrl={wallTextures.back}
        wallType="back"
        onClick={onWallClick}
      />
      
      {/* Left Wall */}
      <Wall 
        position={[-halfWidth, halfHeight, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        dimensions={[roomDepth, roomHeight]} 
        textureUrl={wallTextures.left}
        wallType="left"
        onClick={onWallClick}
      />
      
      {/* Right Wall */}
      <Wall 
        position={[halfWidth, halfHeight, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        dimensions={[roomDepth, roomHeight]} 
        textureUrl={wallTextures.right}
        wallType="right"
        onClick={onWallClick}
      />
      
      {/* Front Wall */}
      <Wall 
        position={[0, halfHeight, halfDepth]} 
        rotation={[0, Math.PI, 0]} 
        dimensions={[roomWidth, roomHeight]} 
        textureUrl={wallTextures.front}
        wallType="front"
        onClick={onWallClick}
      />
    </group>
  );
}

// Main 3D Scene Component
function Scene3D({ 
  roomAnalysis, 
  placedFurniture, 
  wallTextures,
  onFurniturePlace,
  onFurnitureSelect,
  selectedFurniture 
}) {
  const { camera } = useThree();
  const [hovered, setHovered] = useState(null);

  // Get room dimensions from new analysis structure
  const roomWidth = roomAnalysis?.dimensions?.width || 8;
  const roomDepth = roomAnalysis?.dimensions?.depth || 6;

  // Set up camera position based on room size
  useEffect(() => {
    const maxDimension = Math.max(roomWidth, roomDepth);
    const cameraDistance = maxDimension * 1.5;
    camera.position.set(cameraDistance, cameraDistance * 0.8, cameraDistance);
    camera.lookAt(0, 0, 0);
  }, [camera, roomWidth, roomDepth]);

  const handleClick = useCallback((event) => {
    event.stopPropagation();
    
    console.log('Canvas clicked! selectedFurniture:', selectedFurniture);
    console.log('Click event details:', {
      point: event.point,
      object: event.object,
      distance: event.distance
    });
    
    if (selectedFurniture) {
      // Calculate position based on click
      const point = event.point;
      const position = [point.x, point.y, point.z]; // Use actual Y position
      
      console.log('3D Placement at:', position);
      console.log('Calling onFurniturePlace with:', selectedFurniture, position);
      onFurniturePlace && onFurniturePlace(selectedFurniture, position);
    } else {
      console.log('No furniture selected for placement');
    }
  }, [selectedFurniture, onFurniturePlace]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, 10, -10]} intensity={0.5} />

      {/* Environment */}
      <Environment preset="apartment" />

      {/* Empty Room Structure */}
      <RoomStructure 
        roomAnalysis={roomAnalysis}
        wallTextures={wallTextures}
        onWallClick={handleClick}
      />

      {/* Placed Furniture/Models */}
              {placedFurniture.map((furniture) => (
                <Suspense key={furniture.id} fallback={null}>
                  {furniture.modelUrl && furniture.modelUrl !== 'undefined' && furniture.modelUrl !== null ? (
                    <Model3D
                      url={furniture.modelUrl}
                      position={furniture.position}
                      rotation={furniture.rotation}
                      scale={furniture.scale}
                      name={furniture.name}
                    />
                  ) : (
                    // Fallback to 2D representation
                    <mesh position={furniture.position} rotation={furniture.rotation} scale={furniture.scale}>
                      <planeGeometry args={[1, 1]} />
                      <meshBasicMaterial map={useLoader(TextureLoader, furniture.originalImage)} transparent />
                      <Text
                        position={[0, 0.6, 0]}
                        fontSize={0.15}
                        color="black"
                        anchorX="center"
                        anchorY="middle"
                      >
                        {furniture.name}
                      </Text>
                    </mesh>
                  )}
                </Suspense>
              ))}

      {/* Clickable Floor for Placement - Larger and more visible */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0.02, 0]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial 
          color={hovered ? "#4ade80" : "transparent"} 
          transparent 
          opacity={hovered ? 0.4 : 0}
        />
      </mesh>

      {/* Contact Shadows */}
      <ContactShadows 
        position={[0, -0.1, 0]} 
        opacity={0.4} 
        scale={Math.max(roomWidth, roomDepth)} 
        blur={1.5} 
        far={4.5} 
      />
    </>
  );
}

// Main Home Depot Style AR Viewer Component
const ARViewer = ({
  roomImage,
  roomAnalysis,
  placedFurniture = [],
  productCatalog = [],
  selectedFurniture = null,
  onFurniturePlace,
  onFurnitureSelect,
  onFurnitureMove,
  onRoomElementSelect,
  isLoading = false
}) => {
  const [wallTextures, setWallTextures] = useState({
    back: null,
    left: null,
    right: null,
    front: null,
    floor: null
  });
  const [roomSegments, setRoomSegments] = useState(null);

  // No need for room segments - we're creating an empty room
  useEffect(() => {
    console.log('ARViewer - roomAnalysis:', roomAnalysis);
    console.log('Creating empty room with dimensions from AI analysis');
  }, [roomAnalysis]);

  // Update wall/floor texture when furniture is placed
  const handleFurniturePlace = useCallback(async (furnitureId, position) => {
    console.log('handleFurniturePlace called with:', furnitureId, position);
    
    const product = productCatalog?.find(p => p.id === furnitureId);
    console.log('Found product:', product);
    
    let surfaceType = 'floor'; // Default surface type
    
    if (product && product.category && product.category.includes('Tile')) {
      console.log('Product is a tile, processing texture placement...');
      
      // Get room dimensions from new analysis structure
      const roomWidth = roomAnalysis?.dimensions?.width || 8;
      const roomDepth = roomAnalysis?.dimensions?.depth || 6;
      const roomHeight = roomAnalysis?.dimensions?.height || 8;
      
      console.log('Room dimensions:', { roomWidth, roomDepth, roomHeight });
      
      const halfWidth = roomWidth / 2;
      const halfDepth = roomDepth / 2;
      const halfHeight = roomHeight / 2;
      
      // Determine surface based on position relative to room dimensions
      const [x, y, z] = position;
      
      console.log('Position analysis:', { x, y, z, halfWidth, halfDepth, halfHeight });
      
      // Check if it's on the floor (y is close to 0 or negative)
      if (y <= 0.5) {
        surfaceType = 'floor';
        console.log('✅ Detected floor placement (y =', y, ')');
      } else {
        // Wall detection logic
        if (z < -halfDepth * 0.5) surfaceType = 'back';
        else if (x < -halfWidth * 0.5) surfaceType = 'left';
        else if (x > halfWidth * 0.5) surfaceType = 'right';
        else if (z > halfDepth * 0.5) surfaceType = 'front';
        else {
          // If in center area, default to back wall
          surfaceType = 'back';
        }
        console.log('✅ Detected wall placement:', surfaceType);
      }
      
      if (surfaceType) {
        if (surfaceType === 'floor') {
          // Apply texture to floor
          setWallTextures(prev => ({
            ...prev,
            floor: product.image
          }));
          console.log(`✅ Applied tile texture to floor:`, product.image);
        } else {
          // Apply texture to wall
          setWallTextures(prev => ({
            ...prev,
            [surfaceType]: product.image
          }));
          console.log(`✅ Applied tile texture to ${surfaceType} wall:`, product.image);
        }
      } else {
        console.log('❌ No surface detected for position:', position);
      }
    } else {
      console.log('Product is not a tile or not found');
    }

    // Call the original handler with surface information
    onFurniturePlace && onFurniturePlace(furnitureId, position, surfaceType);
  }, [productCatalog, onFurniturePlace, roomAnalysis]);

  if (!roomImage) {
    return (
      <div className={styles.arContainer}>
        <div className={styles.arSetup}>
          <div className={styles.setupContent}>
            <div className={styles.setupIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h2 className={styles.setupTitle}>Room Image Required</h2>
            <p className={styles.setupDescription}>
              Please upload a room image first to start the 3D visualization experience.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.arContainer}>
      <div className={styles.viewer3D}>
        <Canvas
          camera={{ position: [8, 6, 8], fov: 60 }}
          shadows
          className={styles.canvas}
        >
          <Scene3D
            roomAnalysis={roomAnalysis}
            placedFurniture={placedFurniture}
            wallTextures={wallTextures}
            onFurniturePlace={handleFurniturePlace}
            onFurnitureSelect={onFurnitureSelect}
            selectedFurniture={selectedFurniture}
          />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={15}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>

        {/* Loading Overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingContent}>
              <div className={styles.loadingSpinner} />
              <h3>Generating 3D Models...</h3>
              <p>Creating 3D models for your products</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={styles.instructions}>
          <div className={styles.instructionBubble}>
            <p>
              {selectedFurniture ? 
                'Click on the floor to place your selected item' :
                'Select an item from the sidebar, then click to place it in 3D'
              }
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            className={styles.controlButton}
            onClick={() => onFurnitureSelect && onFurnitureSelect(null)}
            title="Clear Selection"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

ARViewer.propTypes = {
  roomImage: PropTypes.string,
  roomAnalysis: PropTypes.shape({
    elements: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      id: PropTypes.string.isRequired,
      position: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.number
      }).isRequired,
      dimensions: PropTypes.shape({
        width: PropTypes.number,
        height: PropTypes.number,
        depth: PropTypes.number
      }).isRequired,
      material: PropTypes.string,
      color: PropTypes.string
    })),
    camera: PropTypes.shape({
      position: PropTypes.arrayOf(PropTypes.number),
      fov: PropTypes.number
    })
  }),
  placedFurniture: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    modelUrl: PropTypes.string,
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    rotation: PropTypes.arrayOf(PropTypes.number).isRequired,
    scale: PropTypes.arrayOf(PropTypes.number).isRequired
  })),
  productCatalog: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired
  })),
  selectedFurniture: PropTypes.string,
  onFurniturePlace: PropTypes.func,
  onFurnitureSelect: PropTypes.func,
  onFurnitureMove: PropTypes.func,
  onRoomElementSelect: PropTypes.func,
  isLoading: PropTypes.bool
};

export default ARViewer;