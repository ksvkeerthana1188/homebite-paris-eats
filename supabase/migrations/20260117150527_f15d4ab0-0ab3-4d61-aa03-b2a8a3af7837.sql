-- Add tags column to meals for AI-generated dietary tags
ALTER TABLE public.meals ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add dietary preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dietary_preferences JSONB DEFAULT '{}';

-- Comment for documentation
COMMENT ON COLUMN public.meals.tags IS 'AI-generated dietary tags like Vegetarian, Halal, Contains Dairy, etc.';
COMMENT ON COLUMN public.profiles.dietary_preferences IS 'User dietary preferences including allergies, restrictions, and budget range';