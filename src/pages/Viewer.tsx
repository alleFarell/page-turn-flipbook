import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useFlipbooks } from '../hooks/useFlipbooks';
import { useAuth } from '../hooks/useAuth';
import { FlipbookViewer } from '../components/FlipbookViewer';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, Lock } from 'lucide-react';
import type { Flipbook } from '../types/database';
import { cn } from '../lib/utils';

function ViewerSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Header skeleton */}
      <header className="flex h-14 items-center justify-between px-4 sm:px-6 bg-zinc-900/50 border-b border-zinc-800/50">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-16 bg-zinc-800" />
          <Skeleton className="h-5 w-40 bg-zinc-800" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-zinc-800" />
      </header>
      
      {/* Book skeleton */}
      <main className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
        <div className="flex relative shadow-[0_0_80px_rgba(0,0,0,0.6)]">
          {/* Left page */}
          <div className="w-[300px] sm:w-[400px] h-[425px] sm:h-[565px] bg-zinc-900 border border-zinc-800 rounded-l-md relative overflow-hidden">
             <div className="absolute top-8 left-8 right-12 bottom-12 flex flex-col gap-4 opacity-30">
                <Skeleton className="h-8 w-3/4 bg-zinc-700" />
                <Skeleton className="h-4 w-full bg-zinc-700" />
                <Skeleton className="h-4 w-5/6 bg-zinc-700" />
                <Skeleton className="h-4 w-full bg-zinc-700" />
                <Skeleton className="h-4 w-4/5 bg-zinc-700" />
             </div>
             {/* Spine gradient left */}
             <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/40 to-transparent" />
          </div>
          {/* Right page */}
          <div className="w-[300px] sm:w-[400px] h-[425px] sm:h-[565px] bg-zinc-900 border border-zinc-800 rounded-r-md border-l-0 relative overflow-hidden hidden sm:block">
             <div className="absolute top-8 left-12 right-8 bottom-12 flex flex-col gap-4 opacity-30">
                <Skeleton className="h-8 w-1/2 bg-zinc-700" />
                <div className="flex gap-4 mb-2">
                  <Skeleton className="h-24 w-24 bg-zinc-700" />
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="h-4 w-full bg-zinc-700" />
                    <Skeleton className="h-4 w-4/5 bg-zinc-700" />
                    <Skeleton className="h-4 w-full bg-zinc-700" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full bg-zinc-700" />
                <Skeleton className="h-4 w-3/4 bg-zinc-700" />
             </div>
             {/* Spine gradient right */}
             <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent" />
          </div>
          {/* Center spine crease line */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-zinc-950/80 shadow-[0_0_2px_rgba(0,0,0,0.8)] z-10 hidden sm:block" />
        </div>
      </main>
      
      {/* Toolbar skeleton */}
      <div className="w-full flex justify-center pb-6 pt-4">
        <Skeleton className="h-12 w-72 rounded-2xl bg-zinc-800" />
      </div>
    </div>
  );
}

export function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const { user } = useAuth();
  const { getFlipbookForViewer, getPageUrls } = useFlipbooks();

  const [flipbook, setFlipbook] = useState<Flipbook | null>(null);
  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getFlipbookForViewer(id, token)
      .then(fb => {
        if (!fb) {
          setError('Flipbook not found or access denied');
        } else {
          setFlipbook(fb);
          if (fb.page_paths) setPageUrls(getPageUrls(fb.page_paths));
        }
      })
      .catch(() => setError('Failed to load flipbook'))
      .finally(() => setLoading(false));
  }, [id, token, getFlipbookForViewer, getPageUrls]);

  if (loading) {
    return <ViewerSkeleton />;
  }

  if (error || !flipbook) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-6 text-center">
        <div className="rounded-full bg-zinc-900 p-6 mb-6">
          <Lock className="h-12 w-12 text-zinc-500" />
        </div>
        <p className="text-xl font-medium text-zinc-300 mb-8">{error || 'Not found'}</p>
        <Button asChild variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === flipbook.owner_id;

  // SVG noise — same data-uri as FlipbookViewer for consistency
  const NOISE_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 overflow-hidden relative">
      {/* Noise texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: NOISE_BG, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }}
      />

      <a href="#viewer-content" className="skip-to-content">Skip to content</a>
      {flipbook.config?.showHeader !== false && (
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "flex h-14 items-center justify-between px-4 sm:px-6 backdrop-blur-xl border-b border-white/10 z-10 relative shadow-md",
            !flipbook.config?.headerColor && "bg-zinc-900/60"
          )}
          style={flipbook.config?.headerColor ? { backgroundColor: flipbook.config.headerColor } : {}}
        >
          <div className="flex items-center gap-4">
            {isOwner && (
              <Button variant="ghost" size="sm" asChild className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 -ml-2 hidden sm:flex">
                <Link to="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" /> My Library
                </Link>
              </Button>
            )}
            {isOwner && (
              <Button variant="ghost" size="icon" asChild className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 sm:hidden -ml-2">
                <Link to="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <span className="font-heading text-lg font-medium tracking-tight truncate max-w-[200px] sm:max-w-md">
              {flipbook.title}
            </span>
          </div>
          <div className="flex items-center">
            {flipbook.page_count && (
              <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full">
                {flipbook.page_count} pages
              </span>
            )}
          </div>
        </motion.header>
      )}
      <main id="viewer-content" className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center">
        <FlipbookViewer 
          pages={pageUrls} 
          designMode={flipbook.design_mode}
          config={flipbook.config}
        />
      </main>
    </div>
  );
}
