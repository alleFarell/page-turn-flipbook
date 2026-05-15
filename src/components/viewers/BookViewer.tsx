/**
 * BookViewer — premium 3D hardcover book with:
 *   - Dynamic page-stack depth (left/right edges grow/shrink as you flip)
 *   - Hardcover board (top/bottom edges)
 *   - Cinematic shadow hierarchy
 *   - CSS clip-path to suppress ghost opposite-page on cover states
 *
 * All decoration is layered as siblings of containerRef — never inside it —
 * so PageFlip's DOM is never disturbed.
 */
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { usePageFlip } from './usePageFlip';
import type { BaseViewerProps, ViewerRef } from './types';

export const BookViewer = forwardRef<ViewerRef, BaseViewerProps>(({
  pages,
  config,
  zoom,
  isMobile,
  soundEnabled,
  showPageNumbers = false,
  autoPageNumbering = false,
  pageLabels = [],
  onPageChange,
  onTotalPagesChange,
  onLoad,
}, ref) => {
  // Books are always landscape double-spread (portrait only on mobile)
  const isPortrait = isMobile;
  const BASE_PAGE_WIDTH = 512;
  const BASE_PAGE_HEIGHT = 724;

  const pageWidth = isPortrait ? 320 : BASE_PAGE_WIDTH;
  const pageHeight = isPortrait ? 453 : BASE_PAGE_HEIGHT;

  const spreadWidth = pageWidth * (isPortrait ? 1 : 2);
  const viewportWidth = spreadWidth;
  const viewportHeight = pageHeight;

  const { containerRef, flipBookRef, layoutPage, isLoaded } = usePageFlip({
    pages, isPortrait, pageWidth, pageHeight,
    soundEnabled, drawShadow: config.showShadows !== false,
    onPageChange, onTotalPagesChange, onLoad,
  });

  useImperativeHandle(ref, () => ({
    goNext:   () => flipBookRef.current?.flipNext(),
    goPrev:   () => flipBookRef.current?.flipPrev(),
    goToPage: (page: number) => {
      if (flipBookRef.current && page >= 0 && page < pages.length) {
        flipBookRef.current.flip(page);
      }
    },
  }));

  // ── Cover state detection ──────────────────────────────────────────────────
  const isLastUnpaired  = pages.length % 2 === 0 && layoutPage >= pages.length - 1;
  const isFrontCover    = !isPortrait && layoutPage === 0;
  const isBackCover     = !isPortrait && isLastUnpaired;
  const isSingleCover   = isFrontCover || isBackCover;

  // Responsive scaling to fit window
  const [responsiveScale, setResponsiveScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const paddingX = isPortrait ? 32 : 120;
      const paddingY = 160; 
      const availW = window.innerWidth - paddingX;
      const availH = window.innerHeight - paddingY;
      
      const scaleW = availW / viewportWidth;
      const scaleH = availH / viewportHeight;
      
      setResponsiveScale(Math.min(scaleW, scaleH, 1.2)); 
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [viewportWidth, viewportHeight, isPortrait]);

  const finalZoom = zoom * responsiveScale;

  // Spread-centering offset
  let xOffsetPx = 0;
  if (!isPortrait) {
    if (isFrontCover) xOffsetPx = -(pageWidth / 2);
    else if (isBackCover) xOffsetPx = (pageWidth / 2);
  }

  // ── Dynamic page-stack thickness (grows/shrinks as you flip) ──────────────
  const bookProgress    = pages.length > 1 ? layoutPage / (pages.length - 1) : 0;
  const leftStack  = (isPortrait || isFrontCover) ? 0 : Math.round(bookProgress * 18);
  const rightStack = (isPortrait || isBackCover)  ? 0 : Math.round((1 - bookProgress) * 18);

  return (
    <div
      className={cn(
        'relative transition-all duration-700 ease-out flex items-center justify-center overflow-visible',
        isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4',
      )}
      style={{
        width: viewportWidth,
        height: viewportHeight,
        transform: `scale(${finalZoom}) translateX(${xOffsetPx}px)`,
        transformOrigin: 'center center',
        transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease-out',
        perspective: '2500px',
      }}
    >
      {/* ── BOOK DECORATION (siblings of containerRef, never inside) ─────── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>

        {/* Ambient outer glow — framed to visible half only during cover states */}
        <div className="absolute" style={{
          top: '-16px', bottom: '-16px',
          left: isFrontCover ? '50%' : '-10px',
          right: isBackCover  ? '50%' : '-10px',
          borderRadius: '6px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.55), 0 12px 32px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.25)',
        }} />

        {/* Hardcover board — top edge */}
        <div className="absolute" style={{
          top: '-10px', height: '10px',
          left: isFrontCover ? '50%' : '0',
          right: isBackCover  ? '50%' : '0',
          borderRadius: '3px 3px 0 0',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(0,0,0,0.3))',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
        }} />

        {/* Hardcover board — bottom edge */}
        <div className="absolute" style={{
          bottom: '-10px', height: '10px',
          left: isFrontCover ? '50%' : '0',
          right: isBackCover  ? '50%' : '0',
          borderRadius: '0 0 3px 3px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.15))',
        }} />

        {/* Left page-stack edge */}
        {leftStack > 0 && (
          <div className="absolute top-0 bottom-0" style={{
            left: `-${leftStack + 2}px`, width: `${leftStack}px`,
            borderRadius: '1px 0 0 1px',
            background: 'repeating-linear-gradient(to left, #e8e5e0, #e8e5e0 1px, #f3f1ee 1px, #f3f1ee 3px)',
            boxShadow: 'inset -3px 0 8px rgba(0,0,0,0.18), -2px 0 6px rgba(0,0,0,0.12)',
          }}>
            <div className="absolute left-0 right-0 top-0 h-[6px]"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)' }} />
            <div className="absolute left-0 right-0 bottom-0 h-[6px]"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }} />
          </div>
        )}

        {/* Right page-stack edge */}
        {rightStack > 0 && (
          <div className="absolute top-0 bottom-0" style={{
            right: `-${rightStack + 2}px`, width: `${rightStack}px`,
            borderRadius: '0 1px 1px 0',
            background: 'repeating-linear-gradient(to right, #e8e5e0, #e8e5e0 1px, #f3f1ee 1px, #f3f1ee 3px)',
            boxShadow: 'inset 3px 0 8px rgba(0,0,0,0.18), 2px 0 6px rgba(0,0,0,0.12)',
          }}>
            <div className="absolute left-0 right-0 top-0 h-[6px]"
              style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)' }} />
            <div className="absolute left-0 right-0 bottom-0 h-[6px]"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }} />
          </div>
        )}

        {/* Spine crease — spread state only */}
        {!isPortrait && !isSingleCover && (
          <>
            <div className="absolute top-0 bottom-0" style={{
              left: 'calc(50% - 20px)', width: '40px',
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.28) 0%, transparent 70%)',
            }} />
            <div className="absolute top-0 bottom-0 w-[1px]"
              style={{ left: 'calc(50% - 0.5px)', background: 'rgba(0,0,0,0.45)' }} />
            <div className="absolute top-0 bottom-0 w-[1px]"
              style={{ left: 'calc(50% + 1px)', background: 'rgba(255,255,255,0.12)' }} />
          </>
        )}

        {/* Cinematic page-surface lighting (bounded to active half) */}
        <div className="absolute" style={{
          top: 0, bottom: 0,
          left: isFrontCover ? '50%' : 0,
          right: isBackCover  ? '50%' : 0,
          background: 'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.12) 100%)',
        }} />
        <div className="absolute" style={{
          top: 0, bottom: 0,
          left: isFrontCover ? '50%' : 0,
          right: isBackCover  ? '50%' : 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 45%)',
        }} />
      </div>

      {/*
        ── PAGE FLIP CONTAINER ─────────────────────────────────────────────────
        containerRef DOM is NEVER modified. We wrap it in a clip-path div to
        erase the ghost half during front/back cover states. Clip-path is
        purely visual and does not affect PageFlip's layout calculations.
      */}
      <div style={{
        clipPath: isFrontCover
          ? `inset(0 0 0 ${pageWidth}px)`
          : isBackCover
            ? `inset(0 ${pageWidth}px 0 0)`
            : 'none',
        transition: 'clip-path 0.5s ease',
        position: 'relative',
        zIndex: 10,
      }}>
        <div
          ref={containerRef}
          className="relative overflow-visible"
          style={{ width: spreadWidth, height: pageHeight, transformStyle: 'preserve-3d' }}
        >
          {pages.map((url, i) => {
            const isLeftPage  = i % 2 !== 0;
            const isRightPage = i % 2 === 0 && i !== 0;

            return (
              <div
                key={i}
                className="flipbook-page bg-[#fdfcfa] overflow-visible relative page-edge-style"
                style={{ 
                  width: pageWidth, 
                  height: pageHeight,
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Warm paper micro-texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                  backgroundSize: '200px 200px',
                }} />

                <img
                  src={url}
                  alt={`Page ${i + 1}`}
                  className="w-full h-full object-contain select-none pointer-events-none relative z-10 mix-blend-multiply"
                  loading={i < 4 ? 'eager' : 'lazy'}
                  style={{ imageRendering: 'auto' }}
                />

                {/* Deep spine inner shadow */}
                {config.showShadows !== false && (
                  <>
                    {(isRightPage || i === 0) && (
                      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/45 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                    )}
                    {isLeftPage && (
                      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/45 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                    )}
                  </>
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
    </div>
  );
});
BookViewer.displayName = 'BookViewer';
