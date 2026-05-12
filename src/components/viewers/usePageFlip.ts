/**
 * usePageFlip — shared hook that owns PageFlip lifecycle.
 *
 * All five page-flip-based viewer modes (Magazine, Book, Album, Notebook, OnePageMode)
 * delegate their core flip engine to this hook so the initialization code lives in
 * exactly one place.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { PageFlip } from 'page-flip';
import pageTurnSoundFile from '../../assets/pageturn-sound.mp3';

export interface UsePageFlipOptions {
  pages: string[];
  isPortrait: boolean;
  pageWidth: number;
  pageHeight: number;
  soundEnabled: boolean;
  drawShadow: boolean;
  flippingTime?: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
  onLoad: () => void;
}

export interface UsePageFlipResult {
  containerRef: React.RefObject<HTMLDivElement>;
  flipBookRef: React.RefObject<PageFlip | null>;
  layoutPage: number;
  isLoaded: boolean;
}

export function usePageFlip({
  pages,
  isPortrait,
  pageWidth,
  pageHeight,
  soundEnabled,
  drawShadow,
  flippingTime = 800,
  onPageChange,
  onTotalPagesChange,
  onLoad,
}: UsePageFlipOptions): UsePageFlipResult {
  const containerRef = useRef<HTMLDivElement>(null!);
  const flipBookRef  = useRef<PageFlip | null>(null);
  const audioRef     = useRef<HTMLAudioElement | null>(null);

  const [layoutPage, setLayoutPage] = useState(0);
  const [isLoaded,   setIsLoaded]   = useState(false);

  // Audio
  useEffect(() => {
    audioRef.current = new Audio(pageTurnSoundFile);
    audioRef.current.preload = 'auto';
  }, []);

  const playPageTurnSound = useCallback(() => {
    if (!soundEnabled || !audioRef.current) return;
    try {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch { /* ignore */ }
  }, [soundEnabled]);

  // PageFlip initialization
  useEffect(() => {
    if (!containerRef.current || pages.length === 0) return;

    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      flipBookRef.current?.destroy();

      try {
        const flipBook = new PageFlip(containerRef.current, {
          width: pageWidth,
          height: pageHeight,
          size: 'fixed',
          showCover: true,
          maxShadowOpacity: 0.5,
          mobileScrollSupport: true,
          useMouseEvents: true,
          swipeDistance: 30,
          showPageCorners: true,
          disableFlipByClick: false,
          usePortrait: isPortrait,
          autoSize: true,
          drawShadow,
          flippingTime,
          startZIndex: 0,
          startPage: 0,
        });

        const pageElements = containerRef.current.querySelectorAll('.flipbook-page');
        if (pageElements.length > 0) {
          flipBook.loadFromHTML(pageElements as any);
          flipBookRef.current = flipBook;
          onTotalPagesChange(pages.length);
          onPageChange(0);
          setLayoutPage(0);

          flipBook.on('flip', (e) => {
            const pageNum = e.data as number;
            onPageChange(pageNum);
            setLayoutPage(pageNum);
            playPageTurnSound();
          });

          flipBook.on('changeState', (e) => {
            const state = e.data as string;
            if (state === 'flipping') {
              try {
                const ctrl = (flipBook as any).getFlipController?.();
                const calc = ctrl?.getCalculation?.();
                if (calc) {
                  const dir = calc.getDirection();
                  const portrait = flipBook.getOrientation() === 'portrait';
                  const step = portrait ? 1 : 2;
                  let next = flipBook.getCurrentPageIndex();
                  if (dir === 0) next += step;
                  else if (dir === 1) next -= step;
                  next = Math.max(0, Math.min(next, flipBook.getPageCount() - 1));
                  setLayoutPage(next);
                }
              } catch { /* ignore */ }
            } else if (state === 'read') {
              setLayoutPage(flipBook.getCurrentPageIndex());
            }
          });
        }
      } catch (err) {
        console.error('[PageFlip] init error:', err);
      } finally {
        setIsLoaded(true);
        onLoad();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      flipBookRef.current?.destroy();
      flipBookRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length, isPortrait, pageWidth, pageHeight, drawShadow, flippingTime]);

  return { containerRef, flipBookRef, layoutPage, isLoaded };
}
