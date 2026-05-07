import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useFlipbooks } from '../hooks/useFlipbooks';
import { FlipbookViewer } from '../components/FlipbookViewer';
import { Loader2 } from 'lucide-react';

export function Embed() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const { getFlipbookForViewer, getPageUrls, probePageDimensions } = useFlipbooks();

  const [pageUrls, setPageUrls] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getFlipbookForViewer(id, token)
      .then(async (fb) => {
        if (!fb) {
          setError('Not found');
        } else if (fb.page_paths) {
          const urls = getPageUrls(fb.page_paths);
          setPageUrls(urls);

          // Probe first page for dynamic sizing
          if (urls.length > 0) {
            try {
              const dims = await probePageDimensions(urls[0]);
              setPageDimensions(dims);
            } catch {
              // Fallback to A4
            }
          }
        }
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, [id, token, getFlipbookForViewer, getPageUrls, probePageDimensions]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (error || pageUrls.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-center">
        <p className="text-sm text-zinc-500">{error || 'No pages available'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center">
      <FlipbookViewer
        pages={pageUrls}
        pageDimensions={pageDimensions}
        chromeless
      />
    </div>
  );
}
