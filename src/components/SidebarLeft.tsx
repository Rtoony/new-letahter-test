import React from 'react';
import { useStore } from '../store';
import { 
  Maximize2, 
  Circle, 
  Square, 
  Shield as ShieldIcon, 
  Hexagon, 
  Layers, 
  Plus,
  Upload as UploadIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { StampShape } from '../types';
import { ParameterSlider } from './ParameterSlider';

export default function SidebarLeft() {
  const { design, updateDesign, setActiveParameter } = useStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: any) => updateDesign(updates);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'image/svg+xml');
        const path = doc.querySelector('path');
        if (path) {
          const d = path.getAttribute('d');
          if (d) {
            // Helper to normalize path data to 100x100
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            tempPath.setAttribute("d", d);
            svg.appendChild(tempPath);
            document.body.appendChild(svg);
            const bbox = tempPath.getBBox();
            document.body.removeChild(svg);

            const scale = 100 / Math.max(bbox.width, bbox.height);
            const normalizedD = d.replace(/(-?\d+\.?\d*)/g, (match) => {
                // This is a very crude normalization for complex paths but works for simple ones
                // To do it properly we'd need a path parser.
                return match; 
            });
            
            // Actually, we can just apply a transform attribute to the path in the store
            // No, better to just store the path and use the BBox info in the store.
            // Let's just store the path as is, and I'll use a better transform in Forge2D.
            handleUpdate({ shape: 'custom', customBoundaryPath: d });
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const shapes: { id: StampShape; icon: React.ReactNode; label: string }[] = [
    { id: 'rectangle', icon: <Square className="w-4 h-4" />, label: 'Rect' },
    { id: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circ' },
    { id: 'shield', icon: <ShieldIcon className="w-4 h-4" />, label: 'Shield' },
    { id: 'hexagon', icon: <Hexagon className="w-4 h-4" />, label: 'Hex' },
    { id: 'pointed-oval', icon: <Maximize2 className="w-4 h-4 rotate-45" />, label: 'Oval' },
  ];

  return (
    <aside className="w-64 h-full bg-[#151619] border-r border-[#333] flex flex-col overflow-hidden shadow-2xl z-20" data-version="1.1.2-pro">
      {/* Diagnostics Header */}
      <div className="h-8 bg-forge-tertiary/50 border-b border-white/5 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-forge-accent animate-pulse" />
          <span className="text-[9px] font-bold font-mono text-forge-accent uppercase tracking-tighter">Engine_Core_Active</span>
        </div>
        <span className="text-[8px] font-mono text-forge-text-muted opacity-40">XY_OFFSET_0.00</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-10 custom-scrollbar">
        
        {/* Shape Optimization Palette */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="tech-label text-forge-text font-bold uppercase tracking-wider">Geometry_Foundation</h3>
            <span className="text-[8px] font-mono opacity-20 italic">v1.1_PRIMITIVES</span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {shapes.map((s) => (
              <button
                key={s.id}
                onClick={() => handleUpdate({ shape: s.id })}
                className={cn(
                  "aspect-square rounded-sm border transition-all flex flex-col items-center justify-center gap-1 group/btn",
                  design.shape === s.id 
                    ? "bg-forge-accent/20 border-forge-accent text-forge-accent shadow-[0_0_15px_rgba(230,126,34,0.2)]" 
                    : "bg-[#1C1C1C] border-[#333] text-forge-text-muted hover:border-forge-accent/40 hover:text-white"
                )}
              >
                <div className="scale-90 group-hover/btn:scale-100 transition-transform">
                  {s.icon}
                </div>
                <span className="text-[7px] uppercase tracking-tighter font-bold font-mono">{s.id.slice(0, 4)}</span>
              </button>
            ))}
            
            <button
               onClick={() => fileInputRef.current?.click()}
               className={cn(
                 "aspect-square rounded-sm border border-dashed transition-all flex flex-col items-center justify-center gap-1 group/btn",
                 design.shape === 'custom'
                   ? "bg-forge-accent/20 border-forge-accent text-forge-accent"
                   : "border-[#444] text-forge-text-muted hover:border-forge-accent/50 hover:text-white"
               )}
            >
               <UploadIcon className="w-3.5 h-3.5" />
               <span className="text-[7px] uppercase tracking-tighter font-bold font-mono">IMPORT</span>
            </button>
          </div>
          
          <input 
            type="file"
            accept=".svg"
            className="hidden"
            ref={fileInputRef}
            onChange={handleCustomUpload}
          />

          {design.shape === 'custom' && design.customBoundaryPath && (
            <div className="mt-4 p-3 bg-forge-accent/5 border border-forge-accent/20 rounded-sm animate-in fade-in slide-in-from-top-2 space-y-4">
              <ParameterSlider
                label="Boundary_Scale"
                value={design.customBoundaryScale || 1.0}
                min={0.1}
                max={2.0}
                step={0.01}
                unit="x"
                description="Fine-tune the relative scale of the imported vector boundary."
                onChange={(val) => handleUpdate({ customBoundaryScale: val })}
              />
              <div className="grid grid-cols-2 gap-4">
                <ParameterSlider
                  label="Move_X"
                  value={design.customBoundaryOffsetX || 0}
                  min={-design.width}
                  max={design.width}
                  unit="mm"
                  description="Horizontal translation of the custom boundary."
                  onChange={(val) => handleUpdate({ customBoundaryOffsetX: val })}
                />
                <ParameterSlider
                  label="Move_Y"
                  value={design.customBoundaryOffsetY || 0}
                  min={-design.height}
                  max={design.height}
                  unit="mm"
                  description="Vertical translation of the custom boundary."
                  onChange={(val) => handleUpdate({ customBoundaryOffsetY: val })}
                />
              </div>
            </div>
          )}
        </section>

        {/* Precision Parameters */}
        <section className="space-y-6 relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-forge-accent/5" />
          <div className="flex items-center justify-between">
            <h3 className="tech-label text-forge-text font-bold">Forge_Matrices</h3>
            <Layers className="w-3 h-3 text-forge-accent opacity-50" />
          </div>
          
          <div className="space-y-8">
            <ParameterSlider
              label="Bore Depth"
              value={design.baseThickness}
              min={1}
              max={12}
              unit="mm"
              description="The primary Z-axis extrusion thickness of the stamp design features."
              onChange={(val) => handleUpdate({ baseThickness: val })}
              onFocus={() => setActiveParameter('baseThickness')}
            />

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-forge-accent uppercase tracking-widest">Tool_Foundation</h4>
              <div className="grid grid-cols-2 gap-4">
                <ParameterSlider
                  label="Plate_Thickness"
                  value={design.plateThickness}
                  min={0}
                  max={20}
                  unit="mm"
                  description="The thickness of the solid back plate providing structural rigidity."
                  onChange={(val) => handleUpdate({ plateThickness: val })}
                />
                <ParameterSlider
                  label="Plate_Padding"
                  value={design.platePadding}
                  min={0}
                  max={20}
                  unit="mm"
                  description="The surrounding margin of the back plate beyond the design boundary."
                  onChange={(val) => handleUpdate({ platePadding: val })}
                />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[10px] font-bold text-forge-accent uppercase tracking-widest">Vibe_Simulation</h4>
              <div className="flex bg-black/40 p-1 rounded border border-white/5">
                {(['brass', 'steel', 'leather'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleUpdate({ materialType: m })}
                    className={cn(
                      "flex-1 py-1 text-[9px] font-bold uppercase tracking-tighter transition-all rounded-sm",
                      design.materialType === m 
                        ? "bg-forge-accent text-black" 
                        : "text-forge-text-muted hover:text-white"
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <ParameterSlider
              label="Draft Vector"
              value={design.draftAngle}
              min={0}
              max={45}
              unit="°"
              description="Calculates the taper angle for effective mold release and structural integrity under hydraulic pressure."
              onChange={(val) => handleUpdate({ draftAngle: val })}
              onFocus={() => setActiveParameter('draftAngle')}
            />
          </div>
        </section>

        {/* Subsystem State */}
        <section className="pt-6 border-t border-white/5">
          <div className="bg-black/30 rounded p-3 border border-white/5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-3 bg-forge-accent/40 rounded-full" />
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-forge-text-muted">Nozzle_Profile</h4>
            </div>
            <div className="flex justify-between items-center bg-forge-bg/50 p-2 rounded-sm border border-white/5">
                <span className="text-[10px] text-forge-text-muted font-mono">CALIBRATION</span>
                <span className="text-[11px] font-mono text-forge-accent font-bold glow-text">{design.nozzleDiameter}mm</span>
            </div>
            <ParameterSlider
                label="Extrusion Width"
                value={design.nozzleDiameter}
                min={0.2}
                max={1.0}
                step={0.2}
                unit="mm"
                onChange={(val) => handleUpdate({ nozzleDiameter: val })}
                onFocus={() => setActiveParameter('nozzleDiameter')}
              />
          </div>
        </section>
      </div>
    </aside>
  );
}
