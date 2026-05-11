import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut, List, LayoutGrid, Volume2, VolumeX } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Slider } from './ui/slider';
import { ThumbnailPanel } from './ThumbnailPanel';
import { TocDrawer } from './TocDrawer';
import { cn } from '../lib/utils';
import { PageFlipViewer } from './viewers/PageFlipViewer';
import type { ViewerRef } from './viewers/types';

interface FlipbookViewerProps {
  pages: string[];
  chromeless?: boolean;
  showPageNumbers?: boolean;
  autoPageNumbering?: boolean;
  pageLabels?: string[];
  designMode?: string;
  config?: any;
}

export function FlipbookViewer({ 
  pages, 
  chromeless = false,
  showPageNumbers = false,
  autoPageNumbering = false,
  pageLabels = [],
  designMode = 'magazine',
  config = {}
}: FlipbookViewerProps) {
  const viewerRef = useRef<ViewerRef>(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isLoaded, setIsLoaded] = useState(false);

  // Toolbar toggles
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isThumbnailsOpen, setIsThumbnailsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(config.enableSound !== false);

  // Detect mobile
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goNext = useCallback(() => viewerRef.current?.goNext(), []);
  const goPrev = useCallback(() => viewerRef.current?.goPrev(), []);
  const goToPage = useCallback((page: number) => viewerRef.current?.goToPage(page), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goNext();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goPrev();
      if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, isFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0]);
  }, []);

  // Map designMode to appropriate viewer engine
  // Currently, all rely on PageFlipViewer. This will expand in future tasks.
  const isPageFlipEngine = ['magazine', 'book', 'album', 'notebook', 'one-page'].includes(designMode);
  const isSliderEngine = designMode === 'slider';
  const isCardsEngine = designMode === 'cards';
  const isCoverflowEngine = designMode === 'coverflow';

  return (
    <div className="flex flex-col w-full h-full relative flex-1" style={{ backgroundColor: config.backgroundColor || '#09090b' }}>
      <TocDrawer isOpen={isTocOpen} onClose={() => setIsTocOpen(false)} />

      {/* Viewer Container Area */}
      <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative pt-6">
        
        {isPageFlipEngine && (
          <PageFlipViewer
            ref={viewerRef}
            pages={pages}
            designMode={designMode}
            config={config}
            zoom={zoom}
            isMobile={isMobile}
            soundEnabled={soundEnabled}
            showPageNumbers={showPageNumbers}
            autoPageNumbering={autoPageNumbering}
            pageLabels={pageLabels}
            onPageChange={setCurrentPage}
            onTotalPagesChange={setTotalPages}
            onLoad={() => setIsLoaded(true)}
          />
        )}
        
        {/* Placeholders for other engines */}
        {(isSliderEngine || isCardsEngine || isCoverflowEngine) && (
          <div className="text-white/50 text-center">
            {designMode.charAt(0).toUpperCase() + designMode.slice(1)} Mode Engine Loading...
          </div>
        )}

        <ThumbnailPanel
          pages={pages}
          currentPage={currentPage}
          isOpen={isThumbnailsOpen}
          onClose={() => setIsThumbnailsOpen(false)}
          onSelectPage={goToPage}
        />
      </div>

      {/* Bottom Toolbar */}
      <div className={cn(
        "w-full flex justify-center pb-6 pt-4 z-30 relative transition-opacity duration-500",
        chromeless ? "hidden" : "",
        isLoaded ? "opacity-100" : "opacity-0"
      )}>
        <div 
          className="flex items-center gap-1.5 sm:gap-3 rounded-2xl bg-zinc-900/85 backdrop-blur-xl border border-white/10 px-3 sm:px-4 py-2 shadow-2xl"
          style={config.accentColor ? { '--primary': config.accentColor } as React.CSSProperties : {}}
        >
          {config.logoUrl && (
            <div className="flex items-center pr-2 border-r border-white/10 mr-1">
              <img src={config.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
            </div>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setIsTocOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95">
                <List className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Table of Contents</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setIsThumbnailsOpen(!isThumbnailsOpen)} className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/10 active:scale-95 ${isThumbnailsOpen ? 'text-primary bg-primary/10' : 'text-zinc-300 hover:text-white'}`}>
                <LayoutGrid className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Thumbnails</TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-white/10 mx-0.5 sm:mx-1" />

          {/* Previous Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={goPrev} disabled={currentPage <= 0} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent">
                <ChevronLeft className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Previous page</TooltipContent>
          </Tooltip>

          {/* Page Navigator */}
          <div className="flex items-center text-sm font-medium text-zinc-400">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage + 1}
              onChange={e => goToPage(parseInt(e.target.value, 10) - 1)}
              className="w-10 bg-white/5 text-center text-white rounded-lg border border-white/10 focus:outline-none focus:border-primary py-0.5"
            />
            <span className="mx-1">/</span>
            <span>{totalPages}</span>
          </div>

          {/* Next Page */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={goNext} disabled={currentPage >= totalPages - 1} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent">
                <ChevronRight className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Next page</TooltipContent>
          </Tooltip>

          <div className="h-5 w-px bg-white/10 mx-0.5 sm:mx-1" />

          {config.showDownload !== false && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => {
                  const link = document.createElement('a');
                  link.href = pages[currentPage];
                  link.download = `page-${currentPage + 1}.jpg`;
                  link.click();
                }} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download h-4 w-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Download current page</TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={() => setSoundEnabled(!soundEnabled)} className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:bg-white/10 active:scale-95 ${soundEnabled ? 'text-primary bg-primary/10' : 'text-zinc-300 hover:text-white'}`}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">{soundEnabled ? 'Mute' : 'Unmute'}</TooltipContent>
          </Tooltip>

          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} disabled={zoom <= 0.5} className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30">
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Zoom out</TooltipContent>
            </Tooltip>

            <Slider
              value={[zoom]}
              min={0.5}
              max={2}
              step={0.1}
              onValueChange={handleZoomChange}
              className="w-20 [&_[data-slot=slider-track]]:bg-white/10 [&_[data-slot=slider-range]]:bg-primary/60 [&_[data-slot=slider-thumb]]:bg-white [&_[data-slot=slider-thumb]]:border-white/50 [&_[data-slot=slider-thumb]]:h-3 [&_[data-slot=slider-thumb]]:w-3"
            />

            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} disabled={zoom >= 2} className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-30">
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">Zoom in</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={toggleFullscreen} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition-all hover:bg-white/10 hover:text-white active:scale-95">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-800 text-zinc-200 border-zinc-700">{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
