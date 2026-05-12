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
  const isPortrait = true;
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

  // OnePageViewer is always centred — no spread offset needed
  void layoutPage;

  return (
    <div
      className={cn(
        'relative transition-all duration-700 ease-out flex items-center justify-center',
        isLoaded ? 'opacity-100' : 'opacity-0 translate-y-4',
      )}
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
        transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.7s ease-out',
      }}
    >
      <div
        ref={containerRef}
        className="relative z-10 drop-shadow-[0_0_60px_rgba(0,0,0,0.5)]"
        style={{ width: pageWidth, height: pageHeight }}
      >
        {pages.map((url, i) => (
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

            {/* Subtle edge shadow for single-page depth */}
            {config.showShadows !== false && (
              <div className="absolute inset-0 pointer-events-none z-20"
                style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.06)' }} />
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
