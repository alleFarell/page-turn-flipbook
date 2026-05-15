/**
 * OnePageViewer — single-page portrait view, always portrait mode.
 * Design feel: e-reader, document viewer, clean single-column.
 */
import { forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../lib/utils';
import { usePageFlip } from './usePageFlip';
import type { BaseViewerProps, ViewerRef } from './types';

export const OnePageViewer = forwardRef<ViewerRef, BaseViewerProps>(({
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
  // Always portrait — one page at a time regardless of device
  const isPortrait = true; // Always 1 page wide
  const MAX_PAGE_WIDTH = 512;
  const pageWidth = isMobile
    ? Math.min(window.innerWidth - 40, 320)
    : Math.min(MAX_PAGE_WIDTH, Math.floor((window.innerWidth - 260) / 2));
  const pageHeight = Math.round(pageWidth * 1.414);

  const viewportWidth = pageWidth + 40;
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

  // OnePageViewer is always centred — no spread offset needed
  void layoutPage;

  return (
    <div
      className={cn(
        'relative transition-all duration-700 ease-out flex items-center justify-center overflow-visible',
        isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4',
      )}
      style={{
        width: viewportWidth,
        height: viewportHeight,
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
        transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease-out',
        perspective: '2500px',
      }}
    >
      <div
        ref={containerRef}
        className="relative z-10 drop-shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-visible"
        style={{ width: pageWidth, height: pageHeight, transformStyle: 'preserve-3d' }}
      >
        {pages.map((url, i) => (
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
              className="w-full h-full object-contain select-none pointer-events-none relative z-10 mix-blend-multiply"
              loading={i < 4 ? 'eager' : 'lazy'}
              style={{ imageRendering: 'auto' }}
            />

            {/* Inner binding shadow on the left edge for realism */}
            {config.showShadows !== false && (
              <>
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/40 via-black/5 to-transparent pointer-events-none mix-blend-multiply z-20" />
                <div className="absolute inset-y-0 left-0 w-px bg-black/20 pointer-events-none z-20" />
                <div className="absolute inset-y-0 left-1 w-2 bg-gradient-to-r from-white/10 to-transparent pointer-events-none z-20" />
              </>
            )}

            {/* Page numbers */}
            {showPageNumbers && (
              <div className="absolute bottom-5 right-6 text-[11px] font-medium text-zinc-500/70 select-none pointer-events-none font-sans tracking-widest z-40">
                {autoPageNumbering ? i + 1 : (pageLabels[i] || '')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
OnePageViewer.displayName = 'OnePageViewer';
