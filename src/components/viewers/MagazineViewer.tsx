/**
 * MagazineViewer — glossy double-spread flip with cinematic centre shadows.
 * Design feel: editorial, polished, premium print publication.
 */
import { forwardRef, useImperativeHandle } from 'react';
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
  const pageWidth  = isMobile ? Math.min(window.innerWidth - 40, 300) : 400;
  const pageHeight = Math.round(pageWidth * 1.414);

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
    if (layoutPage === 0)      xOffsetPx = -(pageWidth / 2);
    else if (isLastUnpaired)   xOffsetPx = (pageWidth / 2);
  }

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
        className="relative z-10 drop-shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        style={{ width: pageWidth * (isPortrait ? 1 : 2), height: pageHeight }}
      >
        {pages.map((url, i) => {
          const isLeftPage  = i % 2 !== 0;
          const isRightPage = i % 2 === 0 && i !== 0;

          return (
            <div
              key={i}
              className="flipbook-page bg-white overflow-hidden relative page-edge-style"
              style={{ width: pageWidth, height: pageHeight }}
            >
              <img
                src={url}
                alt={`Page ${i + 1}`}
                className="w-full h-full object-contain select-none pointer-events-none relative z-10"
                loading={i < 4 ? 'eager' : 'lazy'}
              />

              {/* Glossy magazine light-catch overlay */}
              {config.showShadows !== false && (
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-20 bg-gradient-to-br from-white/60 via-transparent to-black/30 z-20" />
              )}

              {/* Spine inner shadows */}
              {config.showShadows !== false && (
                <>
                  {(isRightPage || i === 0) && (
                    <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/30 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                  )}
                  {isLeftPage && (
                    <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/30 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
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
