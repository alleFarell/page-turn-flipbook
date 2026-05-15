/**
 * CardsViewer — card-stack with fan/swipe gesture feel.
 * TODO: implement full gesture-based card engine.
 * Design feel: card stack, Tinder-style swipe, photo stack.
 */
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
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

  const isPortrait = isMobile;
  const BASE_PAGE_WIDTH = 512;
  const BASE_PAGE_HEIGHT = 724;

  const pageWidth = isPortrait ? 320 : BASE_PAGE_WIDTH;
  const pageHeight = isPortrait ? 453 : BASE_PAGE_HEIGHT;
  const viewportWidth = pageWidth + 60;
  const viewportHeight = pageHeight + 60;

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

  // Render up to 3 stacked card layers
  const visiblePages = [current + 2, current + 1, current].filter(i => i < pages.length && i >= 0);

  return (
    <div
      className={cn('relative flex items-center justify-center')}
      style={{
        width: viewportWidth,
        height: viewportHeight,
        transform: `scale(${finalZoom})`,
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
