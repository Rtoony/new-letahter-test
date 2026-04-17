import { motion } from 'motion/react';
import { Hammer, RotateCcw, RotateCw, Download, Settings } from 'lucide-react';
import { useStore as useZustandStore } from 'zustand';
import { useStore } from '../store';
import { TemporalState } from 'zundo';
import { ForgeState } from '../types';

export default function ForgeHeader() {
  const { design } = useStore();
  
  // Reactive usage of zundo temporal store
  const { undo, redo, pastStates, futureStates } = useZustandStore(useStore.temporal, (state) => state) as TemporalState<ForgeState>;

  return (
    <header className="h-12 bg-[#1C1C1C] border-b border-[#333] px-4 flex items-center justify-between z-50 relative selection-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-6 h-6 bg-forge-accent rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(230,126,34,0.3)] group-hover:scale-105 transition-transform">
            <Hammer className="text-black w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[11px] font-bold font-mono tracking-tight uppercase leading-none text-forge-accent">
              Leather_Forge_OS
            </h1>
            <div className="flex items-center gap-1.5 opacity-50">
              <span className="text-[8px] text-forge-text font-mono uppercase tracking-[0.2em]">Build_PRO_1.1.2</span>
              <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>


      <div className="flex items-center gap-4">
        <div className="flex items-center bg-black/40 rounded-md p-1 panel-border">
          <button 
            onClick={() => undo()}
            disabled={pastStates.length === 0}
            className="p-1.5 hover:bg-forge-border rounded text-forge-text-muted disabled:opacity-20 transition-all"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-forge-border mx-1" />
          <button 
            onClick={() => redo()}
            disabled={futureStates.length === 0}
            className="p-1.5 hover:bg-forge-border rounded text-forge-text-muted disabled:opacity-20 transition-all"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <button className="flex items-center gap-2 bg-forge-accent text-black px-4 py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_10px_rgba(230,126,34,0.3)]">
          <Download className="w-3.5 h-3.5" />
          Export For Slicer
        </button>


        <div className="w-[1px] h-6 bg-forge-border" />

        <button className="text-forge-text-muted hover:text-forge-text transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
