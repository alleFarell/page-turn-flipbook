-- Initial Schema Migration
-- Documents the existing tables and storage configurations before profiles were added

-- 1. Create flipbooks table
CREATE TABLE IF NOT EXISTS public.flipbooks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  pdf_path text,
  page_paths text[] DEFAULT '{}'::text[],
  page_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'processing'::text CHECK (status = ANY (ARRAY['processing'::text, 'ready'::text, 'failed'::text])),
  visibility text NOT NULL DEFAULT 'private'::text CHECK (visibility = ANY (ARRAY['public'::text, 'private'::text])),
  share_token text DEFAULT encode(extensions.gen_random_bytes(24), 'base64'::text),
  created_at timestamp with time zone DEFAULT now(),
  design_mode text NOT NULL DEFAULT 'magazine'::text CHECK (design_mode = ANY (ARRAY['magazine'::text, 'book'::text, 'album'::text, 'notebook'::text, 'slider'::text, 'cards'::text, 'coverflow'::text, 'one-page'::text])),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (id)
);

-- 2. Enable RLS
ALTER TABLE public.flipbooks ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "owner_all"
  ON public.flipbooks FOR ALL
  USING ( auth.uid() = owner_id )
  WITH CHECK ( auth.uid() = owner_id );

CREATE POLICY "public_read"
  ON public.flipbooks FOR SELECT
  USING ( visibility = 'public' AND status = 'ready' );

-- 4. Storage Buckets (Optional initialization for local dev)
INSERT INTO storage.buckets (id, name, public) VALUES ('flipbook-pdfs', 'flipbook-pdfs', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('flipbook-pages', 'flipbook-pages', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true) ON CONFLICT (id) DO NOTHING;
