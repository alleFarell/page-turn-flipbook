import { useEffect, useRef } from 'react';

interface ThumbnailPanelProps {
  pages: string[];
  currentPage: number;
  onPageSelect: (page: number) => void;
  onClose: () => void;
}

export function ThumbnailPanel({ pages, currentPage, onPageSelect, onClose }: ThumbnailPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active thumbnail
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentPage]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="w-full z-20 animate-slide-up">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 shadow-2xl">
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto pb-1 scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
          >
            {pages.map((url, i) => (
              <button
                key={i}
                ref={i === currentPage ? activeRef : undefined}
                onClick={() => { onPageSelect(i); onClose(); }}
                className={`
                  relative flex-shrink-0 snap-center rounded-lg overflow-hidden transition-all duration-200
                  hover:ring-2 hover:ring-white/30 hover:scale-105 active:scale-95
                  ${i === currentPage
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                    : 'ring-1 ring-white/10 opacity-70 hover:opacity-100'
                  }
                `}
                aria-label={`Go to page ${i + 1}`}
                style={{ width: 72, height: 96 }}
              >
                <img
                  src={url}
                  alt={`Page ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-center text-zinc-300 py-0.5 font-medium">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
