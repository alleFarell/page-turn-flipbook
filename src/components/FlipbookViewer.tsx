import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { PageFlip } from 'page-flip';
import {
  ChevronLeft, ChevronRight, Maximize, Minimize,
  ZoomIn, ZoomOut, Grid3X3, Download, Volume2, VolumeX
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { ThumbnailPanel } from './ThumbnailPanel';

interface FlipbookViewerProps {
  pages: string[];
  chromeless?: boolean;
  pageDimensions?: { width: number; height: number };
  pdfUrl?: string;
}

// Generates a short synthetic page-flip sound via Web Audio API
function createPageFlipSound(): (() => void) | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();

    return () => {
      // Short noise burst shaped like a page swoosh
      const duration = 0.12;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        // White noise with exponential decay
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3) * 0.3;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Bandpass filter for papery sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000;
      filter.Q.value = 0.7;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
    };
  } catch {
    return null;
  }
}

export function FlipbookViewer({ pages, chromeless = false, pageDimensions, pdfUrl }: FlipbookViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<PageFlip | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const playFlipSound = useRef<(() => void) | null>(null);
  const toolbarTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Lazy-init sound
  useEffect(() => {
    playFlipSound.current = createPageFlipSound();
  }, []);

  // Compute page dimensions from actual PDF or fallback to A4
  const aspectRatio = useMemo(() => {
    if (pageDimensions && pageDimensions.width > 0 && pageDimensions.height > 0) {
      return pageDimensions.width / pageDimensions.height;
    }
    return 1 / 1.414; // A4 default
  }, [pageDimensions]);

  // Responsive container sizing via ResizeObserver
  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute optimal page dimensions — fill viewport, height-driven
  const isMobile = containerSize.width < 768;
  const { pageWidth, pageHeight } = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) {
      return { pageWidth: 550, pageHeight: 750 };
    }

    const toolbarHeight = 56; // toolbar below book
    const verticalPad = 24; // top + bottom breathing room
    const availableHeight = containerSize.height - toolbarHeight - verticalPad;
    const availableWidth = containerSize.width - 16;

    let ph: number;
    let pw: number;

    // Height-driven: fill as much vertical space as possible
    ph = Math.min(availableHeight, 900);
    pw = Math.round(ph * aspectRatio);

    if (isMobile) {
      // Single page: ensure width fits
      if (pw > availableWidth) {
        pw = availableWidth;
        ph = Math.round(pw / aspectRatio);
      }
    } else {
      // Double page spread: two pages side by side must fit width
      if (pw * 2 > availableWidth) {
        pw = Math.round(availableWidth / 2);
        ph = Math.round(pw / aspectRatio);
      }
    }

    return {
      pageWidth: Math.max(250, Math.round(pw)),
      pageHeight: Math.max(350, Math.round(ph)),
    };
  }, [containerSize, aspectRatio, isMobile]);

  // Initialize PageFlip
  useEffect(() => {
    if (!containerRef.current || pages.length === 0 || pageWidth === 0) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      if (flipBookRef.current) {
        flipBookRef.current.destroy();
      }

      const flipBook = new PageFlip(containerRef.current, {
        width: pageWidth,
        height: pageHeight,
        size: 'fixed',
        minHeight: 280,
        maxHeight: 1200,
        showCover: true,
        maxShadowOpacity: 0.7,
        mobileScrollSupport: true,
        useMouseEvents: true,
        swipeDistance: 30,
        showPageCorners: true,
        disableFlipByClick: false,
        usePortrait: isMobile,
        autoSize: false,
        drawShadow: true,
        flippingTime: 700,
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
          // Play sound
          if (soundEnabled && playFlipSound.current) {
            playFlipSound.current();
          }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, isMobile, pageWidth, pageHeight]);

  // Update sound callback when soundEnabled changes
  useEffect(() => {
    const fb = flipBookRef.current;
    if (!fb) return;

    const handler = () => {
      if (soundEnabled && playFlipSound.current) {
        playFlipSound.current();
      }
    };

    // The page-flip library doesn't support removing specific listeners easily,
    // so we use a ref-based approach instead
  }, [soundEnabled]);

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
      if (e.key === 'Escape' && showThumbnails) setShowThumbnails(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, isFullscreen, showThumbnails]);

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

  // Auto-hide toolbar
  useEffect(() => {
    if (chromeless) return;
    const resetTimer = () => {
      setToolbarVisible(true);
      if (toolbarTimerRef.current) clearTimeout(toolbarTimerRef.current);
      toolbarTimerRef.current = setTimeout(() => setToolbarVisible(false), 4000);
    };
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      if (toolbarTimerRef.current) clearTimeout(toolbarTimerRef.current);
    };
  }, [chromeless]);

  // Download handler
  const handleDownload = useCallback(() => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'flipbook.pdf';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [pdfUrl]);

  // Determine which pages to render (virtualization: ±4 from current spread)
  const renderWindow = useMemo(() => {
    const windowSize = 8;
    const start = Math.max(0, currentPage - windowSize);
    const end = Math.min(pages.length - 1, currentPage + windowSize);
    return { start, end };
  }, [currentPage, pages.length]);

  // Button styling constants
  const btnClass = "flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent";
  const btnSmClass = "flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30";
  const tipClass = "bg-zinc-800 text-zinc-200 border-zinc-700";

  return (
    <div ref={wrapperRef} className="relative w-full h-full flex flex-col items-center overflow-hidden">
      {/* Book area — fills all available space */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0">
       <div className="flipbook-3d-wrapper flex items-center justify-center">
        <div
          className="flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
          }}
        >
          <div className="flipbook-page-edges flipbook-spine-shadow">
            <div
              ref={containerRef}
              className="shadow-[0_10px_60px_rgba(0,0,0,0.6),0_0_120px_rgba(0,0,0,0.3)]"
              style={{
                width: isMobile ? pageWidth : pageWidth * 2,
                height: pageHeight,
                maxWidth: '100%',
              }}
            >
              {pages.map((url, i) => {
                const isInWindow = i >= renderWindow.start && i <= renderWindow.end;
                const isFirst = i === 0;
                const isLast = i === pages.length - 1;
                return (
                  <div
                    key={i}
                    className="flipbook-page bg-white overflow-hidden"
                    data-density={(isFirst || isLast) ? 'hard' : 'soft'}
                    style={{ width: pageWidth, height: pageHeight }}
                  >
                    {isInWindow ? (
                      <img
                        src={url}
                        alt={`Page ${i + 1}`}
                        className="w-full h-full object-contain select-none pointer-events-none"
                        loading={i < 4 ? 'eager' : 'lazy'}
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
       </div>
      </div>

      {/* Bottom controls area — fixed height, relative for thumbnail overlay */}
      <div className="relative flex-shrink-0 w-full flex flex-col items-center pb-2">
        {/* Thumbnail Panel — overlays above toolbar */}
        {showThumbnails && (
          <div className="absolute bottom-full left-0 right-0 mb-1 z-20">
            <ThumbnailPanel
              pages={pages}
              currentPage={currentPage}
              onPageSelect={goToPage}
              onClose={() => setShowThumbnails(false)}
            />
          </div>
        )}

        {/* Toolbar */}
        <div
          className={`
            flex items-center gap-1 sm:gap-2
            rounded-2xl bg-zinc-900/85 backdrop-blur-xl border border-white/8
            px-2 sm:px-3 py-1.5 shadow-2xl transition-all duration-300
            ${chromeless ? 'opacity-0 hover:opacity-100' : ''}
            ${!toolbarVisible && !chromeless ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
          `}
          onMouseEnter={() => setToolbarVisible(true)}
        >
        {/* Left cluster: Thumbnail toggle */}
        {!chromeless && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className={`${btnClass} ${showThumbnails ? 'bg-white/15 text-white' : ''}`}
                  aria-label="Toggle thumbnails"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tipClass}>
                {showThumbnails ? 'Hide thumbnails' : 'Show thumbnails'}
              </TooltipContent>
            </Tooltip>
            <div className="h-5 w-px bg-white/10 mx-0.5" />
          </>
        )}

        {/* Center cluster: Page navigation */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={goPrev}
              disabled={currentPage <= 0}
              className={btnClass}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className={tipClass}>Previous page</TooltipContent>
        </Tooltip>

        <div className="flex items-center text-sm font-medium text-zinc-400">
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage + 1}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) - 1)}
            className="w-10 bg-white/5 text-center text-white rounded-lg border border-white/10 focus:outline-none focus:border-primary py-0.5"
            aria-label="Go to page"
          />
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={goNext}
              disabled={currentPage >= totalPages - 1}
              className={btnClass}
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className={tipClass}>Next page</TooltipContent>
        </Tooltip>

        {/* Right cluster: Actions */}
        {!chromeless && (
          <>
            <div className="h-5 w-px bg-white/10 mx-0.5" />

            {/* Zoom — desktop only */}
            <div className="hidden sm:flex items-center gap-0.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setZoom((prev) => Math.max(0.5, +(prev - 0.15).toFixed(2)))}
                    disabled={zoom <= 0.5}
                    className={btnSmClass}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className={tipClass}>Zoom out</TooltipContent>
              </Tooltip>

              <span className="text-[10px] text-zinc-500 w-8 text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setZoom((prev) => Math.min(2, +(prev + 0.15).toFixed(2)))}
                    disabled={zoom >= 2}
                    className={btnSmClass}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className={tipClass}>Zoom in</TooltipContent>
              </Tooltip>
            </div>

            {/* Sound toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`${btnSmClass} ${soundEnabled ? 'text-zinc-300' : 'text-zinc-600'}`}
                  aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                >
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tipClass}>
                {soundEnabled ? 'Mute' : 'Unmute'}
              </TooltipContent>
            </Tooltip>

            {/* Download */}
            {pdfUrl && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDownload}
                    className={btnSmClass}
                    aria-label="Download PDF"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className={tipClass}>Download PDF</TooltipContent>
              </Tooltip>
            )}

            {/* Fullscreen */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={toggleFullscreen}
                  className={btnClass}
                  aria-label="Toggle fullscreen"
                >
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className={tipClass}>
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
