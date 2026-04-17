import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function ParameterSlider({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = '', 
  warning = false,
  description,
  onChange,
  onFocus 
}: { 
  label: string, 
  value: number, 
  min: number, 
  max: number, 
  step?: number, 
  unit?: string,
  warning?: boolean,
  description?: string,
  onChange: (val: number) => void,
  onFocus?: () => void
}) {
  return (
    <div className="space-y-2 group/slider" onMouseEnter={onFocus}>
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 relative">
        <label className={cn(
          "text-[12px] font-medium tracking-tight truncate", 
          warning ? "text-forge-danger" : "text-forge-text"
        )}>
          {label}
        </label>
        
        {description && (
          <div className="absolute -top-10 left-0 w-max max-w-[200px] bg-forge-tertiary border border-forge-border p-2 rounded shadow-xl text-[10px] text-forge-text-muted leading-tight opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none z-50 font-mono uppercase">
            {description}
          </div>
        )}

        <span className={cn("tech-value font-mono", warning && "text-forge-danger bg-forge-danger/10")}>
          {value}{unit}
        </span>
      </div>
      <div className="relative pt-1">
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full h-1 bg-forge-tertiary rounded-lg appearance-none cursor-pointer accent-forge-accent",
            warning && "accent-forge-danger"
          )}
        />
        {warning && (
          <div className="flex items-center gap-1 mt-1 text-[9px] text-forge-danger font-mono uppercase font-bold animate-pulse">
            <AlertCircle className="w-2.5 h-2.5" />
            Detail exceeds nozzle limit
          </div>
        )}
      </div>
    </div>
  )
}
