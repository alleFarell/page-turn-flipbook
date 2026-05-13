import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import type { Flipbook } from '../types/database';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BookOpen, Eye, Copy, RefreshCw, User } from 'lucide-react';

interface PublicFlipbookCardProps {
  flipbook: Flipbook;
  onView: (id: string) => void;
  onClone: (flipbook: Flipbook) => Promise<string | void>;
}

export function PublicFlipbookCard({ flipbook, onView, onClone }: PublicFlipbookCardProps) {
  const [cloning, setCloning] = useState(false);

  const thumbUrl = flipbook.page_paths && flipbook.page_paths.length > 0
    ? supabase.storage.from('flipbook-pages').getPublicUrl(flipbook.page_paths[0]).data.publicUrl
    : null;

  const handleClone = async () => {
    setCloning(true);
    try {
      await onClone(flipbook);
      toast.success('Successfully cloned to My Library!');
    } catch (error) {
      console.error('Clone failed:', error);
      toast.error('Failed to clone flipbook');
    } finally {
      setCloning(false);
    }
  };

  return (
    <Card className="glass-card group overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50">
      <div 
        className="relative aspect-[16/10] w-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => onView(flipbook.id)}
      >
        {thumbUrl ? (
          <img src={thumbUrl} alt={flipbook.title} loading="lazy" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Badge variant="secondary" className="bg-white/90 text-black border-none backdrop-blur-sm">
            <User className="mr-1 w-3 h-3" />
            {flipbook.profiles?.display_name || 'Community'}
          </Badge>
          {flipbook.page_count && (
            <span className="text-xs font-medium text-white drop-shadow-md">{flipbook.page_count} pages</span>
          )}
        </div>
      </div>

      <CardContent className="flex-1 p-5">
        <h3 className="font-heading text-lg font-semibold leading-tight line-clamp-2 mb-2">
          {flipbook.title}
        </h3>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="text-xs text-muted-foreground">
            Added on {new Date(flipbook.created_at || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2 border-t bg-muted/20">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(flipbook.id)}>
          <Eye className="mr-2 h-4 w-4" /> View
        </Button>
        <Button variant="default" size="sm" className="flex-1" onClick={handleClone} disabled={cloning}>
          {cloning ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />} 
          {cloning ? 'Cloning...' : 'Clone'}
        </Button>
      </CardFooter>
    </Card>
  );
}
