/**
 * CoverflowViewer — iOS Coverflow style with 3D perspective fan.
 * TODO: implement full 3D perspective rotation engine.
 * Design feel: Apple iTunes Coverflow, cinematic 3D fan.
 */
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import type { BaseViewerProps, ViewerRef } from './types';

export const CoverflowViewer = forwardRef<ViewerRef, BaseViewerProps>(({
  pages,
  zoom,
  isMobile,
  showPageNumbers = false,
  autoPageNumbering = false,
  pageLabels = [],
  onPageChange,
  onTotalPagesChange,
  onLoad,
}, ref) => {
  const [current, setCurrent] = useState(0);
  const hasInit = useRef(false);

  if (!hasInit.current) {
    hasInit.current = true;
    onTotalPagesChange(pages.length);
    onPageChange(0);
    onLoad();
  }

  const goNext = () => {
    const next = Math.min(current + 1, pages.length - 1);
    setCurrent(next);
    onPageChange(next);
  };
  const goPrev = () => {
    const prev = Math.max(current - 1, 0);
    setCurrent(prev);
    onPageChange(prev);
  };
  const goToPage = (page: number) => {
    const clamped = Math.max(0, Math.min(page, pages.length - 1));
    setCurrent(clamped);
    onPageChange(clamped);
  };

  useImperativeHandle(ref, () => ({ goNext, goPrev, goToPage }));

  const MAX_PAGE_WIDTH = 512;
  const pageWidth = isMobile
    ? Math.min(window.innerWidth - 40, 280)
    : Math.min(MAX_PAGE_WIDTH, Math.floor((window.innerWidth - 260) / 2));
  const pageHeight  = Math.round(pageWidth * 1.414);
  const stageWidth  = isMobile ? window.innerWidth - 20 : window.innerWidth - 80;

  // Show up to 5 pages in the fan
  const slots = [-2, -1, 0, 1, 2];

  return (
    <div
      className={cn('relative flex items-center justify-center overflow-hidden')}
      style={{
        width: stageWidth,
        height: pageHeight + 60,
        perspective: '1200px',
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
      }}
    >
      {slots.map((offset) => {
        const pageIdx = current + offset;
        if (pageIdx < 0 || pageIdx >= pages.length) return null;

        const isCentre   = offset === 0;
        const isLeft     = offset < 0;
        const absOffset  = Math.abs(offset);
        const rotateY    = isLeft ? 55 : offset > 0 ? -55 : 0;
        const translateX = offset * (pageWidth * 0.55);
        const scale      = isCentre ? 1 : 0.82 - absOffset * 0.08;
        const zIndex     = 10 - absOffset;
        const blur       = absOffset > 1 ? 1 : 0;

        return (
          <div
            key={pageIdx}
            className="absolute bg-white overflow-hidden cursor-pointer"
            style={{
              width: pageWidth,
              height: pageHeight,
              transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
              transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
              transformStyle: 'preserve-3d',
              zIndex,
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
              boxShadow: isCentre
                ? '0 30px 60px rgba(0,0,0,0.5)'
                : '0 10px 30px rgba(0,0,0,0.3)',
            }}
            onClick={() => goToPage(pageIdx)}
          >
            <img
              src={pages[pageIdx]}
              alt={`Page ${pageIdx + 1}`}
              className="w-full h-full object-contain select-none pointer-events-none"
              loading={pageIdx < 4 ? 'eager' : 'lazy'}
            />

            {/* Reflection */}
            {isCentre && (
              <div
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{
                  height: pageHeight * 0.3,
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.5))',
                  transform: 'scaleY(-1)',
                  transformOrigin: 'bottom',
                  opacity: 0.3,
                }}
              />
            )}

            {/* Page numbers */}
            {showPageNumbers && isCentre && (
              <div className="absolute bottom-5 right-6 text-[11px] font-medium text-zinc-500/70 select-none pointer-events-none font-sans tracking-widest z-40">
                {autoPageNumbering ? pageIdx + 1 : (pageLabels[pageIdx] || '')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});
CoverflowViewer.displayName = 'CoverflowViewer';
