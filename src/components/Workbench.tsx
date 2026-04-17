import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ForgeHeader from './ForgeHeader';
import Forge2D from './Forge2D';
import Forge3D from './Forge3D';
import SidebarLeft from './SidebarLeft';
import SidebarRight from './SidebarRight';
import { Maximize2, Box } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Workbench() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  return (
    <div className="flex flex-col h-screen bg-forge-bg overflow-hidden selection-none">
      <ForgeHeader />
      
      <main className="flex-1 flex overflow-hidden">
        <motion.div
          initial={{ x: -260 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="z-30"
        >
          <SidebarLeft />
        </motion.div>
        
        <div className="flex-1 relative overflow-hidden flex flex-col">
          {/* View Toggle */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-forge-card p-1 rounded-sm z-40 panel-border shadow-2xl">
            <button
              onClick={() => setViewMode('2d')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === '2d' ? "bg-forge-accent text-black shadow-[0_4px_15px_rgba(230,126,34,0.4)]" : "text-forge-text-muted hover:text-white"
              )}
            >
              <Maximize2 className="w-3 h-3" />
              2D Bench
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all",
                viewMode === '3d' ? "bg-forge-accent text-black shadow-[0_4px_15px_rgba(230,126,34,0.4)]" : "text-forge-text-muted hover:text-white"
              )}
            >
              <Box className="w-3 h-3" />
              3D Forge
            </button>
          </div>


          <div className="absolute top-0 left-0 w-full h-full">
            <AnimatePresence mode="wait">
              {viewMode === '2d' ? (
                <motion.div
                  key="2d"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full"
                >
                  <Forge2D />
                </motion.div>
              ) : (
                <motion.div
                  key="3d"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Forge3D />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Overlay */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-2 pointer-events-none z-40">
             <div className="bg-forge-card/80 px-3 py-1 text-[10px] font-mono font-bold panel-border flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-forge-accent animate-pulse shadow-[0_0_8px_rgba(230,126,34,0.6)]" />
                <span className="text-forge-accent uppercase tracking-tighter">FORGE_ENGINE_ONLINE</span>
             </div>
          </div>

        </div>

        <motion.div
          initial={{ x: 260 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="z-30"
        >
          <SidebarRight />
        </motion.div>
      </main>

      <footer className="h-8 bg-forge-card border-t border-forge-border px-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="tech-label opacity-40">MODE:</span>
                <span className="text-[10px] font-bold text-forge-accent uppercase font-mono">BLACKSMITH</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tech-label opacity-40">NODES:</span>
                <span className="text-[10px] font-bold text-forge-accent uppercase font-mono">142</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tech-label opacity-40">MEM:</span>
                <span className="text-[10px] font-bold text-forge-accent uppercase font-mono">24MB</span>
              </div>
          </div>
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="tech-label opacity-40">FPS:</span>
                <span className="text-[10px] font-bold text-forge-accent uppercase font-mono">60</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tech-label opacity-40">COORDS:</span>
                <span className="text-[10px] font-bold text-forge-accent uppercase font-mono tracking-tighter">X: 200.4 Y: 150.2</span>
              </div>
          </div>
      </footer>

    </div>
  );
}
