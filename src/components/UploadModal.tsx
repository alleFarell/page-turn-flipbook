import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { FileUp, FileText, X, AlertCircle, Loader2 } from 'lucide-react';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (title: string, file: File, onProgress: (phase: string, current: number, total: number) => void) => Promise<string>;
  onSuccess: (id: string) => void;
}

export function UploadModal({ open, onClose, onUpload, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [phase, setPhase] = useState('');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
    onDrop: (accepted, rejected) => {
      if (rejected.length > 0) {
        const err = rejected[0].errors[0];
        setError(err.code === 'file-too-large' ? 'File is too large. Maximum size is 20MB.' : err.message);
        return;
      }
      if (accepted.length > 0) {
        setFile(accepted[0]);
        if (!title) setTitle(accepted[0].name.replace(/\.pdf$/i, ''));
        setError('');
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setUploading(true);
    setError('');
    try {
      const id = await onUpload(title.trim(), file, (p, c, t) => {
        setPhase(p);
        setProgress(c);
        setTotal(t);
      });
      onSuccess(id);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setTitle('');
    setPhase('');
    setProgress(0);
    setTotal(0);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Create New Flipbook</DialogTitle>
          <DialogDescription>
            Upload a PDF document to transform it into an interactive flipbook.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {!file ? (
            <div 
              {...getRootProps()} 
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
              id="pdf-dropzone"
            >
              <input {...getInputProps()} />
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <FileUp className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragActive ? 'Drop your PDF here...' : 'Drag & drop a PDF here'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse from your computer
              </p>
              <p className="mt-4 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                Maximum file size: 20MB
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                {!uploading && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="flipbook-title">Flipbook Title</Label>
                <Input
                  id="flipbook-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="E.g., Q3 Financial Report"
                  required
                  disabled={uploading}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {uploading && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {phase}
                </span>
                <span className="text-muted-foreground">{progress} / {total}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-in-out" 
                  style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%` }} 
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            {!uploading && (
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}
            {file && !uploading && (
              <Button type="submit" id="btn-create-flipbook">
                Create Flipbook
              </Button>
            )}
            {uploading && (
              <Button disabled className="w-full">
                Processing...
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
