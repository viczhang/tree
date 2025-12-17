import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateParticles } from '../utils/shapes';
import { VisualMode } from '../types';

interface MagicParticlesProps {
  mode: VisualMode;
  rotationStrength: number;
  text?: string;
  textSize?: number;
}

interface ParticleData {
  treeData: Float32Array;
  galaxyData: Float32Array;
  textData: Float32Array;
  colors: Float32Array;
}

interface ParticleLayerProps {
  mode: VisualMode;
  rotationStrength: number;
  speedMultiplier: number;
  opacity: number;
  size: number;
  data: ParticleData;
  enableSparkle: boolean;
}

const ParticleLayer: React.FC<ParticleLayerProps> = ({ 
  mode, 
  rotationStrength, 
  speedMultiplier, 
  opacity, 
  size, 
  data,
  enableSparkle
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  
  // Initialize current positions by cloning source data
  const currentPositions = useMemo(() => new Float32Array(data.treeData), [data.treeData]);
  
  const currentColors = useMemo(() => new Float32Array(data.colors), [data.colors]);

  useFrame((state, delta) => {
    if (!pointsRef.current || !geometryRef.current) return;

    const time = state.clock.elapsedTime;

    // 1. Interpolate Rotation
    const targetRotationY = rotationStrength * 2; 
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y, 
      targetRotationY + time * 0.1, 
      delta * 2 * speedMultiplier
    );

    // 2. Interpolate Particle Positions
    const positions = geometryRef.current.attributes.position.array as Float32Array;
    
    let targetData = data.treeData;
    if (mode === VisualMode.GALAXY) targetData = data.galaxyData;
    else if (mode === VisualMode.TEXT) targetData = data.textData;
    
    // Adjust speed based on mode
    let baseSpeed = 2.5;
    if (mode === VisualMode.GALAXY) baseSpeed = 3.0;
    if (mode === VisualMode.TEXT) baseSpeed = 2.0;

    const speed = baseSpeed * speedMultiplier;

    for (let i = 0; i < positions.length; i++) {
      // Lerp each coordinate towards target
      positions[i] = THREE.MathUtils.lerp(positions[i], targetData[i], delta * speed);
      
      // Add subtle sparkle jitter (position noise)
      if (enableSparkle) {
        let jitterAmount = 0;
        if (mode === VisualMode.GALAXY) jitterAmount = 0.03;
        // Increased jitter for TEXT mode to enhance the "fuzzy" feel
        else if (mode === VisualMode.TEXT) jitterAmount = 0.025; 
        // Keep tree jitter very low for a stable but "alive" look
        else if (mode === VisualMode.TREE) jitterAmount = 0.01;
        
        if (jitterAmount > 0) {
            positions[i] += (Math.random() - 0.5) * jitterAmount;
        }
      }
    }
    
    geometryRef.current.attributes.position.needsUpdate = true;

    // 3. Twinkle/Sparkle Effect (Color Modulation)
    const colors = geometryRef.current.attributes.color.array as Float32Array;
    const initialColors = data.colors;
    
    for (let i = 0; i < colors.length / 3; i++) {
      const i3 = i * 3;
      const phase = i * 0.5; // Random phase based on index
      
      let brightness = 1.0;

      if (enableSparkle) {
        // High frequency twinkle for the main layer
        const t = time * 5.0 + phase;
        // (sin + 1) / 2 gives 0..1
        const normSin = (Math.sin(t) + 1) / 2;
        // Raise to power to make the "bright" moments sharper/shorter (sparkle effect)
        const spike = Math.pow(normSin, 8); 
        
        // Base brightness reduced to 0.25 to reduce overall glow/bloom
        // Sparkle spikes go up significantly to create contrast
        brightness = 0.25 + spike * 1.5;
      } else {
        // Smoother, dimmer pulse for trails
        brightness = 0.4 + 0.2 * Math.sin(time * 2.0 + phase);
      }
      
      colors[i3]     = initialColors[i3] * brightness;
      colors[i3 + 1] = initialColors[i3 + 1] * brightness;
      colors[i3 + 2] = initialColors[i3 + 2] * brightness;
    }
    geometryRef.current.attributes.color.needsUpdate = true;

    // 4. Pulse scale
    const material = pointsRef.current.material as THREE.PointsMaterial;
    // Reduce scale pulse slightly for stability
    material.size = (size * 0.95) + Math.sin(time * 3) * (size * 0.05);
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={currentPositions.length / 3}
          array={currentPositions}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
        <bufferAttribute
          attach="attributes-color"
          count={currentColors.length / 3}
          array={currentColors}
          itemSize={3}
          usage={THREE.DynamicDrawUsage}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

const MagicParticles: React.FC<MagicParticlesProps> = ({ mode, rotationStrength, text, textSize }) => {
  const data = useMemo(() => generateParticles(text, textSize), [text, textSize]);

  return (
    <group>
      {/* Main Layer */}
      <ParticleLayer 
        mode={mode} 
        rotationStrength={rotationStrength} 
        speedMultiplier={1.0} 
        opacity={0.6} 
        size={0.15} 
        data={data}
        enableSparkle={true}
      />
      
      {/* Trail Layer 1 */}
      <ParticleLayer 
        mode={mode} 
        rotationStrength={rotationStrength} 
        speedMultiplier={0.6} 
        opacity={0.15} 
        size={0.12} 
        data={data}
        enableSparkle={false}
      />

      {/* Trail Layer 2 */}
      <ParticleLayer 
        mode={mode} 
        rotationStrength={rotationStrength} 
        speedMultiplier={0.3} 
        opacity={0.05} 
        size={0.1} 
        data={data}
        enableSparkle={false}
      />
    </group>
  );
};

export default MagicParticles;