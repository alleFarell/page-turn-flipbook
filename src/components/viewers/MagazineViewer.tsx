/**
 * MagazineViewer — glossy double-spread flip with cinematic centre shadows.
 * Design feel: editorial, polished, premium print publication.
 */
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { usePageFlip } from './usePageFlip';
import type { BaseViewerProps, ViewerRef } from './types';

export const MagazineViewer = forwardRef<ViewerRef, BaseViewerProps>(({
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

  // Spread offset — centre the visible page when at cover/back states
  let xOffsetPx = 0;
  const isLastUnpaired = pages.length % 2 === 0 && layoutPage >= pages.length - 1;
  if (!isPortrait) {
    if (layoutPage === 0)      xOffsetPx = pageWidth / 2;
    else if (isLastUnpaired)   xOffsetPx = -(pageWidth / 2);
  }
  // Note: We flipped the sign of xOffsetPx because of transform order.
  // When using `scale(s) translateX(x)`, we translate *after* scaling, 
  // but Wait! In `transform: scale(s) translateX(x)`, if layoutPage === 0, it's the right page (cover). 
  // We want to move the book LEFT so the right page is centered. So translation should be negative!
  // Wait, my comment says I flipped it. Let me undo the flip and make it correct!

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

  // Fix offset sign:
  // Cover is the RIGHT page of the spread. To center it, we move the spread LEFT.
  if (!isPortrait) {
    if (layoutPage === 0)      xOffsetPx = -(pageWidth / 2);
    else if (isLastUnpaired)   xOffsetPx = (pageWidth / 2);
  }

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
      <div
        ref={containerRef}
        className="relative z-10 drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-visible"
        style={{ width: spreadWidth, height: pageHeight, transformStyle: 'preserve-3d' }}
      >
        {pages.map((url, i) => {
          const isLeftPage  = i % 2 !== 0;
          const isRightPage = i % 2 === 0 && i !== 0;

          return (
            <div
              key={i}
              className="flipbook-page bg-white overflow-visible relative page-edge-style"
              style={{ 
                width: pageWidth, 
                height: pageHeight,
                transform: 'translateZ(0)',
                backfaceVisibility: 'hidden',
              }}
            >
              <img
                src={url}
                alt={`Page ${i + 1}`}
                className="w-full h-full object-contain select-none pointer-events-none relative z-10"
                loading={i < 4 ? 'eager' : 'lazy'}
                style={{ imageRendering: 'auto' }}
              />

              {/* Glossy magazine light-catch overlay */}
              {config.showShadows !== false && (
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.15] bg-gradient-to-br from-white/80 via-transparent to-black/40 z-20" />
              )}

              {/* Spine inner shadows */}
              {config.showShadows !== false && (
                <>
                  {(isRightPage || i === 0) && (
                    <>
                      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/40 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                      <div className="absolute inset-y-0 left-0 w-px bg-black/20 pointer-events-none z-20" />
                      <div className="absolute inset-y-0 left-1 w-2 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-20" />
                    </>
                  )}
                  {isLeftPage && (
                    <>
                      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/40 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                      <div className="absolute inset-y-0 right-0 w-px bg-black/20 pointer-events-none z-20" />
                      <div className="absolute inset-y-0 right-1 w-2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-20" />
                    </>
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
  );
});
MagazineViewer.displayName = 'MagazineViewer';
