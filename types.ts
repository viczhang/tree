export enum VisualMode {
  TREE = 'TREE',
  GALAXY = 'GALAXY',
  TEXT = 'TEXT'
}

export interface ParticleData {
  initialPosition: [number, number, number];
  treePosition: [number, number, number];
  galaxyPosition: [number, number, number];
  textPosition: [number, number, number];
  color: [number, number, number]; // RGB
  size: number;
}

export interface ControlState {
  mode: VisualMode;
  rotation: number; // -1 to 1
}