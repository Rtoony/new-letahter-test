import React from 'react';
import { useStore } from '../store';
import { 
  UtilityPole, 
  Torus, 
  Scissors, 
  Grid3X3, 
  Download,
  Upload,
  FileCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ParameterSlider } from './ParameterSlider';
import { SectionHeader } from './SectionHeader';

export default function SidebarRight() {
  const { design, updateDesign } = useStore();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUpdate = (updates: any) => updateDesign(updates);
  const nozzleWarning = (val: number) => val < design.nozzleDiameter;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            handleUpdate({ pattern: { ...design.pattern, svgPath: d } });
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <aside className="w-64 h-full bg-[#151619] border-l border-[#333] flex flex-col overflow-hidden shadow-2xl z-20">
      {/* System Status Header */}
      <div className="h-8 bg-forge-tertiary/50 border-b border-white/5 flex items-center justify-between px-3">
        <span className="text-[8px] font-mono text-forge-text-muted opacity-40">IO_BUFFER_OK</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold font-mono text-forge-accent uppercase tracking-tighter">Feature_Stack_Ready</span>
          <div className="w-1 h-1 rounded-full bg-forge-accent" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        <div className="flex items-center justify-between mb-2">
           <h3 className="tech-label text-forge-text font-bold">Component_Stack</h3>
           <span className="text-[8px] font-mono opacity-20 italic">0.0.42_STABLE</span>
        </div>

        <div className="space-y-4">
          <div className="bg-black/20 rounded p-1 border border-white/5">
            <SectionHeader 
              title="Cutting_Edge" 
              icon={<Scissors className="w-3 h-3" />}
              enabled={design.cuttingEdge.enabled}
              onToggle={(val) => handleUpdate({ cuttingEdge: { ...design.cuttingEdge, enabled: val } })}
            />
            {design.cuttingEdge.enabled && (
               <div className="space-y-4 p-3 mt-1 bg-forge-bg/30 rounded-sm">
                  <ParameterSlider
                    label="Radial_Width"
                    value={design.cuttingEdge.width}
                    min={0.4}
                    max={4}
                    step={0.1}
                    unit="mm"
                    warning={nozzleWarning(design.cuttingEdge.width)}
                    description="Calculates the thickness of the leading edge geometry. Must exceed nozzle diameter for printability."
                    onChange={(v) => handleUpdate({ cuttingEdge: { ...design.cuttingEdge, width: v } })}
                  />
               </div>
            )}
          </div>

          <div className="bg-black/20 rounded p-1 border border-white/5">
            {design.borders.map((border, idx) => (
               <React.Fragment key={border.id}>
                  <SectionHeader 
                    title={`Border_Lvl_${idx + 1}`} 
                    icon={<Torus className="w-3 h-3" />}
                    enabled={border.enabled}
                    onToggle={(val) => {
                      const newBorders = [...design.borders];
                      newBorders[idx] = { ...border, enabled: val };
                      handleUpdate({ borders: newBorders });
                    }}
                  />
                  {border.enabled && (
                    <div className="space-y-4 p-3 mt-1 bg-forge-bg/30 rounded-sm">
                      <ParameterSlider
                        label="Profile_Width"
                        value={border.width}
                        min={0.4}
                        max={4}
                        step={0.1}
                        unit="mm"
                        warning={nozzleWarning(border.width)}
                        description="Controls the horizontal thickness of this specific reinforcement border layer."
                        onChange={(v) => {
                          const newBorders = [...design.borders];
                          newBorders[idx] = { ...border, width: v };
                          handleUpdate({ borders: newBorders });
                        }}
                      />
                    </div>
                  )}
               </React.Fragment>
            ))}
          </div>

          <div className="bg-black/20 rounded p-1 border border-white/5">
            <SectionHeader 
              title="Stitch_Grid" 
              icon={<UtilityPole className="w-3 h-3" />}
              enabled={design.stitching.enabled}
              onToggle={(val) => handleUpdate({ stitching: { ...design.stitching, enabled: val } })}
            />
            {design.stitching.enabled && (
              <div className="space-y-4 p-3 mt-1 bg-forge-bg/30 rounded-sm">
                 <ParameterSlider
                  label="Node_Pitch"
                  value={design.stitching.spacing}
                  min={2}
                  max={8}
                  step={0.05}
                  unit="mm"
                  description="The center-to-center distance between stitching markers."
                  onChange={(v) => handleUpdate({ stitching: { ...design.stitching, spacing: v } })}
                />
              </div>
            )}
          </div>

          <div className="bg-black/20 rounded p-1 border border-white/5">
            <SectionHeader 
              title="Pattern_Core" 
              icon={<Grid3X3 className="w-3 h-3" />}
              enabled={design.pattern.enabled}
              onToggle={(val) => handleUpdate({ pattern: { ...design.pattern, enabled: val } })}
            />
            {design.pattern.enabled && (
              <div className="space-y-4 p-3 mt-1 bg-forge-bg/30 rounded-sm">
                <input 
                  type="file" 
                  accept=".svg" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full py-2 px-3 border border-dashed rounded-sm flex items-center justify-center gap-2 transition-all",
                    design.pattern.svgPath 
                      ? "border-forge-accent/50 bg-forge-accent/10 text-forge-accent shadow-[0_0_10px_rgba(230,126,34,0.1)]" 
                      : "border-forge-border hover:border-forge-accent/50 text-forge-text-muted hover:text-white"
                  )}
                >
                  {design.pattern.svgPath ? <FileCheck className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider">
                    {design.pattern.svgPath ? 'RE_UPLOAD_VECTOR' : 'IMPORT_SVG_DATA'}
                  </span>
                </button>

                {design.pattern.svgPath && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-1">
                     <ParameterSlider
                        label="Global_Scaling"
                        value={design.pattern.scale}
                        min={0.1}
                        max={3}
                        step={0.1}
                        unit="x"
                        description="Adjusts the overall size of the pattern relative to the stamp base dimensions."
                        onChange={(v) => handleUpdate({ pattern: { ...design.pattern, scale: v } })}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <ParameterSlider
                          label="X_Pos"
                          value={design.pattern.offsetX}
                          min={-design.width/2}
                          max={design.width/2}
                          unit="mm"
                          description="Horizontal translation from the center point of the forge."
                          onChange={(v) => handleUpdate({ pattern: { ...design.pattern, offsetX: v } })}
                        />
                        <ParameterSlider
                          label="Y_Pos"
                          value={design.pattern.offsetY}
                          min={-design.height/2}
                          max={design.height/2}
                          unit="mm"
                          description="Vertical translation from the center point of the forge."
                          onChange={(v) => handleUpdate({ pattern: { ...design.pattern, offsetY: v } })}
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                         <div className="flex justify-between items-center group/tooltip relative">
                            <label className="tech-label text-forge-text">Casting_Mode</label>
                            <span className="text-[8px] font-mono text-forge-accent opacity-50 underline decoration-dotted">INFO</span>
                            <div className="absolute -top-12 right-0 w-max max-w-[180px] bg-forge-tertiary border border-forge-border p-2 rounded shadow-2xl text-[9px] text-forge-text-muted opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 font-mono text-right leading-tight uppercase">
                               EMBOSS: Raised geometry for positive relief. <br/>DEBOSS: Repressed geometry for negative relief.
                            </div>
                         </div>
                         <div className="flex bg-black/40 p-1 rounded-sm border border-white/5">
                            <button 
                              onClick={() => handleUpdate({ pattern: { ...design.pattern, mode: 'emboss' } })}
                              className={cn(
                                "flex-1 py-1.5 text-[9px] font-bold uppercase transition-all rounded-sm font-mono",
                                design.pattern.mode === 'emboss' ? "bg-forge-accent text-black shadow-[0_0_8px_rgba(230,126,34,0.3)]" : "text-forge-text-muted hover:text-white"
                              )}
                            >_EMBOSS</button>
                            <button 
                              onClick={() => handleUpdate({ pattern: { ...design.pattern, mode: 'deboss' } })}
                              className={cn(
                                "flex-1 py-1.5 text-[9px] font-bold uppercase transition-all rounded-sm font-mono",
                                design.pattern.mode === 'deboss' ? "bg-forge-accent text-black shadow-[0_0_8px_rgba(230,126,34,0.3)]" : "text-forge-text-muted hover:text-white"
                              )}
                            >_DEBOSS</button>
                         </div>
                      </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </div>

      
      <div className="p-4 bg-black/40 border-t border-[#333] space-y-4">
        <button className="w-full bg-forge-accent text-black font-bold py-3 rounded-sm text-[11px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(230,126,34,0.3)]">
          <Download className="w-4 h-4" />
          COMPILE_DIE_V1.1
        </button>
        <div className="bg-forge-danger/10 p-2 border border-forge-danger/20 rounded-sm">
           <div className="text-[8px] text-forge-danger font-bold font-mono leading-tight uppercase">
              CRITICAL: USE 100% INFILL & 4+ WALL LOOPS FOR 15KN NOMINAL PRESSURE LOADS.
           </div>
        </div>
      </div>
    </aside>
  );
}
