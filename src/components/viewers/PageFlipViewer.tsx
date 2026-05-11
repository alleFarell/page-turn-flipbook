import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { PageFlip } from 'page-flip';
import { cn } from '../../lib/utils';
import type { BaseViewerProps, ViewerRef } from './types';
import pageTurnSoundFile from '../../assets/pageturn-sound.mp3';

export const PageFlipViewer = forwardRef<ViewerRef, BaseViewerProps>(({
  pages,
  designMode,
  config,
  zoom,
  isMobile,
  soundEnabled,
  showPageNumbers = false,
  autoPageNumbering = false,
  pageLabels = [],
  onPageChange,
  onTotalPagesChange,
  onLoad
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<PageFlip | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [layoutPage, setLayoutPage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

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

  useImperativeHandle(ref, () => ({
    goNext: () => flipBookRef.current?.flipNext(),
    goPrev: () => flipBookRef.current?.flipPrev(),
    goToPage: (page: number) => {
      if (flipBookRef.current && page >= 0 && page < pages.length) {
        flipBookRef.current.flip(page);
      }
    }
  }));

  // Logic to determine layout sizing based on mode
  const isLandscape = designMode === 'album';
  const isPortrait = isMobile || designMode === 'one-page';

  // Calculate dynamic dimensions
  const pageWidth = isMobile ? Math.min(window.innerWidth - 40, 300) : 400;
  const pageHeight = isLandscape ? Math.round(pageWidth * 0.7) : Math.round(pageWidth * 1.414);

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
          usePortrait: isPortrait,
          autoSize: true,
          drawShadow: config.showShadows !== false,
          flippingTime: 800,
          startZIndex: 0,
          startPage: 0,
        });

        const pageElements = containerRef.current.querySelectorAll('.flipbook-page');
        if (pageElements.length > 0) {
          flipBook.loadFromHTML(pageElements as any);
          flipBookRef.current = flipBook;
          onTotalPagesChange(pages.length);
          onPageChange(0);
          setLayoutPage(0);

          flipBook.on('flip', (e) => {
            const pageNum = e.data as number;
            onPageChange(pageNum);
            setLayoutPage(pageNum);
            playPageTurnSound();
          });

          flipBook.on('changeState', (e) => {
            const state = e.data as string;
            if (state === 'flipping') {
              try {
                const flipController = (flipBook as any).getFlipController?.();
                const calc = flipController?.getCalculation?.();
                if (calc) {
                  const dir = calc.getDirection();
                  const portrait = flipBook.getOrientation() === 'portrait';
                  const increment = portrait ? 1 : 2;
                  let nextTarget = flipBook.getCurrentPageIndex();
                  if (dir === 0) nextTarget += increment;
                  else if (dir === 1) nextTarget -= increment;
                  nextTarget = Math.max(0, Math.min(nextTarget, flipBook.getPageCount() - 1));
                  setLayoutPage(nextTarget);
                }
              } catch (err) { }
            } else if (state === 'read') {
              setLayoutPage(flipBook.getCurrentPageIndex());
            }
          });
        }
      } catch (err) {
        console.error('PageFlip error:', err);
      } finally {
        setIsLoaded(true);
        onLoad();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (flipBookRef.current) {
        flipBookRef.current.destroy();
        flipBookRef.current = null;
      }
    };
  }, [pages.length, isPortrait, pageWidth, pageHeight, playPageTurnSound, designMode, config.showShadows]);

  let xOffsetPx = 0;
  const isLastUnpairedPage = pages.length % 2 === 0 && layoutPage >= pages.length - 1;

  if (!isPortrait) {
    if (layoutPage === 0) {
      xOffsetPx = -(pageWidth / 2);
    } else if (isLastUnpairedPage) {
      xOffsetPx = (pageWidth / 2);
    }
  }

  return (
    <div
      className={cn(
        "relative transition-all duration-700 ease-out flex items-center justify-center",
        isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4'
      )}
      style={{
        transform: `translateX(${xOffsetPx}px) scale(${zoom})`,
        transformOrigin: 'center center',
        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease-out'
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          "relative z-10 drop-shadow-[0_0_60px_rgba(0,0,0,0.5)]",
          designMode === 'book' && "ring-1 ring-black/20"
        )}
        style={{ width: pageWidth * (isPortrait ? 1 : 2), height: pageHeight }}
      >
        {pages.map((url, i) => {
          const isFirstPage = i === 0;
          const isLeftPage = i % 2 !== 0;
          const isRightPage = i % 2 === 0 && !isFirstPage;

          return (
            <div
              key={i}
              className={cn(
                "flipbook-page overflow-hidden relative page-edge-style",
                designMode === 'notebook' && "bg-[#f8f9fa] border-r border-black/5",
                designMode !== 'notebook' && "bg-white",
                designMode === 'book' && "border-y border-zinc-300"
              )}
              style={{ width: pageWidth, height: pageHeight }}
            >
              {/* Notebook ruled lines */}
              {designMode === 'notebook' && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(transparent 95%, #4299e1 95%)',
                    backgroundSize: '100% 24px',
                    backgroundPosition: '0 8px'
                  }}
                />
              )}

              <img
                src={url}
                alt={`Page ${i + 1}`}
                className="w-full h-full object-contain select-none pointer-events-none relative z-10 mix-blend-multiply"
                loading={i < 4 ? 'eager' : 'lazy'}
              />

              {/* Glossary overlay for magazine mode */}
              <div className={cn(
                "absolute inset-0 pointer-events-none mix-blend-multiply opacity-[0.03] bg-gradient-to-r from-black/40 via-transparent to-black/10 z-20",
                config.showShadows === false && "hidden",
                designMode === 'magazine' && "opacity-20 mix-blend-overlay bg-gradient-to-br from-white/60 via-transparent to-black/30"
              )} />

              {/* Realistic Book Spine Shadows */}
              {config.showShadows !== false && (
                <>
                  {(isRightPage || isFirstPage) && (
                    <div className={cn(
                      "absolute inset-y-0 left-0 bg-gradient-to-r from-black/30 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20",
                      designMode === 'book' ? "w-16 from-black/40" : "w-12"
                    )} />
                  )}
                  {isLeftPage && (
                    <div className={cn(
                      "absolute inset-y-0 right-0 bg-gradient-to-l from-black/30 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20",
                      designMode === 'book' ? "w-16 from-black/40" : "w-12"
                    )} />
                  )}
                </>
              )}

              {/* Notebook Spiral Overlay */}
              {designMode === 'notebook' && (
                <div className={cn(
                  "absolute inset-y-0 w-6 pointer-events-none flex flex-col justify-evenly py-4 z-30",
                  isPortrait
                    ? "left-0 -translate-x-1/2"
                    : (isLeftPage ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2")
                )}>
                  {Array.from({ length: 16 }).map((_, idx) => (
                    <div key={idx} className="w-8 h-3 bg-gradient-to-b from-zinc-300 to-zinc-500 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-zinc-700/50" style={{ transform: 'rotate(-15deg)' }} />
                  ))}
                </div>
              )}

              {/* Page numbers */}
              {showPageNumbers && (
                <div className={`absolute bottom-5 ${isLeftPage ? 'left-6' : 'right-6'} text-[11px] font-medium text-zinc-500/70 select-none pointer-events-none font-sans tracking-widest z-40`}>
                  {autoPageNumbering ? i + 1 : (pageLabels[i] || '')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
PageFlipViewer.displayName = 'PageFlipViewer';
