import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import PropTypes from 'prop-types';
import Room3D from './Room3D.jsx';
import styles from './ARCanvas.module.css';

// 3D Furniture Model Component
function FurnitureModel({ modelUrl, position, rotation, scale, onSelect }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const { animatedPosition, animatedRotation, animatedScale } = useSpring({
    animatedPosition: position,
    animatedRotation: rotation,
    animatedScale: scale,
    config: { mass: 1, tension: 280, friction: 60 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      // Add subtle floating animation
      meshRef.current.position.y = animatedPosition.y + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={animatedPosition}
      rotation={animatedRotation}
      scale={animatedScale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onSelect}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={hovered ? '#60a5fa' : '#94a3b8'}
        roughness={0.3}
        metalness={0.1}
      />
    </animated.mesh>
  );
}

FurnitureModel.propTypes = {
  modelUrl: PropTypes.string,
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
  rotation: PropTypes.arrayOf(PropTypes.number).isRequired,
  scale: PropTypes.arrayOf(PropTypes.number).isRequired,
  onSelect: PropTypes.func
};

// Room Floor Component
function RoomFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#e2e8f0" transparent opacity={0.3} />
    </mesh>
  );
}

// Main AR Canvas Component
const ARCanvas = ({
  roomImage,
  roomAnalysis,
  placedFurniture = [],
  onFurniturePlace,
  onFurnitureSelect,
  onFurnitureMove,
  onRoomElementSelect,
  isLoading = false
}) => {
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [cameraMode, setCameraMode] = useState('orbit'); // 'orbit' or 'free'
  const [selectedRoomElement, setSelectedRoomElement] = useState(null);

  const handleFurnitureSelect = (furnitureId) => {
    setSelectedFurniture(furnitureId);
    onFurnitureSelect && onFurnitureSelect(furnitureId);
  };

  const handleRoomElementSelect = (element) => {
    setSelectedRoomElement(element);
    onRoomElementSelect && onRoomElementSelect(element);
  };

  const handleCanvasClick = (event) => {
    if (event.target === event.currentTarget && selectedFurniture) {
      // Place furniture at clicked position
      const position = [event.point.x, 0, event.point.z];
      onFurniturePlace && onFurniturePlace(selectedFurniture, position);
      setSelectedFurniture(null);
    }
  };

  // Get camera settings from room analysis or use defaults
  const getCameraSettings = () => {
    if (roomAnalysis && roomAnalysis.camera) {
      return {
        position: roomAnalysis.camera.position,
        fov: roomAnalysis.camera.fov || 60
      };
    }
    return { position: [0, 2, 5], fov: 60 };
  };

  // Get lighting settings from room analysis or use defaults
  const getLightingSettings = () => {
    if (roomAnalysis && roomAnalysis.lighting) {
      return {
        ambient: roomAnalysis.lighting.ambient || 0.6,
        directional: roomAnalysis.lighting.directional || {
          position: [10, 10, 5],
          intensity: 1
        }
      };
    }
    return {
      ambient: 0.6,
      directional: { position: [10, 10, 5], intensity: 1 }
    };
  };

  const cameraSettings = getCameraSettings();
  const lightingSettings = getLightingSettings();

  return (
    <div className={styles.arContainer}>
      <div className={styles.arCanvas}>
        <Canvas
          camera={cameraSettings}
          shadows
          onClick={handleCanvasClick}
          className={styles.canvas}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={lightingSettings.ambient} />
            <directionalLight
              position={lightingSettings.directional.position}
              intensity={lightingSettings.directional.intensity}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />

            {/* Environment */}
            <Environment preset="studio" />

            {/* Room 3D Model or Simple Floor */}
            {roomAnalysis ? (
              <Room3D 
                roomAnalysis={roomAnalysis} 
                onElementSelect={handleRoomElementSelect}
              />
            ) : (
              <RoomFloor />
            )}

            {/* Contact Shadows */}
            <ContactShadows
              position={[0, -0.49, 0]}
              opacity={0.4}
              scale={10}
              blur={2.5}
              far={4}
            />

            {/* Placed Furniture */}
            {placedFurniture.map((furniture) => (
              <FurnitureModel
                key={furniture.id}
                modelUrl={furniture.modelUrl}
                position={furniture.position}
                rotation={furniture.rotation}
                scale={furniture.scale}
                onSelect={() => handleFurnitureSelect(furniture.id)}
              />
            ))}

            {/* Controls */}
            <OrbitControls
              enablePan={cameraMode === 'free'}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={10}
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 2}
            />
          </Suspense>
        </Canvas>

        {/* Room Image Background */}
        {roomImage && (
          <div
            className={styles.roomBackground}
            style={{ backgroundImage: `url(${roomImage})` }}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSpinner} />
            <p>Loading AR environment...</p>
          </div>
        )}

        {/* Controls Panel */}
        <div className={styles.controlsPanel}>
          <button
            className={`${styles.controlButton} ${cameraMode === 'orbit' ? styles.active : ''}`}
            onClick={() => setCameraMode('orbit')}
            title="Orbit Camera"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
            </svg>
          </button>
          <button
            className={`${styles.controlButton} ${cameraMode === 'free' ? styles.active : ''}`}
            onClick={() => setCameraMode('free')}
            title="Free Camera"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className={styles.instructions}>
          <p>
            {roomAnalysis ? 
              'Click on room elements to inspect • Click on floor to place furniture • Drag to rotate view • Scroll to zoom' :
              'Click on the floor to place furniture • Drag to rotate view • Scroll to zoom'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

ARCanvas.propTypes = {
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
    }),
    lighting: PropTypes.shape({
      ambient: PropTypes.number,
      directional: PropTypes.shape({
        position: PropTypes.arrayOf(PropTypes.number),
        intensity: PropTypes.number
      })
    })
  }),
  placedFurniture: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    modelUrl: PropTypes.string,
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    rotation: PropTypes.arrayOf(PropTypes.number).isRequired,
    scale: PropTypes.arrayOf(PropTypes.number).isRequired
  })),
  onFurniturePlace: PropTypes.func,
  onFurnitureSelect: PropTypes.func,
  onFurnitureMove: PropTypes.func,
  onRoomElementSelect: PropTypes.func,
  isLoading: PropTypes.bool
};

export default ARCanvas;
