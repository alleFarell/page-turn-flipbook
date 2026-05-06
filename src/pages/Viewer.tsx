import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useFlipbooks } from '../hooks/useFlipbooks';
import { useAuth } from '../hooks/useAuth';
import { FlipbookViewer } from '../components/FlipbookViewer';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowLeft, Lock } from 'lucide-react';
import type { Flipbook } from '../types/database';

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
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="flex gap-1">
          {/* Left page */}
          <Skeleton className="w-[300px] sm:w-[400px] h-[425px] sm:h-[565px] rounded-l-sm bg-zinc-900 border border-zinc-800" />
          {/* Right page */}
          <Skeleton className="w-[300px] sm:w-[400px] h-[425px] sm:h-[565px] rounded-r-sm bg-zinc-900/80 border border-zinc-800 hidden sm:block" />
        </div>
      </main>
      
      {/* Toolbar skeleton */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
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

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      <a href="#viewer-content" className="skip-to-content">Skip to content</a>
      <header className="flex h-14 items-center justify-between px-4 sm:px-6 bg-zinc-900/60 backdrop-blur-xl border-b border-white/10 z-10 relative shadow-md">
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
      </header>
      <main id="viewer-content" className="flex-1 relative w-full h-full overflow-hidden flex items-center justify-center">
        <FlipbookViewer pages={pageUrls} />
      </main>
    </div>
  );
}
