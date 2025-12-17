import * as THREE from 'three';

const COUNT = 18000; // Reduced from 25000 for a less dense, more magical feel

export const generateParticles = (text: string = "MERRY\nCHRISTMAS", textSize: number = 120) => {
  const treeData: Float32Array = new Float32Array(COUNT * 3);
  const galaxyData: Float32Array = new Float32Array(COUNT * 3);
  const textData: Float32Array = new Float32Array(COUNT * 3);
  const colors: Float32Array = new Float32Array(COUNT * 3);

  const colorTreeGreen = new THREE.Color('#00ff44');
  const colorTreeRed = new THREE.Color('#ff0055');
  const colorTreeGold = new THREE.Color('#ffcc00');
  
  // --- Text Shape Generation (Canvas Sampling) ---
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const width = 1024;
  const height = 512;
  canvas.width = width;
  canvas.height = height;

  let validPixels: {x: number, y: number}[] = [];

  if (ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'white';
    // Use a font stack that supports unicode (Chinese, etc) while keeping the Serif look
    ctx.font = `bold ${textSize}px "Times New Roman", "Songti SC", "SimSun", "Noto Serif SC", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = text.split('\n');
    const lineHeight = textSize * 1.2;
    // Calculate start Y to center the block of text vertically
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      ctx.fillText(line.toUpperCase(), width / 2, startY + (index * lineHeight));
    });
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Step 3 provides good resolution for the shape without being too grid-like
    for (let y = 0; y < height; y += 3) {
        for (let x = 0; x < width; x += 3) {
            const i = (y * width + x) * 4;
            if (data[i] > 128) {
                validPixels.push({x, y});
            }
        }
    }
  }

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;

    // --- Tree Shape (Cone Spiral) ---
    const y = (Math.random() * 5) - 2.5; 
    const radiusAtHeight = Math.max(0, (2.5 - y) * 0.5); 
    const angle = y * 15 + Math.random() * Math.PI * 2; 
    
    const scatter = Math.random() * 0.15; // Volume scatter
    
    treeData[i3] = Math.cos(angle) * (radiusAtHeight + scatter);
    treeData[i3 + 1] = y;
    treeData[i3 + 2] = Math.sin(angle) * (radiusAtHeight + scatter);

    // --- Galaxy Shape ---
    const randomR = Math.random();
    const r = Math.pow(randomR, 1.8) * 9.0; 
    const branches = 5;
    const branchIdx = i % branches;
    const branchBaseAngle = (branchIdx / branches) * (Math.PI * 2);
    const spiralAngle = r * 0.55; 
    const curveFreq = 3.2; 
    const curvePhase = branchIdx * 2.1; 
    const widthPulse = Math.sin(r * curveFreq + curvePhase); 
    const densityFactor = 0.8 + (widthPulse * 0.4);
    const baseSpread = 0.4 + (r * 0.12);
    const bellRandom = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
    const randomAngleOffset = bellRandom * baseSpread * densityFactor * 2.8;
    const theta = branchBaseAngle + spiralAngle + randomAngleOffset;

    const gx = Math.cos(theta) * r;
    const gz = Math.sin(theta) * r;
    const noise = 0.15;
    const nx = (Math.random() - 0.5) * noise;
    const nz = (Math.random() - 0.5) * noise;
    const thickness = 0.9 * Math.exp(-r * 0.3) * densityFactor; 
    const gy = (Math.random() - 0.5) * thickness;

    const tilt = Math.PI * 0.25; 
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    const tiltedY = gy * cosT - (gz + nz) * sinT;
    const tiltedZ = gy * sinT + (gz + nz) * cosT;

    galaxyData[i3] = gx + nx;
    galaxyData[i3 + 1] = tiltedY;
    galaxyData[i3 + 2] = tiltedZ;

    // --- Text Shape ---
    if (validPixels.length > 0) {
        const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];
        const scale = 0.016; 
        
        // Fuzziness factor: Scatter particles around the target pixel
        const fuzz = 0.18; 
        const fuzzZ = 0.6;

        textData[i3] = (pixel.x - width / 2) * scale + (Math.random() - 0.5) * fuzz;
        textData[i3 + 1] = -(pixel.y - height / 2) * scale + (Math.random() - 0.5) * fuzz;
        // Increased Z-depth significantly for a voluminous, fuzzy cloud look
        textData[i3 + 2] = (Math.random() - 0.5) * fuzzZ; 
    } else {
        textData[i3] = 0;
        textData[i3 + 1] = 0;
        textData[i3 + 2] = 0;
    }

    // --- Colors ---
    let c = new THREE.Color();
    const randCol = Math.random();
    
    if (randCol > 0.90) c.copy(colorTreeGold); 
    else if (randCol > 0.65) c.copy(colorTreeRed); 
    else c.copy(colorTreeGreen); 
    
    c.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);

    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  return { treeData, galaxyData, textData, colors };
};