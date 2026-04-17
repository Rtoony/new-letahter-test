import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { useStore } from '../store';

const getForgeMaterial = (type: string) => {
  switch (type) {
    case 'brass':
      return { color: "#B8860B", metalness: 0.9, roughness: 0.2, envMapIntensity: 1.5 };
    case 'steel':
      return { color: "#71797E", metalness: 0.8, roughness: 0.3, envMapIntensity: 1 };
    case 'leather':
      return { color: "#4B3621", metalness: 0, roughness: 0.9, envMapIntensity: 0.2 };
    default:
      return { color: "#2A2A2A", metalness: 0.8, roughness: 0.1, envMapIntensity: 1 };
  }
};

function BackPlateMesh() {
  const { design } = useStore();
  const geometry = useMemo(() => {
    const w = design.width + design.platePadding * 2;
    const h = design.height + design.platePadding * 2;
    const t = design.plateThickness;
    if (t <= 0) return null;

    const geo = new THREE.BoxGeometry(w, h, t);
    geo.translate(0, 0, -t / 2);
    return geo;
  }, [design.width, design.height, design.platePadding, design.plateThickness]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
       <meshStandardMaterial {...getForgeMaterial(design.materialType)} />
    </mesh>
  );
}

function BorderMesh({ border, index }: { border: any, index: number }) {
  const { design } = useStore();
  
  const geometry = useMemo(() => {
    const { width, height, shape, cornerRadius, baseThickness, customBoundaryPath } = design;
    const w = width;
    const h = height;
    const r = Math.min(cornerRadius, w/2, h/2);

    let s = new THREE.Shape();
    if (shape === 'circle') {
      s.absarc(0, 0, w/2, 0, Math.PI * 2, false);
    } else if (shape === 'shield') {
      s.moveTo(0, -h/2);
      s.lineTo(w/2, h * 0.2);
      s.quadraticCurveTo(w/2, h * 0.5, 0, h * 0.6);
      s.quadraticCurveTo(-w/2, h * 0.5, -w/2, h * 0.2);
      s.lineTo(0, -h/2);
    } else if (shape === 'custom' && customBoundaryPath) {
       const loader = new SVGLoader();
       const data = loader.parse(`<svg><path d="${customBoundaryPath}" /></svg>`);
       const paths = data.paths;
       if (paths.length > 0) {
          const shapes = SVGLoader.createShapes(paths[0]);
          if (shapes.length > 0) {
             const customShape = shapes[0];
             // Normalize to design size
             const points = customShape.getPoints();
             const box = new THREE.Box2().setFromPoints(points);
             const size = new THREE.Vector2();
             box.getSize(size);
             const center = new THREE.Vector2();
             box.getCenter(center);
             const bs = design.customBoundaryScale || 1.0;
             const scaleX = (width / size.x) * bs;
             const scaleY = (height / size.y) * bs;
             points.forEach(p => {
                p.x = (p.x - center.x) * scaleX;
                p.y = (p.y - center.y) * scaleY;
             });
             s = customShape;
          }
       }
    } else {
      s.moveTo(-w/2 + r, -h/2);
      s.lineTo(w/2 - r, -h/2);
      s.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
      s.lineTo(w/2, h/2 - r);
      s.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
      s.lineTo(-w/2 + r, h/2);
      s.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
      s.lineTo(-w/2, -h/2 + r);
      s.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
    }

    // Creating a hollow border shape
    const scaleX = (w - border.offset * 2) / w;
    const scaleY = (h - border.offset * 2) / h;
    const innerScaleX = (w - (border.offset + border.width) * 2) / w;
    const innerScaleY = (h - (border.offset + border.width) * 2) / h;

    // This is simplified: just a solid extrusion of the border width for visualization
    const extrudeSettings = { depth: 1, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(s, extrudeSettings);
    geo.scale(scaleX, scaleY, 1);
    
    return geo;
  }, [design, border]);

  return (
    <mesh geometry={geometry} position={[0, 0, design.baseThickness + 0.1]}>
      <meshStandardMaterial 
        color={design.materialType === 'leather' ? "#3C2A1A" : "#E67E22"} 
        transparent 
        opacity={design.materialType === 'leather' ? 0.8 : 0.4} 
      />
    </mesh>
  );
}

function PatternMesh() {
  const { design } = useStore();
  
  const geometry = useMemo(() => {
    if (!design.pattern.enabled || !design.pattern.svgPath) return null;
    
    const loader = new SVGLoader();
    const data = loader.parse(`<svg><path d="${design.pattern.svgPath}" /></svg>`);
    const paths = data.paths;
    if (paths.length === 0) return null;
    
    const shapes = SVGLoader.createShapes(paths[0]);
    if (shapes.length === 0) return null;
    
    const patternShape = shapes[0];
    const extrudeSettings = {
      depth: design.pattern.depth,
      bevelEnabled: false,
    };
    
    const geo = new THREE.ExtrudeGeometry(patternShape, extrudeSettings);
    
    // Normalize to a specific reference size (100x100) first
    // This removes any intrinsic SVG coordinate bias
    geo.computeBoundingBox();
    const box = geo.boundingBox!;
    const rawSize = new THREE.Vector3();
    box.getSize(rawSize);
    const center = new THREE.Vector3();
    box.getCenter(center);
    
    geo.translate(-center.x, -center.y, 0);
    
    // Calculate scaling to meet user intent
    // design.pattern.scale * design.width is usually too big.
    // Let's say 1.0 scale means it fills the stamp width.
    const fillScale = design.width / Math.max(rawSize.x, rawSize.y);
    geo.scale(design.pattern.scale * fillScale, design.pattern.scale * fillScale, 1);
    
    return geo;
  }, [design.pattern.enabled, design.pattern.svgPath, design.pattern.scale, design.pattern.depth, design.width]);

  if (!geometry) return null;

  const zPos = design.pattern.mode === 'emboss' 
    ? design.baseThickness 
    : design.baseThickness - design.pattern.depth + 0.01;

  const materialProps = useMemo(() => {
    const base = getForgeMaterial(design.materialType);
    if (design.pattern.mode === 'emboss') {
      return { 
        ...base, 
        color: design.materialType === 'leather' ? "#3C2A1A" : "#E67E22", 
        emissive: design.materialType === 'leather' ? "#000" : "#E67E22",
        emissiveIntensity: design.materialType === 'leather' ? 0 : 0.2
      };
    } else {
      return { 
        ...base, 
        color: "#111", 
        metalness: 0, 
        roughness: 1 
      };
    }
  }, [design.materialType, design.pattern.mode]);

  return (
    <mesh 
      geometry={geometry} 
      position={[design.pattern.offsetX, design.pattern.offsetY, zPos]}
      rotation={[0, 0, 0]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
}

function StampMesh() {
  const { design } = useStore();
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const { width, height, cornerRadius, baseThickness, draftAngle, shape } = design;
    
    // Create Shape
    const s = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    const r = Math.min(cornerRadius, w, h);

    if (shape === 'circle') {
      s.absarc(0, 0, w, 0, Math.PI * 2, false);
    } else if (shape === 'shield') {
      s.moveTo(0, -h);
      s.lineTo(w, h * 0.4);
      s.quadraticCurveTo(w, h, 0, h * 1.2);
      s.quadraticCurveTo(-w, h, -w, h * 0.4);
      s.lineTo(0, -h);
    } else if (shape === 'hexagon') {
       for (let i = 0; i < 6; i++) {
          const a = (i * 60 * Math.PI) / 180;
          if (i === 0) s.moveTo(w * Math.cos(a), w * Math.sin(a));
          else s.lineTo(w * Math.cos(a), w * Math.sin(a));
       }
       s.closePath();
    } else if (shape === 'custom' && design.customBoundaryPath) {
       const loader = new SVGLoader();
       const data = loader.parse(`<svg><path d="${design.customBoundaryPath}" /></svg>`);
       const paths = data.paths;
       if (paths.length > 0) {
          const shapes = SVGLoader.createShapes(paths[0]);
          if (shapes.length > 0) {
             const customShape = shapes[0];
             const extrudeSettings = { depth: baseThickness, bevelEnabled: false };
             const geo = new THREE.ExtrudeGeometry(customShape, extrudeSettings);
             
             // Center and Scale the geometry
             geo.computeBoundingBox();
             const center = new THREE.Vector3();
             geo.boundingBox!.getCenter(center);
             geo.translate(-center.x, -center.y, 0); // Center in XY
             
             const size = new THREE.Vector3();
             geo.boundingBox!.getSize(size);
             const bs = design.customBoundaryScale || 1.0;
             const scaleX = (width / size.x) * bs;
             const scaleY = (height / size.y) * bs;
             geo.scale(scaleX, scaleY, 1);
             
             // Apply Taper (simplified as existing logic)
             const offset = baseThickness * Math.tan((draftAngle * Math.PI) / 180);
             const position = geo.attributes.position;
             for (let i = 0; i < position.count; i++) {
                const z = position.getZ(i);
                if (z > 0) {
                    const x = position.getX(i);
                    const y = position.getY(i);
                    const d = Math.sqrt(x*x + y*y);
                    const factor = d === 0 ? 1 : (d + offset) / d;
                    position.setX(i, x * factor);
                    position.setY(i, y * factor);
                }
             }
             position.needsUpdate = true;
             geo.computeVertexNormals();
             return geo;
          }
       }
       // Fallback to rect
       s.moveTo(-w + r, -h);
       s.lineTo(w - r, -h);
       s.quadraticCurveTo(w, -h, w, -h + r);
       s.lineTo(w, h - r);
       s.quadraticCurveTo(w, h, w - r, h);
       s.lineTo(-w + r, h);
       s.quadraticCurveTo(-w, h, -w, h - r);
       s.lineTo(-w, -h + r);
       s.quadraticCurveTo(-w, -h, -w + r, -h);
    } else { // Rectangle and Pointed Oval (Simplified)
      s.moveTo(-w + r, -h);
      s.lineTo(w - r, -h);
      s.quadraticCurveTo(w, -h, w, -h + r);
      s.lineTo(w, h - r);
      s.quadraticCurveTo(w, h, w - r, h);
      s.lineTo(-w + r, h);
      s.quadraticCurveTo(-w, h, -w, h - r);
      s.lineTo(-w, -h + r);
      s.quadraticCurveTo(-w, -h, -w + r, -h);
    }

    // Extrude with Draft Angle
    // We can simulate draft angle by creating two shapes: bottom and top
    // and using a custom geometry or just scaling the top vertices.
    // For now, let's use a standard extrude and modify vertices.
    const extrudeSettings = {
      depth: baseThickness,
      bevelEnabled: false
    };

    const geo = new THREE.ExtrudeGeometry(s, extrudeSettings);
    
    // Apply Taper
    const offset = baseThickness * Math.tan((draftAngle * Math.PI) / 180);
    const position = geo.attributes.position;
    for (let i = 0; i < position.count; i++) {
        const z = position.getZ(i);
        if (z > 0) { // Top face
            // We need to know which quadrant we are in to push outwards
            // This is harder than it looks for arbitrary shapes.
            // A simpler way is to scale the x/y relative to center for top vertices.
            const x = position.getX(i);
            const y = position.getY(i);
            
            // Calculate distance from center
            const d = Math.sqrt(x*x + y*y);
            const factor = d === 0 ? 1 : (d + offset) / d;
            
            position.setX(i, x * factor);
            position.setY(i, y * factor);
        }
    }
    position.needsUpdate = true;
    geo.computeVertexNormals();

    return geo;
  }, [design]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh geometry={geometry} ref={meshRef} castShadow receiveShadow>
        <meshStandardMaterial {...getForgeMaterial(design.materialType)} />
      </mesh>
      
      {/* Cutting Edge Highlights */}
      {design.cuttingEdge.enabled && (
        <mesh position={[0, 0, design.baseThickness + 0.1]}>
           <meshStandardMaterial 
             color={design.materialType === 'leather' ? "#2A1F13" : "#E67E22"} 
             emissive={design.materialType === 'leather' ? "#000" : "#E67E22"} 
             emissiveIntensity={design.materialType === 'leather' ? 0 : 0.5} 
             transparent 
             opacity={0.3} 
           />
        </mesh>
      )}

    </group>
  );
}

export default function Forge3D() {
  const { design } = useStore();
  const assemblyX = design.shape === 'custom' ? (design.customBoundaryOffsetX || 0) : 0;
  const assemblyY = design.shape === 'custom' ? (design.customBoundaryOffsetY || 0) : 0;

  return (
    <div className="w-full h-full relative bg-[#050505]">
       <div className="absolute top-4 left-4 flex gap-4 z-10">
          <div className="bg-[#1C1C1C]/90 px-3 py-1.5 rounded border border-[#333] flex items-center gap-2 shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-forge-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#AAA] font-mono">
              3D_Forge_Core
            </span>
          </div>
      </div>

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[50, 40, 50]} fov={30} />
        <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            rotateSpeed={0.5} 
            maxPolarAngle={Math.PI / 1.8}
            minDistance={20}
            maxDistance={200}
        />

        <ambientLight intensity={0.5} />
        <spotLight 
            position={[50, 100, 50]} 
            angle={0.15} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-50, 50, -50]} intensity={1} color="#F27D26" />

        <group position={[assemblyX, assemblyY, 0]}>
          <StampMesh />
          <PatternMesh />
          <BackPlateMesh />
          {design.borders.filter(b => b.enabled).map((b, i) => (
             <BorderMesh key={b.id} border={b} index={i} />
          ))}
        </group>

        {/* Studio Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#2d1a0a" roughness={1} metalness={0} />
        </mesh>
        
        <Grid 
            infiniteGrid 
            fadeDistance={100} 
            sectionThickness={1} 
            sectionSize={10} 
            sectionColor="#2A2C32" 
            cellColor="#151619" 
        />
        
        <Environment preset="studio" />
      </Canvas>

      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-forge-text-muted bg-black/40 px-3 py-2 rounded border border-white/5 pointer-events-none">
         <div className="flex flex-col gap-1">
            <span className="uppercase font-bold text-forge-accent">Slicer Advice</span>
            <span>• 100% Infill Required</span>
            <span>• 0.05mm - 0.1mm Layer Height</span>
            <span>• 4+ Wall Loops</span>
         </div>
      </div>
    </div>
  );
}
