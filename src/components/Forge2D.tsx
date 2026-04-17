import React, { useMemo } from 'react';
import { useStore } from '../store';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Forge2D() {
  const { design } = useStore();

  const viewBoxSize = Math.max(design.width, design.height) * 4;
  const cx = viewBoxSize / 2 + (design.customBoundaryOffsetX || 0);
  const cy = viewBoxSize / 2 + (design.customBoundaryOffsetY || 0);

  const renderShape = useMemo(() => {
    const { width, height, cornerRadius, shape } = design;
    const x = cx - width / 2;
    const y = cy - height / 2;

    switch (shape) {
      case 'circle':
        return <circle cx={cx} cy={cy} r={width / 2} />;
      case 'shield':
        return (
          <path d={`M ${cx},${cy - height/2} 
                    L ${cx + width/2},${cy + height * 0.2} 
                    C ${cx + width/2},${cy + height * 0.5} ${cx},${cy + height * 0.6} ${cx},${cy + height * 0.6}
                    C ${cx},${cy + height * 0.6} ${cx - width/2},${cy + height * 0.5} ${cx - width/2},${cy + height * 0.2}
                    Z`} />
        );
      case 'hexagon':
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * 60 * Math.PI) / 180;
          points.push(`${cx + (width / 2) * Math.cos(angle)},${cy + (width / 2) * Math.sin(angle)}`);
        }
        return <polygon points={points.join(' ')} />;
      case 'pointed-oval':
        const rx = width / 2;
        const ry = height / 2;
        return <path d={`M ${cx},${cy - height/2} 
                          Q ${cx + width/2},${cy} ${cx},${cy + height/2} 
                          Q ${cx - width/2},${cy} ${cx},${cy - height/2} Z`} />;
      case 'custom':
        if (design.customBoundaryPath) {
          const bs = design.customBoundaryScale || 1.0;
          return (
            <path 
              d={design.customBoundaryPath} 
              transform={`translate(${cx}, ${cy}) scale(${(width / 100) * bs}, ${(height / 100) * bs}) translate(-50, -50)`}
              vectorEffect="non-scaling-stroke"
            />
          );
        }
        return <rect x={x} y={y} width={width} height={height} rx={cornerRadius} />;
      default: // rectangle
        return <rect x={x} y={y} width={width} height={height} rx={cornerRadius} />;
    }
  }, [design, viewBoxSize, cx, cy]);

  // Stitching dots logic
  const stitchingPoints = useMemo(() => {
    if (!design.stitching.enabled) return [];
    
    // We create a temporary path to calculate points along it
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    
    // Get the base path string based on shape
    let d = "";
    const { width, height, shape, cornerRadius } = design;
    const w = width;
    const h = height;
    const r = Math.min(cornerRadius, w/2, h/2);

    // This simplified approach uses the same logic as renderShape for the path string
    if (shape === 'circle') d = `M ${w/2},0 A ${w/2},${w/2} 0 1,1 ${-w/2},0 A ${w/2},${w/2} 0 1,1 ${w/2},0`;
    else if (shape === 'shield') d = `M 0,${-h/2} L ${w/2},${h*0.2} C ${w/2},${h*0.5} 0,${h*0.6} 0,${h*0.6} C 0,${h*0.6} ${-w/2},${h*0.5} ${-w/2},${h*0.2} Z`;
    else if (shape === 'custom' && design.customBoundaryPath) d = design.customBoundaryPath;
    else d = `M ${-w/2+r},${-h/2} L ${w/2-r},${-h/2} Q ${w/2},${-h/2} ${w/2},${-h/2+r} L ${w/2},${h/2-r} Q ${w/2},${h/2} ${w/2-r},${h/2} L ${-w/2+r},${h/2} Q ${-w/2},${h/2} ${-w/2},${h/2-r} L ${-w/2},${-h/2+r} Q ${-w/2},${-h/2} ${-w/2+r},${-h/2} Z`;

    path.setAttribute("d", d);
    
    // For stitching, we need to inset the path
    // Simplified: we'll just scale the path by the offset
    const bs = design.customBoundaryScale || 1.0;
    const scaleX = ((w * bs) - design.stitching.offset * 2) / (w * bs);
    const scaleY = ((h * bs) - design.stitching.offset * 2) / (h * bs);
    
    svg.appendChild(path);
    document.body.appendChild(svg);
    
    const length = path.getTotalLength();
    const spacing = design.stitching.spacing;
    const count = Math.floor(length / spacing);
    const points = [];
    
    for (let i = 0; i < count; i++) {
        const p = path.getPointAtLength(i * (length / count));
        // Scale and Center
        // Note: getPointAtLength returns points in the path's own coordinate system
        // We need to transform them to our viewBox coordinate system
        // For custom paths, they might not be centered at 0,0, so we use BBox
        const bbox = path.getBBox();
        const nx = (p.x - bbox.x - bbox.width/2) * (scaleX * bs) + viewBoxSize/2;
        const ny = (p.y - bbox.y - bbox.height/2) * (scaleY * bs) + viewBoxSize/2;
        points.push({ x: nx, y: ny });
    }
    
    document.body.removeChild(svg);
    return points;
  }, [design, viewBoxSize]);

  return (
    <div className={cn(
        "flex-1 relative flex items-center justify-center p-8 overflow-hidden transition-colors duration-700",
        design.materialType === 'leather' ? "bg-[#1A0F0A]" : "bg-[#0D0D0D]"
    )}>
      <div className="absolute top-4 left-4 flex gap-4">
          <div className="bg-[#1C1C1C]/90 px-3 py-1.5 rounded border border-[#333] flex items-center gap-2 shadow-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-forge-accent" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#AAA] font-mono">
              2D_Workbench_Terminal
            </span>
          </div>
      </div>

      <div className="relative group">
        <svg 
            viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`} 
            className="w-[min(80vh,80vw)] h-[min(80vh,80vw)] drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            </pattern>
            
            {/* Clipping Mask for Pattern */}
            <clipPath id="stamp-mask">
              {renderShape}
            </clipPath>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Main Base */}
          <g className="transition-all duration-300">
            <g 
                className={cn(
                    "transition-all duration-500",
                    design.materialType === 'leather' ? "fill-[#3C2A1A] stroke-[#5D3A1A]" : "fill-forge-accent/5 stroke-forge-border"
                )} 
                strokeWidth="0.5"
            >
                {renderShape}
            </g>
          </g>

          {/* Cutting Edge */}
          {design.cuttingEdge.enabled && (
             <g className="transition-all duration-300">
                <g className={cn("fill-none stroke-forge-accent/60", design.cuttingEdge.width < design.nozzleDiameter && "stroke-forge-danger stroke-dasharray-[4]")} strokeWidth={design.cuttingEdge.width}>
                    {renderShape}
                </g>
             </g>
          )}

          {/* Borders */}
          {design.borders.filter(b => b.enabled).map((border, i) => {
             const scaleX = (design.width - border.offset * 2) / design.width;
             const scaleY = (design.height - border.offset * 2) / design.height;
             
             return (
               <g key={border.id} transform={`translate(${cx}, ${cy}) scale(${scaleX}, ${scaleY}) translate(${-cx}, ${-cy})`}>
                <g 
                  className={cn(
                    "transition-all duration-500",
                    design.materialType === 'leather' ? "fill-none stroke-[#2A1C0E]" : "fill-none stroke-forge-accent/30", 
                    border.width < design.nozzleDiameter && "stroke-forge-danger stroke-dasharray-[4]"
                  )} 
                  strokeWidth={border.width / Math.max(scaleX, scaleY)}
                >
                   {renderShape}
                </g>
               </g>
             );
          })}



          {/* Stitching */}
          {design.stitching.enabled && (
             <g>
                {design.stitching.type === 'post' ? (
                   stitchingPoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={design.stitching.diameter/2} className="fill-forge-accent" />
                   ))
                ) : (
                   <rect 
                    x={cx - (design.width - design.stitching.offset * 2)/2}
                    y={cy - (design.height - design.stitching.offset * 2)/2}
                    width={design.width - design.stitching.offset * 2}
                    height={design.height - design.stitching.offset * 2}
                    rx={design.cornerRadius}
                    className="fill-none stroke-forge-accent/40"
                    strokeWidth={design.stitching.diameter}
                    strokeDasharray="2 2"
                   />
                )}
             </g>
          )}

          {/* Dimension Lines */}
          <DimensionLine x1={cx - design.width/2} y1={cy + design.height/2 + 15} x2={cx + design.width/2} y2={cy + design.height/2 + 15} label={`${design.width}mm`} vertical={false} />
          <DimensionLine x1={cx + design.width/2 + 15} y1={cy - design.height/2} x2={cx + design.width/2 + 15} y2={cy + design.height/2} label={`${design.height}mm`} vertical={true} />

          {/* Pattern Overlay */}
          {design.pattern.enabled && design.pattern.svgPath && (
            <g clipPath="url(#stamp-mask)">
              <g transform={`translate(${cx + design.pattern.offsetX}, ${cy + design.pattern.offsetY})`}>
                 <g 
                   key={design.pattern.svgPath} // Force re-render on path change
                   style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                 >
                    <path 
                      d={design.pattern.svgPath} 
                      className={cn(
                        "transition-all duration-500",
                        design.pattern.mode === 'emboss' 
                          ? "fill-forge-accent opacity-60 drop-shadow-[0_0_8px_rgba(230,126,34,0.4)]" 
                          : "fill-black/40 stroke-forge-accent/40 stroke-[1px] opacity-80"
                      )}
                      transform={`scale(${design.pattern.scale * (design.width / 100)})`}
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    />
                 </g>
              </g>
            </g>
          )}
        </svg>


        {/* Floating Tooltips for Nozzle Validation */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
            <AnimatePresence>
                {design.cuttingEdge.width < design.nozzleDiameter && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-forge-danger text-[10px] font-bold text-white px-2 py-1 rounded shadow-xl flex items-center gap-1"
                    >
                        <span>TOO THIN FOR NOZZLE ({design.nozzleDiameter}mm)</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function DimensionLine({ x1, y1, x2, y2, label, vertical }: { x1: number, y1: number, x2: number, y2: number, label: string, vertical: boolean }) {
    return (
        <g className="stroke-[#444] fill-[#888]" style={{ fontSize: '3px' }}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="0.5" />
            <line x1={x1} y1={y1 - 2} x2={x1} y2={y1 + 2} strokeWidth="0.5" />
            <line x1={x2} y1={y1 - 2} x2={x2} y2={y1 + 2} strokeWidth="0.5" />
            <text 
                x={vertical ? x1 + 4 : (x1 + x2)/2} 
                y={vertical ? (y1 + y2)/2 : y1 + 5} 
                textAnchor="middle" 
                className="font-mono uppercase"
                style={{ writingMode: vertical ? 'vertical-lr' : 'horizontal-tb' }}
            >{label}</text>
        </g>
    )
}

