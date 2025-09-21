import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import PropTypes from 'prop-types';
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
  placedFurniture = [],
  onFurniturePlace,
  onFurnitureSelect,
  onFurnitureMove,
  isLoading = false
}) => {
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [cameraMode, setCameraMode] = useState('orbit'); // 'orbit' or 'free'

  const handleFurnitureSelect = (furnitureId) => {
    setSelectedFurniture(furnitureId);
    onFurnitureSelect && onFurnitureSelect(furnitureId);
  };

  const handleCanvasClick = (event) => {
    if (event.target === event.currentTarget && selectedFurniture) {
      // Place furniture at clicked position
      const position = [event.point.x, 0, event.point.z];
      onFurniturePlace && onFurniturePlace(selectedFurniture, position);
      setSelectedFurniture(null);
    }
  };

  return (
    <div className={styles.arContainer}>
      <div className={styles.arCanvas}>
        <Canvas
          camera={{ position: [0, 2, 5], fov: 60 }}
          shadows
          onClick={handleCanvasClick}
          className={styles.canvas}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />

            {/* Environment */}
            <Environment preset="studio" />

            {/* Room Floor */}
            <RoomFloor />

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
          <p>Click on the floor to place furniture • Drag to rotate view • Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
};

ARCanvas.propTypes = {
  roomImage: PropTypes.string,
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
  isLoading: PropTypes.bool
};

export default ARCanvas;
