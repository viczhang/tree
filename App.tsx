import React, { useState, useEffect } from 'react';
import { VisualMode } from './types';
import Experience from './components/Experience';

const App: React.FC = () => {
  const [mode, setMode] = useState<VisualMode>(VisualMode.TREE);
  const [rotation, setRotation] = useState<number>(0);
  const [showUI, setShowUI] = useState<boolean>(false);

  // Mouse interaction for rotation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      setRotation(x);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Manual toggle
  const handleToggleMode = () => {
    setMode((prev) => {
      if (prev === VisualMode.TREE) return VisualMode.GALAXY;
      if (prev === VisualMode.GALAXY) return VisualMode.TEXT;
      return VisualMode.TREE;
    });
  };

  const getModeColor = (m: VisualMode) => {
    switch (m) {
      case VisualMode.TREE: return 'bg-green-900/30 border-green-500/50 text-green-200 shadow-green-900/20';
      case VisualMode.GALAXY: return 'bg-purple-900/30 border-purple-500/50 text-purple-200 shadow-purple-900/20';
      case VisualMode.TEXT: return 'bg-red-900/30 border-red-500/50 text-red-200 shadow-red-900/20';
      default: return '';
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-black cursor-crosshair select-none"
      onClick={handleToggleMode}
    >
      <Experience mode={mode} rotation={rotation} />
      
      {/* Info/Reveal Button */}
      <button 
        className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/10 border border-white/20 text-white/80 hover:bg-white/20 hover:text-white backdrop-blur-md transition-all duration-300 pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.5)] group active:scale-95"
        onMouseDown={(e) => { e.stopPropagation(); setShowUI(true); }}
        onMouseUp={(e) => { e.stopPropagation(); setShowUI(false); }}
        onMouseLeave={() => setShowUI(false)}
        onTouchStart={(e) => { e.stopPropagation(); setShowUI(true); }}
        onTouchEnd={(e) => { e.stopPropagation(); setShowUI(false); }}
        onClick={(e) => e.stopPropagation()}
        aria-label="Show Controls"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <span className={`absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-black/60 backdrop-blur text-xs text-white rounded transition-all duration-300 whitespace-nowrap ${showUI ? 'opacity-0 translate-x-4 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
          Hold to see info
        </span>
      </button>

      {/* Overlay Content Container */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Title Section - Slides down from top */}
        <div 
          className={`absolute top-0 left-0 p-8 pt-20 pl-8 z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showUI ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-12'
          }`}
        >
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-red-500 drop-shadow-lg filter">
            Celestial Tree
          </h1>
          <p className="mt-4 text-xl text-blue-100 opacity-90 font-light tracking-wide">
             Click anywhere to transform
          </p>
        </div>
        
        {/* Mode Indicator - Slides up from bottom */}
        <div 
          className={`absolute bottom-10 w-full text-center z-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            showUI ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
           <span 
             className={`inline-block px-6 py-2 rounded-full border backdrop-blur-md text-lg font-bold tracking-[0.2em] shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all duration-500 ${getModeColor(mode)}`}
           >
              {mode}
           </span>
        </div>
        
      </div>
    </div>
  );
};

export default App;