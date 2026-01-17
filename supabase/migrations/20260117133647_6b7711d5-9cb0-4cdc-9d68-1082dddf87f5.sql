
-- Drop the foreign key constraint on meals table to allow demo data
ALTER TABLE public.meals DROP CONSTRAINT IF EXISTS meals_cook_id_fkey;

-- Drop the foreign key constraint on profiles table for demo data
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Update profiles RLS to allow viewing demo profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles FOR SELECT
    USING (true);
