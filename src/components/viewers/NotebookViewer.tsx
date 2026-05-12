/**
 * NotebookViewer — ruled paper with spiral ring binding.
 * Design feel: personal journal, wire-bound notepad, sketchbook.
 */
import { forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../lib/utils';
import { usePageFlip } from './usePageFlip';
import type { BaseViewerProps, ViewerRef } from './types';

export const NotebookViewer = forwardRef<ViewerRef, BaseViewerProps>(({
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
  const pageWidth  = isMobile ? Math.min(window.innerWidth - 40, 300) : 400;
  const pageHeight = Math.round(pageWidth * 1.414);

  const { containerRef, flipBookRef, layoutPage, isLoaded } = usePageFlip({
    pages, isPortrait, pageWidth, pageHeight,
    soundEnabled, drawShadow: config.showShadows !== false,
    flippingTime: 600, // slightly faster for paper feel
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

  // Number of spiral rings to draw along the spine
  const RING_COUNT = 16;

  return (
    <div
      className={cn(
        'relative transition-all duration-700 ease-out flex items-center justify-center',
        isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4',
      )}
      style={{
        transform: `translateX(${xOffsetPx}px) scale(${zoom})`,
        transformOrigin: 'center center',
        transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease-out',
      }}
    >
      <div
        ref={containerRef}
        className="relative z-10 drop-shadow-[0_0_60px_rgba(0,0,0,0.45)]"
        style={{ width: pageWidth * (isPortrait ? 1 : 2), height: pageHeight }}
      >
        {pages.map((url, i) => {
          const isLeftPage  = i % 2 !== 0;
          const isRightPage = i % 2 === 0 && i !== 0;

          // Spiral rings appear at the center spine (left edge of right page / right edge of left page)
          const showRings = !isPortrait && (i === 0 || isRightPage);

          return (
            <div
              key={i}
              className="flipbook-page bg-[#f8f9fa] overflow-hidden relative page-edge-style border-r border-black/5"
              style={{ width: pageWidth, height: pageHeight }}
            >
              {/* Ruled lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(transparent 95%, #4299e1 95%)',
                  backgroundSize: '100% 24px',
                  backgroundPosition: '0 8px',
                }}
              />

              {/* Red margin line */}
              <div className="absolute top-0 bottom-0 left-[52px] w-[1px] bg-red-300/40 pointer-events-none" />

              <img
                src={url}
                alt={`Page ${i + 1}`}
                className="w-full h-full object-contain select-none pointer-events-none relative z-10 mix-blend-multiply"
                loading={i < 4 ? 'eager' : 'lazy'}
              />

              {/* Spine inner shadows */}
              {config.showShadows !== false && (
                <>
                  {(isRightPage || i === 0) && (
                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/20 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                  )}
                  {isLeftPage && (
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/20 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                  )}
                </>
              )}

              {/* Spiral rings along the centre spine */}
              {showRings && (
                <div className={cn(
                  'absolute inset-y-0 w-6 pointer-events-none flex flex-col justify-evenly py-4 z-30',
                  isPortrait
                    ? 'left-0 -translate-x-1/2'
                    : (isLeftPage ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'),
                )}>
                  {Array.from({ length: RING_COUNT }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-8 h-3 bg-gradient-to-b from-zinc-300 to-zinc-500 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] border border-zinc-700/50"
                      style={{ transform: 'rotate(-15deg)' }}
                    />
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
NotebookViewer.displayName = 'NotebookViewer';
