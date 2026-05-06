import { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Slider } from './ui/slider';

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

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0]);
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

      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-3 rounded-2xl bg-zinc-900/85 backdrop-blur-xl border border-white/8 px-3 sm:px-4 py-2 shadow-2xl transition-opacity duration-300 ${chromeless ? 'opacity-0 hover:opacity-100' : ''}`}>
        {/* Previous Page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={goPrev} 
              disabled={currentPage <= 0} 
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">
            Previous page
          </TooltipContent>
        </Tooltip>

        {/* Page Navigator */}
        <div className="flex items-center text-sm font-medium text-zinc-400">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage + 1}
            onChange={e => goToPage(parseInt(e.target.value, 10) - 1)}
            className="w-10 bg-white/5 text-center text-white rounded-lg border border-white/10 focus:outline-none focus:border-primary py-0.5"
            aria-label="Go to page"
          />
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
        </div>

        {/* Next Page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={goNext} 
              disabled={currentPage >= totalPages - 1} 
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">
            Next page
          </TooltipContent>
        </Tooltip>

        {!chromeless && (
          <>
            <div className="h-5 w-px bg-white/10 mx-0.5 sm:mx-1" />
            
            {/* Zoom Controls — Desktop only */}
            <div className="hidden sm:flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                    disabled={zoom <= 0.5}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                  Zoom out
                </TooltipContent>
              </Tooltip>

              <Slider
                value={[zoom]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={handleZoomChange}
                className="w-20 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-primary/60 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white/50 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3"
                aria-label="Zoom level"
              />

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                    disabled={zoom >= 2}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                  Zoom in
                </TooltipContent>
              </Tooltip>
            </div>
            
            {/* Fullscreen */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={toggleFullscreen} 
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95"
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </>
  );
}
