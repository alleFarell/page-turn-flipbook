import { X, List } from 'lucide-react';
import { Button } from './ui/button';

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TocDrawer({ isOpen, onClose }: TocDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`absolute top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-zinc-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-white font-medium">
            <List className="h-4 w-4 text-primary" />
            <h3>Table of Contents</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
            <List className="h-8 w-8 text-zinc-500" />
          </div>
          <p className="text-zinc-300 font-medium mb-1">No Table of Contents</p>
          <p className="text-zinc-500 text-sm">This flipbook does not have a table of contents available.</p>
        </div>
      </div>
    </>
  );
}
