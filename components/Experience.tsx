import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import MagicParticles from './MagicParticles';
import { VisualMode } from '../types';

interface ExperienceProps {
  mode: VisualMode;
  rotation: number;
  text: string;
  textSize: number;
}

const Experience: React.FC<ExperienceProps> = ({ mode, rotation, text, textSize }) => {
  return (
    <div className="fixed inset-0 bg-black">
      <Canvas camera={{ position: [0, 0, 14], fov: 45 }}>
        <color attach="background" args={['#020202']} />
        
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
          <MagicParticles mode={mode} rotationStrength={rotation} text={text} textSize={textSize} />
        </Suspense>

        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.65} 
            luminanceSmoothing={0.9} 
            height={300} 
            intensity={0.3} 
            radius={0.6}
          />
        </EffectComposer>

        <OrbitControls enableZoom={true} enablePan={false} maxDistance={30} minDistance={2} />
      </Canvas>
    </div>
  );
};

export default Experience;