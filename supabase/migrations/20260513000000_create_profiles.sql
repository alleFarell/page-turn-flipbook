-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Insert dummy data for existing users
INSERT INTO public.profiles (id, display_name)
SELECT id, 
  CASE 
    WHEN email = 'tester2@example.com' THEN 'Tester Two'
    WHEN email = 'allefarel@proton.me' THEN 'Alle Farel'
    WHEN email = 'ambiar.farell@yahoo.com' THEN 'Ambiar Farel'
    WHEN email = 'ambiar.farell@ymail.com' THEN 'Ambiar F.'
    ELSE split_part(email, '@', 1)
  END as display_name
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Add foreign key from flipbooks to profiles
ALTER TABLE public.flipbooks 
  DROP CONSTRAINT IF EXISTS flipbooks_owner_id_fkey;

ALTER TABLE public.flipbooks 
  ADD CONSTRAINT flipbooks_owner_id_fkey_profiles
  FOREIGN KEY (owner_id) 
  REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 4. Enable RLS and Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 5. Trigger for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
