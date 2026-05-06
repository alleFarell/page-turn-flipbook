import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useFlipbooks } from '../hooks/useFlipbooks';
import { Navbar } from '../components/Navbar';
import { FlipbookCard } from '../components/FlipbookCard';
import { FlipbookCardSkeleton } from '../components/FlipbookCardSkeleton';
import { UploadModal } from '../components/UploadModal';
import { Button } from '../components/ui/button';
import { Plus, Library } from 'lucide-react';
import type { Flipbook } from '../types/database';

export function Dashboard() {
  const [showUpload, setShowUpload] = useState(false);
  const { flipbooks, loading, fetchFlipbooks, createFlipbook, deleteFlipbook } = useFlipbooks();
  const navigate = useNavigate();

  useEffect(() => { fetchFlipbooks(); }, [fetchFlipbooks]);

  const handleView = (id: string) => navigate(`/viewer/${id}`);

  const handleDelete = async (flipbook: Flipbook) => {
    try {
      await deleteFlipbook(flipbook);
      toast.success(`"${flipbook.title}" deleted`);
      fetchFlipbooks();
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete flipbook');
    }
  };

  const handleUploadSuccess = (id: string) => {
    toast.success('Flipbook created successfully!');
    navigate(`/viewer/${id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <a href="#dashboard-content" className="skip-to-content">Skip to content</a>
      <Navbar />
      <main id="dashboard-content" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="font-heading text-4xl font-semibold tracking-tight">My Library</h1>
          <Button onClick={() => setShowUpload(true)} id="btn-new-flipbook" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            New Flipbook
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <FlipbookCardSkeleton />
              </div>
            ))}
          </div>
        ) : flipbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed p-12 text-center animate-fade-in-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <Library className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-2xl font-semibold mb-2">No flipbooks yet</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Upload your first PDF document to transform it into a stunning, interactive reading experience.
            </p>
            <Button size="lg" onClick={() => setShowUpload(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Upload PDF
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {flipbooks.map((fb, index) => (
              <div key={fb.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <FlipbookCard flipbook={fb} onView={handleView} onDelete={handleDelete} onUpdate={fetchFlipbooks} />
              </div>
            ))}
          </div>
        )}
      </main>

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={createFlipbook}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
