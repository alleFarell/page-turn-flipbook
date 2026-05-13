import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlipbooks } from '../hooks/useFlipbooks';
import { Navbar } from '../components/Navbar';
import { PublicFlipbookCard } from '../components/PublicFlipbookCard';
import { FlipbookCardSkeleton } from '../components/FlipbookCardSkeleton';
import { Globe } from 'lucide-react';

export function Browse() {
  const { publicFlipbooks, loading, fetchPublicFlipbooks, cloneFlipbook } = useFlipbooks();
  const navigate = useNavigate();

  useEffect(() => { fetchPublicFlipbooks(); }, [fetchPublicFlipbooks]);

  const handleView = (id: string) => navigate(`/viewer/${id}`);

  return (
    <div className="min-h-screen bg-background pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">Browse Community</h1>
          <p className="text-muted-foreground mt-2">Discover and clone public flipbooks shared by other users.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <FlipbookCardSkeleton />
              </div>
            ))}
          </div>
        ) : publicFlipbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/20 glass-panel p-12 text-center animate-fade-in-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Globe className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-2xl font-semibold mb-2">No public flipbooks yet</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Check back later when other users have shared their flipbooks publicly.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {publicFlipbooks.map((fb, index) => (
              <div key={fb.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <PublicFlipbookCard flipbook={fb} onView={handleView} onClone={cloneFlipbook} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
