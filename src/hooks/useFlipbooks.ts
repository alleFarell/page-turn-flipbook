import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Flipbook } from '../types/database';

export function useFlipbooks() {
  const [flipbooks, setFlipbooks] = useState<Flipbook[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFlipbooks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('flipbooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlipbooks(data || []);
    } catch (err) {
      console.error('Error fetching flipbooks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createFlipbook = useCallback(async (
    title: string,
    pdfFile: File,
    onProgress: (phase: string, current: number, total: number) => void
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 1. Create flipbook record with processing status
    const { data: flipbook, error: insertError } = await supabase
      .from('flipbooks')
      .insert({ owner_id: user.id, title, status: 'processing' })
      .select()
      .single();

    if (insertError || !flipbook) throw insertError || new Error('Failed to create flipbook');

    try {
      // 2. Upload the original PDF
      const pdfPath = `${user.id}/${flipbook.id}/original.pdf`;
      const { error: pdfUploadError } = await supabase.storage
        .from('flipbook-pdfs')
        .upload(pdfPath, pdfFile);

      if (pdfUploadError) throw pdfUploadError;

      // 3. Render PDF pages to JPEG using pdf.js
      let pdfjsLib;
      let pdfWorker;
      try {
        pdfjsLib = await import('pdfjs-dist');
        pdfWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
      } catch (importError) {
        console.error('Failed to load pdfjs-dist:', importError);
        throw new Error('Failed to load the PDF processing engine. The server may have restarted. Please refresh the page and try again.');
      }

      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const pagePaths: string[] = [];

      for (let i = 1; i <= totalPages; i++) {
        onProgress('Rendering pages', i, totalPages);
        
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d')!;

        await page.render({ canvasContext: ctx, viewport } as any).promise;

        // Convert canvas to JPEG blob
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Canvas to blob failed'))),
            'image/jpeg',
            0.85
          );
        });

        // Upload page image
        onProgress('Uploading pages', i, totalPages);
        const pagePath = `${user.id}/${flipbook.id}/page-${String(i).padStart(4, '0')}.jpg`;
        const { error: pageUploadError } = await supabase.storage
          .from('flipbook-pages')
          .upload(pagePath, blob, { contentType: 'image/jpeg' });

        if (pageUploadError) throw pageUploadError;
        pagePaths.push(pagePath);

        // Cleanup
        canvas.width = 0;
        canvas.height = 0;
      }

      // 4. Update flipbook record with page data
      const { error: updateError } = await supabase
        .from('flipbooks')
        .update({
          pdf_path: pdfPath,
          page_paths: pagePaths,
          page_count: totalPages,
          status: 'ready',
        })
        .eq('id', flipbook.id);

      if (updateError) throw updateError;

      return flipbook.id;
    } catch (err) {
      // Mark as failed
      await supabase
        .from('flipbooks')
        .update({ status: 'failed' })
        .eq('id', flipbook.id);
      throw err;
    }
  }, []);

  const deleteFlipbook = useCallback(async (flipbook: Flipbook) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Delete page images from storage
    if (flipbook.page_paths && flipbook.page_paths.length > 0) {
      await supabase.storage
        .from('flipbook-pages')
        .remove(flipbook.page_paths);
    }

    // Delete PDF from storage
    if (flipbook.pdf_path) {
      await supabase.storage
        .from('flipbook-pdfs')
        .remove([flipbook.pdf_path]);
    }

    // Delete database record
    const { error } = await supabase
      .from('flipbooks')
      .delete()
      .eq('id', flipbook.id);

    if (error) throw error;
  }, []);

  const updateFlipbook = useCallback(async (id: string, updates: import('../types/database').FlipbookUpdate) => {
    const { error } = await supabase
      .from('flipbooks')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }, []);

  const rotateShareToken = useCallback(async (id: string) => {
    // Generate a new random token
    const newToken = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24)))
    ).replace(/[+/=]/g, (c) => c === '+' ? '-' : c === '/' ? '_' : '');

    const { error } = await supabase
      .from('flipbooks')
      .update({ share_token: newToken })
      .eq('id', id);

    if (error) throw error;
    return newToken;
  }, []);

  const getFlipbookForViewer = useCallback(async (id: string, token?: string) => {
    const { data, error } = await supabase
      .rpc('get_flipbook_for_viewer', {
        p_id: id,
        ...(token ? { p_token: token } : {}),
      });

    if (error) throw error;
    return data?.[0] || null;
  }, []);

  const getPageUrls = useCallback((pagePaths: string[]) => {
    return pagePaths.map((path) => {
      const { data } = supabase.storage
        .from('flipbook-pages')
        .getPublicUrl(path);
      return data.publicUrl;
    });
  }, []);

  return {
    flipbooks,
    loading,
    fetchFlipbooks,
    createFlipbook,
    deleteFlipbook,
    updateFlipbook,
    rotateShareToken,
    getFlipbookForViewer,
    getPageUrls,
  };
}
