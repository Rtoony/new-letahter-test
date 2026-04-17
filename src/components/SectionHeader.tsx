import React from 'react';
import { cn } from '../lib/utils';

export function SectionHeader({ title, icon, enabled, onToggle }: { title: string, icon: React.ReactNode, enabled: boolean, onToggle: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between pt-4 border-t border-white/5 group">
      <div className="flex items-center gap-2">
        <span className={cn("transition-colors", enabled ? "text-forge-accent" : "text-forge-text-muted opacity-30")}>{icon}</span>
        <label className={cn("text-[11px] uppercase tracking-wider font-bold transition-colors font-mono", enabled ? "text-forge-text" : "text-forge-text-muted")}>{title}</label>
      </div>
      <button 
        onClick={() => onToggle(!enabled)}
        className={cn(
          "px-2 py-0.5 rounded-sm text-[8px] font-bold uppercase transition-all tracking-widest", 
          enabled 
            ? "text-forge-accent bg-forge-accent/10 border border-forge-accent/20" 
            : "text-forge-text-muted border border-forge-border hover:border-forge-text-muted"
        )}
      >
        {enabled ? 'Active' : 'Bypassed'}
      </button>
    </div>
  )
}
