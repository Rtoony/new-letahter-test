export type StampShape = 'rectangle' | 'circle' | 'shield' | 'hexagon' | 'pointed-oval' | 'custom';

export interface StampDesign {
  id: string;
  name: string;
  shape: StampShape;
  
  // Dimensions (mm)
  width: number;
  height: number;
  cornerRadius: number;
  baseThickness: number;
  
  // Engineering
  draftAngle: number; // 0-45 degrees
  nozzleDiameter: number; // 0.2, 0.4, 0.6, 0.8
  
  // Features
  cuttingEdge: {
    enabled: boolean;
    width: number;
    height: number;
    draft: number;
  };
  
  borders: {
    id: string;
    enabled: boolean;
    offset: number;
    width: number;
    height: number;
    draft: number;
  }[];
  
  stitching: {
    enabled: boolean;
    type: 'post' | 'channel';
    spacing: number;
    diameter: number;
    offset: number;
    height: number;
  };
  
  pattern: {
    enabled: boolean;
    svgPath?: string;
    scale: number;
    offsetX: number;
    offsetY: number;
    mode: 'emboss' | 'deboss';
    depth: number;
  };
  customBoundaryPath?: string;
  customBoundaryScale?: number;
  customBoundaryOffsetX?: number;
  customBoundaryOffsetY?: number;
  
  // Back Plate (Engine Support)
  plateThickness: number;
  platePadding: number;
  
  // Visualization
  materialType: 'brass' | 'steel' | 'leather';
}

export interface ForgeState {
  design: StampDesign;
  activeParameter: string | null;
  history: {
    past: StampDesign[];
    future: StampDesign[];
  };
  
  // Actions
  updateDesign: (updates: Partial<StampDesign>) => void;
  setActiveParameter: (param: string | null) => void;
  undo: () => void;
  redo: () => void;
}
