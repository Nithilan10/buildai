import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import PropTypes from 'prop-types';

// Individual Room Element Component
function RoomElement({ element, onSelect }) {
  const meshRef = useRef();

  const getGeometry = (type, dimensions) => {
    switch (type) {
      case 'wall':
        return <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />;
      case 'floor':
        return <boxGeometry args={[dimensions.width, dimensions.depth, dimensions.height]} />;
      case 'vanity':
      case 'toilet':
      case 'bathtub':
        return <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />;
      case 'window':
        return <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  const getMaterial = (element) => {
    const { material, color } = element;
    
    // Different material properties for different room elements
    const materialProps = {
      painted_drywall: { roughness: 0.8, metalness: 0.0 },
      tile: { roughness: 0.3, metalness: 0.0 },
      wood: { roughness: 0.6, metalness: 0.0 },
      porcelain: { roughness: 0.1, metalness: 0.0 },
      glass: { roughness: 0.0, metalness: 0.0, transparent: true, opacity: 0.3 }
    };

    return (
      <meshStandardMaterial
        color={color}
        {...materialProps[material]}
        castShadow={element.type !== 'window'}
        receiveShadow={true}
      />
    );
  };

  return (
    <mesh
      ref={meshRef}
      position={[element.position.x, element.position.y, element.position.z]}
      onClick={onSelect}
      castShadow={element.type !== 'window'}
      receiveShadow={true}
    >
      {getGeometry(element.type, element.dimensions)}
      {getMaterial(element)}
    </mesh>
  );
}

RoomElement.propTypes = {
  element: PropTypes.shape({
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
  }).isRequired,
  onSelect: PropTypes.func
};

// Main Room 3D Component
const Room3D = ({ roomAnalysis, onElementSelect }) => {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      // Add subtle rotation for better visualization
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  if (!roomAnalysis || !roomAnalysis.elements) {
    return null;
  }

  const handleElementSelect = (element) => {
    onElementSelect && onElementSelect(element);
  };

  return (
    <group ref={groupRef}>
      {roomAnalysis.elements.map((element) => (
        <RoomElement
          key={element.id}
          element={element}
          onSelect={() => handleElementSelect(element)}
        />
      ))}
    </group>
  );
};

Room3D.propTypes = {
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
    }))
  }),
  onElementSelect: PropTypes.func
};

export default Room3D;
