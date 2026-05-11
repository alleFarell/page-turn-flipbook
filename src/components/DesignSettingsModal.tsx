import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import type { Flipbook } from '../types/database';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Layout, 
  Book, 
  Image as ImageIcon, 
  FileText, 
  Play, 
  Layers, 
  GalleryHorizontal, 
  File,
  Check,
  Palette
} from 'lucide-react';
import { cn } from '../lib/utils';

interface DesignSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flipbook: Flipbook;
  onUpdate: () => void;
}

const DESIGN_MODES = [
  { id: 'magazine', name: 'Magazine', icon: Layout, description: 'Double spread, soft cover, realistic flip.' },
  { id: 'book', name: 'Book', icon: Book, description: 'Hard cover, 3D thickness, stiff spine.' },
  { id: 'album', name: 'Album', icon: ImageIcon, description: 'Flat lay, thick pages, landscape optimized.' },
  { id: 'notebook', name: 'Notebook', icon: FileText, description: 'Spiral binder, ruled page backgrounds.' },
  { id: 'slider', name: 'Slider', icon: Play, description: 'Simple horizontal sliding transitions.' },
  { id: 'cards', name: 'Cards', icon: Layers, description: 'Stack of cards with swipe animations.' },
  { id: 'coverflow', name: 'Coverflow', icon: GalleryHorizontal, description: '3D horizontal scrolling coverflow.' },
  { id: 'one-page', name: 'One Page', icon: File, description: 'Single page vertical or horizontal scroll.' },
] as const;

export function DesignSettingsModal({ open, onOpenChange, flipbook, onUpdate }: DesignSettingsModalProps) {
  const [loading, setLoading] = useState(false);
  const [designMode, setDesignMode] = useState<Flipbook['design_mode']>(flipbook.design_mode);
  const [config, setConfig] = useState<any>(flipbook.config || {});

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('flipbooks')
        .update({
          design_mode: designMode,
          config: config
        })
        .eq('id', flipbook.id);

      if (error) throw error;
      toast.success('Design settings saved');
      onUpdate();
      onOpenChange(false);
    } catch (err) {
      console.error('Save failed:', err);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl glass-panel border-white/10 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Palette className="h-5 w-5 text-primary" />
            <DialogTitle className="font-heading text-2xl">Design Customizer</DialogTitle>
          </div>
          <DialogDescription>
            Configure the visual style and behavior of "{flipbook.title}"
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="layout" className="mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1 rounded-xl">
            <TabsTrigger value="layout" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Layout Mode</TabsTrigger>
            <TabsTrigger value="branding" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Branding</TabsTrigger>
            <TabsTrigger value="controls" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DESIGN_MODES.map((mode) => (
                <div
                  key={mode.id}
                  className={cn(
                    "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50 group",
                    designMode === mode.id 
                      ? "border-primary bg-primary/10 ring-1 ring-primary/20" 
                      : "border-white/5 bg-white/5"
                  )}
                  onClick={() => setDesignMode(mode.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      designMode === mode.id ? "bg-primary text-white" : "bg-white/10 text-muted-foreground group-hover:text-primary"
                    )}>
                      <mode.icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold text-foreground">{mode.name}</span>
                    {designMode === mode.id && (
                      <div className="ml-auto bg-primary rounded-full p-1">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Background Color</Label>
                  <div className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <input 
                      type="color" 
                      value={config.backgroundColor || '#18181b'} 
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                      className="h-10 w-12 rounded-lg bg-transparent border-none cursor-pointer overflow-hidden"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">HEX CODE</span>
                      <span className="text-sm font-semibold">{config.backgroundColor || '#18181b'}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Accent Color</Label>
                  <div className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <input 
                      type="color" 
                      value={config.accentColor || '#06b6d4'} 
                      onChange={(e) => updateConfig('accentColor', e.target.value)}
                      className="h-10 w-12 rounded-lg bg-transparent border-none cursor-pointer overflow-hidden"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">HEX CODE</span>
                      <span className="text-sm font-semibold">{config.accentColor || '#06b6d4'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Toolbar Logo URL</Label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="https://example.com/logo.png"
                    value={config.logoUrl || ''}
                    onChange={(e) => updateConfig('logoUrl', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground italic px-1">Tip: Use a transparent PNG for the best result in the viewer toolbar.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="controls" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Allow Download</Label>
                  <p className="text-[11px] text-muted-foreground">Enable original PDF download button.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.showDownload !== false} 
                  onChange={(e) => updateConfig('showDownload', e.target.checked)}
                  className="h-5 w-5 rounded-md border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Enable Printing</Label>
                  <p className="text-[11px] text-muted-foreground">Allow viewers to print specific pages.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.showPrint !== false} 
                  onChange={(e) => updateConfig('showPrint', e.target.checked)}
                  className="h-5 w-5 rounded-md border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Page Turn Sounds</Label>
                  <p className="text-[11px] text-muted-foreground">Subtle realistic paper sound effects.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.enableSound !== false} 
                  onChange={(e) => updateConfig('enableSound', e.target.checked)}
                  className="h-5 w-5 rounded-md border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Spine Shadows</Label>
                  <p className="text-[11px] text-muted-foreground">Render realistic 3D lighting effects.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={config.showShadows !== false} 
                  onChange={(e) => updateConfig('showShadows', e.target.checked)}
                  className="h-5 w-5 rounded-md border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-8 gap-3 sm:gap-0">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/5">Cancel</Button>
          <Button onClick={handleSave} disabled={loading} className="px-8 shadow-lg shadow-primary/20">
            {loading ? 'Applying Changes...' : 'Save Design'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
