/**
 * CardsViewer — card-stack with fan/swipe gesture feel.
 * TODO: implement full gesture-based card engine.
 * Design feel: card stack, Tinder-style swipe, photo stack.
 */
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import type { BaseViewerProps, ViewerRef } from './types';

export const CardsViewer = forwardRef<ViewerRef, BaseViewerProps>(({
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

  const pageWidth  = isMobile ? Math.min(window.innerWidth - 40, 300) : 400;
  const pageHeight = Math.round(pageWidth * 1.414);

  // Render up to 3 stacked card layers
  const visiblePages = [current + 2, current + 1, current].filter(i => i < pages.length && i >= 0);

  return (
    <div
      className={cn('relative flex items-center justify-center')}
      style={{
        width: pageWidth,
        height: pageHeight,
        transform: `scale(${zoom})`,
        transformOrigin: 'center center',
      }}
    >
      {visiblePages.map((pageIdx, stackIdx) => {
        const isTop = stackIdx === visiblePages.length - 1;
        const offset = (visiblePages.length - 1 - stackIdx) * 6;

        return (
          <div
            key={pageIdx}
            className={cn(
              'absolute bg-white rounded-sm overflow-hidden cursor-pointer',
              isTop && 'drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]',
            )}
            style={{
              width: pageWidth,
              height: pageHeight,
              transform: `translateY(-${offset}px) rotate(${(visiblePages.length - 1 - stackIdx) * 1.5}deg)`,
              transition: 'transform 0.4s ease',
              zIndex: stackIdx + 1,
              boxShadow: isTop ? undefined : '0 8px 20px rgba(0,0,0,0.2)',
            }}
            onClick={isTop ? goNext : undefined}
          >
            <img
              src={pages[pageIdx]}
              alt={`Page ${pageIdx + 1}`}
              className="w-full h-full object-contain select-none pointer-events-none"
              loading={pageIdx < 4 ? 'eager' : 'lazy'}
            />
            {showPageNumbers && isTop && (
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
CardsViewer.displayName = 'CardsViewer';
