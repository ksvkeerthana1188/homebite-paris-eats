
-- Create role enum for cook vs eater
CREATE TYPE public.app_role AS ENUM ('cook', 'eater');

-- Create user_roles table (security best practice - separate from profiles)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table for user display info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    neighborhood TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meals table
CREATE TABLE public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cook_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    dish_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    total_portions INTEGER NOT NULL,
    remaining_portions INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_portions CHECK (remaining_portions >= 0 AND remaining_portions <= total_portions)
);

-- Create order status enum
CREATE TYPE public.order_status AS ENUM ('placed', 'packing', 'ready', 'picked_up', 'cancelled');

-- Create orders table
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
    eater_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    cook_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    status order_status NOT NULL DEFAULT 'placed',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meals_updated_at
    BEFORE UPDATE ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role on signup"
    ON public.user_roles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for meals
CREATE POLICY "Meals are viewable by everyone"
    ON public.meals FOR SELECT
    USING (true);

CREATE POLICY "Cooks can insert their own meals"
    ON public.meals FOR INSERT
    WITH CHECK (auth.uid() = cook_id AND public.has_role(auth.uid(), 'cook'));

CREATE POLICY "Cooks can update their own meals"
    ON public.meals FOR UPDATE
    USING (auth.uid() = cook_id);

CREATE POLICY "Cooks can delete their own meals"
    ON public.meals FOR DELETE
    USING (auth.uid() = cook_id);

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = eater_id OR auth.uid() = cook_id);

CREATE POLICY "Authenticated users can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = eater_id);

CREATE POLICY "Cooks can update order status"
    ON public.orders FOR UPDATE
    USING (auth.uid() = cook_id);

-- Function to place an order (decrements portions atomically)
CREATE OR REPLACE FUNCTION public.place_order(p_meal_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order_id UUID;
    v_cook_id UUID;
    v_remaining INTEGER;
BEGIN
    -- Get meal info and lock the row
    SELECT cook_id, remaining_portions INTO v_cook_id, v_remaining
    FROM public.meals
    WHERE id = p_meal_id
    FOR UPDATE;

    IF v_remaining IS NULL THEN
        RAISE EXCEPTION 'Meal not found';
    END IF;

    IF v_remaining <= 0 THEN
        RAISE EXCEPTION 'No portions remaining';
    END IF;

    -- Decrement portions
    UPDATE public.meals
    SET remaining_portions = remaining_portions - 1
    WHERE id = p_meal_id;

    -- Create order
    INSERT INTO public.orders (meal_id, eater_id, cook_id, status)
    VALUES (p_meal_id, auth.uid(), v_cook_id, 'placed')
    RETURNING id INTO v_order_id;

    RETURN v_order_id;
END;
$$;

-- Enable realtime for meals and orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.meals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
