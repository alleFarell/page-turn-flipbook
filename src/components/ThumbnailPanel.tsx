import { X } from 'lucide-react';
import { Button } from './ui/button';

interface ThumbnailPanelProps {
  pages: string[];
  currentPage: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (page: number) => void;
}

export function ThumbnailPanel({ pages, currentPage, isOpen, onClose, onSelectPage }: ThumbnailPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-medium text-white">Pages</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 overflow-y-auto max-h-[50vh] flex gap-4 overflow-x-auto snap-x">
        {pages.map((url, i) => (
          <button
            key={i}
            onClick={() => {
              onSelectPage(i);
              onClose();
            }}
            className={`relative flex-shrink-0 snap-center rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${currentPage === i ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-white/20'}`}
          >
            <img src={url} alt={`Page ${i + 1}`} className="h-32 w-auto object-contain bg-white" loading="lazy" />
            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
              {i + 1}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
