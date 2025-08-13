
-- Add id column to user_profiles table if it doesn't exist
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Update the id column to match auth.users.id based on email
UPDATE public.user_profiles
SET id = (
  SELECT id FROM auth.users WHERE auth.users.email = public.user_profiles.email
)
WHERE id IS NULL AND email IS NOT NULL;

-- Make sure user_id column references auth.users properly
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Add proper foreign key constraint
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to use id instead of user_id where needed
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);
