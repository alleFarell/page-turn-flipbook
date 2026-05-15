/**
 * SliderViewer — horizontal scroll/slide transition between pages.
 * TODO: implement custom DOM engine (no page-flip library).
 * Design feel: presentation slides, smooth horizontal sweep.
 */
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import type { BaseViewerProps, ViewerRef } from './types';

export const SliderViewer = forwardRef<ViewerRef, BaseViewerProps>(({
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

  // Responsive scaling to fit window
  const [responsiveScale, setResponsiveScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      const paddingX = isPortrait ? 32 : 120;
      const paddingY = 160; 
      const availW = window.innerWidth - paddingX;
      const availH = window.innerHeight - paddingY;
      
      const scaleW = availW / pageWidth;
      const scaleH = availH / pageHeight;
      
      setResponsiveScale(Math.min(scaleW, scaleH, 1.2)); 
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [pageWidth, pageHeight, isPortrait]);

  const finalZoom = zoom * responsiveScale;

  return (
    <div
      className={cn('relative overflow-hidden flex items-center justify-center')}
      style={{
        width: pageWidth,
        height: pageHeight,
        transform: `scale(${finalZoom})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Slide strip */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          width: pageWidth * pages.length,
          transform: `translateX(-${current * pageWidth}px)`,
        }}
      >
        {pages.map((url, i) => (
          <div
            key={i}
            className="relative shrink-0 bg-white drop-shadow-[0_0_40px_rgba(0,0,0,0.4)]"
            style={{ width: pageWidth, height: pageHeight }}
          >
            <img
              src={url}
              alt={`Page ${i + 1}`}
              className="w-full h-full object-contain select-none pointer-events-none"
              loading={i < 4 ? 'eager' : 'lazy'}
            />
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
SliderViewer.displayName = 'SliderViewer';
