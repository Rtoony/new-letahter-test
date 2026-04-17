import { create } from 'zustand';
import { temporal } from 'zundo';
import { ForgeState, StampDesign } from './types';

const initialDesign: StampDesign = {
  id: 'default',
  name: 'New Stamp Project',
  shape: 'rectangle',
  width: 40,
  height: 40,
  cornerRadius: 4,
  baseThickness: 5,
  draftAngle: 15,
  nozzleDiameter: 0.4,
  cuttingEdge: {
    enabled: true,
    width: 0.8,
    height: 3,
    draft: 10,
  },
  borders: [
    {
      id: 'border-1',
      enabled: false,
      offset: 2,
      width: 1.2,
      height: 1.5,
      draft: 15,
    },
    {
      id: 'border-2',
      enabled: false,
      offset: 4,
      width: 1.2,
      height: 1,
      draft: 15,
    }
  ],
  stitching: {
    enabled: false,
    type: 'post',
    spacing: 3.85,
    diameter: 1,
    offset: 3,
    height: 1.5,
  },
  pattern: {
    enabled: false,
    scale: 0.5,
    offsetX: 0,
    offsetY: 0,
    mode: 'emboss',
    depth: 1,
  },
  customBoundaryScale: 1.0,
  customBoundaryOffsetX: 0,
  customBoundaryOffsetY: 0,
  plateThickness: 5,
  platePadding: 5,
  materialType: 'brass',
};

export const useStore = create<ForgeState>()(
  temporal((set) => ({
    design: initialDesign,
    activeParameter: null,
    history: { past: [], future: [] },

    updateDesign: (updates) =>
      set((state) => ({
        design: { ...state.design, ...updates },
      })),

    setActiveParameter: (param) =>
      set({ activeParameter: param }),

    undo: () => {}, // Placeholder, zundo handles this via useTemporal
    redo: () => {}, // Placeholder, zundo handles this via useTemporal
  }))
);
