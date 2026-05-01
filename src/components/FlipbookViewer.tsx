import { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn } from 'lucide-react';

interface FlipbookViewerProps {
  pages: string[];
  chromeless?: boolean;
}

export function FlipbookViewer({ pages, chromeless = false }: FlipbookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<PageFlip | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageWidth = isMobile ? Math.min(window.innerWidth - 40, 400) : 450;
  const pageHeight = Math.round(pageWidth * 1.414);

  // Initialize PageFlip
  useEffect(() => {
    if (!containerRef.current || pages.length === 0) return;

    // Wait a tick for React to render the children before initializing PageFlip
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      if (flipBookRef.current) {
        flipBookRef.current.destroy();
      }

      const flipBook = new PageFlip(containerRef.current, {
        width: pageWidth,
        height: pageHeight,
        size: 'fixed',
        minHeight: 400,
        maxHeight: 900,
        showCover: true,
        maxShadowOpacity: 0.5,
        mobileScrollSupport: true,
        useMouseEvents: true,
        swipeDistance: 30,
        showPageCorners: true,
        disableFlipByClick: false,
        usePortrait: isMobile,
        autoSize: true,
        drawShadow: true,
        flippingTime: 800,
        startZIndex: 0,
        startPage: 0,
      });

      const pageElements = containerRef.current.querySelectorAll('.flipbook-page');
      if (pageElements.length > 0) {
        flipBook.loadFromHTML(pageElements as any);
        flipBookRef.current = flipBook;
        setTotalPages(pages.length);
        setCurrentPage(0);

        flipBook.on('flip', (e) => {
          setCurrentPage(e.data as number);
        });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (flipBookRef.current) {
        flipBookRef.current.destroy();
        flipBookRef.current = null;
      }
    };
  }, [pages, isMobile, pageWidth, pageHeight]);

  const goNext = useCallback(() => flipBookRef.current?.flipNext(), []);
  const goPrev = useCallback(() => flipBookRef.current?.flipPrev(), []);

  const goToPage = useCallback((page: number) => {
    if (flipBookRef.current && page >= 0 && page < totalPages) {
      flipBookRef.current.flip(page);
    }
  }, [totalPages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <>
      <div
        className="flex items-center justify-center"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}
      >
        <div ref={containerRef} className="shadow-[0_0_80px_rgba(255,255,255,0.05),0_0_40px_rgba(0,0,0,0.5)]" style={{ width: pageWidth * 2, height: pageHeight, maxWidth: '100%' }}>
          {pages.map((url, i) => (
            <div key={i} className="flipbook-page bg-white overflow-hidden" style={{ width: pageWidth, height: pageHeight }}>
              <img src={url} alt={`Page ${i + 1}`} className="w-full h-full object-contain select-none pointer-events-none" loading={i < 4 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </div>

      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-4 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 px-4 py-2 shadow-2xl transition-opacity duration-300 ${chromeless ? 'opacity-0 hover:opacity-100' : ''}`}>
        <button 
          onClick={goPrev} 
          disabled={currentPage <= 0} 
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center text-sm font-medium text-zinc-400">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage + 1}
            onChange={e => goToPage(parseInt(e.target.value, 10) - 1)}
            className="w-10 bg-transparent text-center text-white focus:outline-none focus:ring-1 focus:ring-primary rounded"
            aria-label="Go to page"
          />
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
        </div>

        <button 
          onClick={goNext} 
          disabled={currentPage >= totalPages - 1} 
          className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {!chromeless && (
          <>
            <div className="h-5 w-px bg-white/15 mx-1" />
            
            <div className="hidden sm:flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-zinc-400" />
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="w-20 accent-primary"
                aria-label="Zoom"
              />
            </div>
            
            <button 
              onClick={toggleFullscreen} 
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>
    </>
  );
}
