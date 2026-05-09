import { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import { ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut, List, LayoutGrid, Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Slider } from './ui/slider';
import { ThumbnailPanel } from './ThumbnailPanel';
import { TocDrawer } from './TocDrawer';
import pageTurnSoundFile from '../assets/pageturn-sound.mp3';

interface FlipbookViewerProps {
  pages: string[];
  chromeless?: boolean;
  showPageNumbers?: boolean;
  autoPageNumbering?: boolean;
  pageLabels?: string[];
}

export function FlipbookViewer({ 
  pages, 
  chromeless = false,
  showPageNumbers = false,
  autoPageNumbering = false,
  pageLabels = []
}: FlipbookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<PageFlip | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [layoutPage, setLayoutPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoaded, setIsLoaded] = useState(false);

  // Toolbar toggles
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio(pageTurnSoundFile);
    audioRef.current.preload = 'auto';
  }, []);

  const playPageTurnSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    } catch (e) {
      // Ignore audio errors
    }
  }, [soundEnabled]);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pageWidth = isMobile ? Math.min(window.innerWidth - 40, 300) : 400;
  const pageHeight = isMobile ? Math.round(pageWidth * 1.414) : 565; // Matches skeleton size

  // Initialize PageFlip
  useEffect(() => {
    if (!containerRef.current || pages.length === 0) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      if (flipBookRef.current) {
        flipBookRef.current.destroy();
      }

      try {
        const flipBook = new PageFlip(containerRef.current, {
          width: pageWidth,
          height: pageHeight,
          size: 'fixed',
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
          setLayoutPage(0);

          flipBook.on('flip', (e) => {
            const pageNum = e.data as number;
            setCurrentPage(pageNum);
            setLayoutPage(pageNum);
            playPageTurnSound();
          });

          flipBook.on('changeState', (e) => {
            const state = e.data as string;
            
            // Only update layout during the committed flip animation
            if (state === 'flipping') {
              try {
                // Infer the target page by reading the internal calc direction
                const flipController = (flipBook as any).getFlipController?.();
                const calc = flipController?.getCalculation?.();
                
                if (calc) {
                  const dir = calc.getDirection(); // 0 is FORWARD, 1 is BACK
                  const isPortrait = flipBook.getOrientation() === 'portrait';
                  const increment = isPortrait ? 1 : 2;
                  
                  let nextTarget = flipBook.getCurrentPageIndex();
                  if (dir === 0) {
                    nextTarget += increment;
                  } else if (dir === 1) {
                    nextTarget -= increment;
                  }
                  
                  // Clamp to valid boundaries
                  const pageCount = flipBook.getPageCount();
                  nextTarget = Math.max(0, Math.min(nextTarget, pageCount - 1));
                  
                  setLayoutPage(nextTarget);
                }
              } catch (err) {
                console.warn('Could not infer PageFlip target page', err);
              }
            } else if (state === 'read') {
              // Ensure layout is always synced when resting
              setLayoutPage(flipBook.getCurrentPageIndex());
            }
          });
        }
      } catch (err) {
        console.error('PageFlip initialization error:', err);
      } finally {
        setIsLoaded(true);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (flipBookRef.current) {
        flipBookRef.current.destroy();
        flipBookRef.current = null;
      }
    };
  }, [pages.length, isMobile, pageWidth, pageHeight, playPageTurnSound]);

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

  let xOffsetPx = 0;
  const isLastUnpairedPage = pages.length % 2 === 0 && layoutPage >= pages.length - 1;

  if (!isMobile) {
    if (layoutPage === 0) {
      xOffsetPx = -(pageWidth / 2);
    } else if (isLastUnpairedPage) {
      xOffsetPx = (pageWidth / 2);
    }
  }

  return (
    <div className="flex flex-col w-full h-full relative bg-zinc-950 flex-1">
      <TocDrawer isOpen={isTocOpen} onClose={() => setIsTocOpen(false)} />

      {/* Flipbook Container Area */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative pt-6">
        <div
          className={`relative transition-all duration-700 ease-out flex items-center justify-center ${isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4'}`}
          style={{
            transform: `translateX(${xOffsetPx}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-out'
          }}
        >
          <div
            ref={containerRef}
            className="relative z-10 drop-shadow-[0_0_60px_rgba(0,0,0,0.5)]"
            style={{ width: pageWidth * (isMobile ? 1 : 2), height: pageHeight }}
          >
            {pages.map((url, i) => {
              const isFirstPage = i === 0;
              const isLeftPage = i % 2 !== 0;
              const isRightPage = i % 2 === 0 && !isFirstPage;

              return (
                <div key={i} className="flipbook-page bg-white overflow-hidden relative page-edge-style" style={{ width: pageWidth, height: pageHeight }}>
                  <img
                    src={url}
                    alt={`Page ${i + 1}`}
                    className="w-full h-full object-contain select-none pointer-events-none"
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />

                  {/* Subtle overlay for page texture */}
                  <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03] bg-gradient-to-r from-black/40 via-transparent to-black/10" />

                  {/* Realistic Book Spine Shadows */}
                  {(isRightPage || isFirstPage) && (
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/30 via-black/5 to-transparent pointer-events-none mix-blend-multiply" />
                  )}
                  {isLeftPage && (
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/30 via-black/5 to-transparent pointer-events-none mix-blend-multiply" />
                  )}

                  {/* Page numbers */}
                  {showPageNumbers && (
                    <div className={`absolute bottom-5 ${isLeftPage ? 'left-6' : 'right-6'} text-[11px] font-medium text-zinc-500/70 select-none pointer-events-none font-sans tracking-widest`}>
                      {autoPageNumbering ? i + 1 : (pageLabels[i] || '')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <ThumbnailPanel
          pages={pages}
          currentPage={currentPage}
          isOpen={isThumbnailsOpen}
          onClose={() => setIsThumbnailsOpen(false)}
          onSelectPage={goToPage}
        />
      </div>

      {/* Bottom Toolbar */}
      <div className={`w-full flex justify-center pb-6 pt-4 ${chromeless ? 'hidden' : ''} z-30 relative`}>
        <div className="flex items-center gap-1.5 sm:gap-3 rounded-2xl bg-zinc-900/85 backdrop-blur-xl border border-white/10 px-3 sm:px-4 py-2 shadow-2xl">

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setIsTocOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95">
                <List className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Table of Contents</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setIsThumbnailsOpen(!isThumbnailsOpen)} className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/10 active:scale-95 ${isThumbnailsOpen ? 'text-primary bg-primary/10' : 'text-zinc-300 hover:text-white'}`}>
                <LayoutGrid className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Thumbnails</TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-white/10 mx-0.5 sm:mx-1" />

          {/* Previous Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={goPrev} disabled={currentPage <= 0} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Previous page</TooltipContent>
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
            />
            <span className="mx-1">/</span>
            <span>{totalPages}</span>
          </div>

          {/* Next Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={goNext} disabled={currentPage >= totalPages - 1} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent">
                <ChevronRight className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Next page</TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-white/10 mx-0.5 sm:mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => {
                // Download dummy handler since we just have images, ideally trigger a PDF download.
                // Assuming `window.print()` or creating a simple anchor tag for the current page
                const link = document.createElement('a');
                link.href = pages[currentPage];
                link.download = `page-${currentPage + 1}.jpg`;
                link.click();
              }} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Download current page</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/10 active:scale-95 ${soundEnabled ? 'text-primary bg-primary/10' : 'text-zinc-300 hover:text-white'}`}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">{soundEnabled ? 'Mute' : 'Unmute'}</TooltipContent>
          </Tooltip>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} disabled={zoom <= 0.5} className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30">
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Zoom out</TooltipContent>
            </Tooltip>

            <Slider
              value={[zoom]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={handleZoomChange}
              className="w-20 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-primary/60 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white/50 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3"
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} disabled={zoom >= 2} className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30">
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Zoom in</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleFullscreen} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
