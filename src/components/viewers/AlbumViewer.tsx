/**
 * AlbumViewer — wide landscape spread.
 * Design feel: photo album, presentation deck, wide-format portfolio.
 */
import { forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../lib/utils';
import { usePageFlip } from './usePageFlip';
import type { BaseViewerProps, ViewerRef } from './types';

export const AlbumViewer = forwardRef<ViewerRef, BaseViewerProps>(({
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
  // Album pages are landscape (shorter height)
  const isPortrait = isMobile;
  const MAX_PAGE_WIDTH = 512;
  const pageWidth = isMobile
    ? Math.min(window.innerWidth - 40, 320)
    : Math.min(MAX_PAGE_WIDTH, Math.floor((window.innerWidth - 260) / 2));
  const pageHeight = Math.round(pageWidth * 0.7); // 4:3 landscape ratio

  const spreadWidth = pageWidth * (isPortrait ? 1 : 2);
  const viewportWidth = isPortrait ? pageWidth + 40 : spreadWidth + 270;
  const viewportHeight = pageHeight + 40;

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

  let xOffsetPx = 0;
  const isLastUnpaired = pages.length % 2 === 0 && layoutPage >= pages.length - 1;
  if (!isPortrait) {
    if (layoutPage === 0)    xOffsetPx = -(pageWidth / 2);
    else if (isLastUnpaired) xOffsetPx = (pageWidth / 2);
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
        transform: `translateX(${xOffsetPx}px) scale(${zoom})`,
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

              {/* Subtle edge vignette */}
              {config.showShadows !== false && (
                <div className="absolute inset-0 pointer-events-none z-20"
                  style={{ boxShadow: 'inset 0 0 20px rgba(0,0,0,0.08)' }} />
              )}

              {/* Spine shadows */}
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
                <div className={`absolute bottom-4 ${isLeftPage ? 'left-5' : 'right-5'} text-[11px] font-medium text-zinc-500/70 select-none pointer-events-none font-sans tracking-widest z-40`}>
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
AlbumViewer.displayName = 'AlbumViewer';
