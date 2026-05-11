import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import type { Flipbook } from '../types/database';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { BookOpen, Eye, Link as LinkIcon, Code, Globe, Lock, MoreVertical, Edit2, Trash2, RefreshCw, Palette } from 'lucide-react';
import { DesignSettingsModal } from './DesignSettingsModal';

interface FlipbookCardProps {
  flipbook: Flipbook;
  onView: (id: string) => void;
  onDelete: (flipbook: Flipbook) => void;
  onUpdate: () => void;
}

export function FlipbookCard({ flipbook, onView, onDelete, onUpdate }: FlipbookCardProps) {
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(flipbook.title);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showDesignSettings, setShowDesignSettings] = useState(false);

  const thumbUrl = flipbook.page_paths && flipbook.page_paths.length > 0
    ? supabase.storage.from('flipbook-pages').getPublicUrl(flipbook.page_paths[0]).data.publicUrl
    : null;

  const shareUrl = `${window.location.origin}/viewer/${flipbook.id}`;
  const privateUrl = `${shareUrl}?token=${flipbook.share_token}`;
  const embedCode = `<iframe src="${window.location.origin}/embed/${flipbook.id}${flipbook.visibility === 'private' ? `?token=${flipbook.share_token}` : ''}" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handleRename = async () => {
    if (!newTitle.trim() || newTitle.trim() === flipbook.title) {
      setRenaming(false);
      return;
    }
    try {
      await supabase.from('flipbooks').update({ title: newTitle.trim() }).eq('id', flipbook.id);
      toast.success('Flipbook renamed');
      setRenaming(false);
      onUpdate();
    } catch {
      toast.error('Failed to rename flipbook');
      setRenaming(false);
    }
  };

  const toggleVisibility = async () => {
    const newVis = flipbook.visibility === 'public' ? 'private' : 'public';
    try {
      await supabase.from('flipbooks').update({ visibility: newVis }).eq('id', flipbook.id);
      toast.success(`Flipbook is now ${newVis}`);
      onUpdate();
    } catch {
      toast.error('Failed to change visibility');
    }
  };

  const rotateToken = async () => {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const newToken = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, c => c === '+' ? '-' : c === '/' ? '_' : '');
    try {
      await supabase.from('flipbooks').update({ share_token: newToken }).eq('id', flipbook.id);
      toast.success('Share token rotated — old links will stop working');
      onUpdate();
    } catch {
      toast.error('Failed to rotate token');
    }
  };

  return (
    <>
      <Card className="glass-card group overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/50">
        <div 
          className="relative aspect-[16/10] w-full bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
          onClick={() => flipbook.status === 'ready' && onView(flipbook.id)}
        >
          {thumbUrl ? (
            <img src={thumbUrl} alt={flipbook.title} loading="lazy" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <BookOpen className="h-12 w-12 text-muted-foreground/30" />
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {flipbook.status === 'ready' && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Badge variant={flipbook.visibility === 'public' ? 'secondary' : 'outline'} className="bg-white/90 text-black border-none backdrop-blur-sm">
                {flipbook.visibility === 'public' ? <Globe className="mr-1 w-3 h-3" /> : <Lock className="mr-1 w-3 h-3" />}
                {flipbook.visibility}
              </Badge>
              {flipbook.page_count && (
                <span className="text-xs font-medium text-white drop-shadow-md">{flipbook.page_count} pages</span>
              )}
            </div>
          )}
        </div>

        <CardContent className="flex-1 p-5">
          <div className="flex justify-between items-start gap-4 mb-2">
            {renaming ? (
              <Input
                className="h-8 font-heading text-lg font-semibold px-2"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false); }}
                autoFocus
              />
            ) : (
              <h3 
                className="font-heading text-lg font-semibold leading-tight line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                onDoubleClick={() => setRenaming(true)}
              >
                {flipbook.title}
              </h3>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setRenaming(true)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDesignSettings(true)}>
                  <Palette className="mr-2 h-4 w-4" /> Customize
                </DropdownMenuItem>
                {flipbook.status === 'ready' && (
                  <>
                    <DropdownMenuItem onClick={toggleVisibility}>
                      {flipbook.visibility === 'public' ? <Lock className="mr-2 h-4 w-4" /> : <Globe className="mr-2 h-4 w-4" />}
                      Make {flipbook.visibility === 'public' ? 'Private' : 'Public'}
                    </DropdownMenuItem>
                    {flipbook.visibility === 'private' && (
                      <DropdownMenuItem onClick={rotateToken}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Rotate Link Token
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => setShowConfirmDelete(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={
              flipbook.status === 'ready' ? 'default' : 
              flipbook.status === 'processing' ? 'secondary' : 'destructive'
            } className="capitalize text-[10px] px-1.5 py-0">
              {flipbook.status === 'processing' && <RefreshCw className="mr-1 h-3 w-3 animate-spin inline" />}
              {flipbook.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(flipbook.created_at || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </CardContent>

        {flipbook.status === 'ready' && (
          <CardFooter className="p-4 pt-0 gap-2 border-t bg-muted/20">
            <Button variant="default" size="sm" className="flex-1" onClick={() => onView(flipbook.id)}>
              <Eye className="mr-2 h-4 w-4" /> View
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => copyToClipboard(flipbook.visibility === 'public' ? shareUrl : privateUrl, 'Share link')}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy share link</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => copyToClipboard(embedCode, 'Embed code')}>
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy embed code</TooltipContent>
            </Tooltip>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flipbook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-foreground">"{flipbook.title}"</strong>? This action cannot be undone and will permanently remove all associated files.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { onDelete(flipbook); setShowConfirmDelete(false); }}>
              Delete Forever
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DesignSettingsModal
        open={showDesignSettings}
        onOpenChange={setShowDesignSettings}
        flipbook={flipbook}
        onUpdate={onUpdate}
      />
    </>
  );
}
