import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface MealWithCook {
  id: string;
  cook_id: string;
  dish_name: string;
  description: string | null;
  price: number;
  total_portions: number;
  remaining_portions: number;
  image_url: string | null;
  created_at: string;
  cook_name: string;
  cook_avatar: string | null;
  neighborhood: string | null;
  nationality: string | null;
  cook_rating: number | null;
  cook_rating_count: number;
}

export function useMeals() {
  const [meals, setMeals] = useState<MealWithCook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    try {
      // Fetch meals with cook profile info
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false });

      if (mealsError) throw mealsError;

      // Fetch profiles for all cooks
      const cookIds = [...new Set(mealsData?.map((m) => m.cook_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', cookIds);

      // Fetch ratings for all cooks
      const { data: ratingsData } = await supabase
        .from('ratings' as any)
        .select('cook_id, rating') as { data: Array<{ cook_id: string; rating: number }> | null; error: any };

      // Aggregate ratings
      const ratingsMap = new Map<string, { sum: number; count: number }>();
      (ratingsData || []).forEach((r) => {
        const existing = ratingsMap.get(r.cook_id) || { sum: 0, count: 0 };
        ratingsMap.set(r.cook_id, {
          sum: existing.sum + r.rating,
          count: existing.count + 1,
        });
      });

      const profileMap = new Map(profilesData?.map((p) => [p.user_id, p]) || []);

      const mealsWithCooks: MealWithCook[] = (mealsData || []).map((meal) => {
        const profile = profileMap.get(meal.cook_id);
        const ratingData = ratingsMap.get(meal.cook_id);
        return {
          ...meal,
          cook_name: profile?.display_name || 'Anonymous Cook',
          cook_avatar: profile?.avatar_url || null,
          neighborhood: profile?.neighborhood || null,
          nationality: (profile as any)?.nationality || null,
          cook_rating: ratingData ? ratingData.sum / ratingData.count : null,
          cook_rating_count: ratingData?.count || 0,
        };
      });

      setMeals(mealsWithCooks);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('meals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
        },
        () => {
          fetchMeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { meals, loading, refetch: fetchMeals };
}

export function useMyMeals() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<MealWithCook[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyMeals = async () => {
    if (!user) {
      setMeals([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('cook_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const mealsWithCook: MealWithCook[] = (data || []).map((meal) => ({
        ...meal,
        cook_name: profile?.display_name || 'You',
        cook_avatar: profile?.avatar_url || null,
        neighborhood: profile?.neighborhood || null,
        nationality: (profile as any)?.nationality || null,
        cook_rating: null,
        cook_rating_count: 0,
      }));

      setMeals(mealsWithCook);
    } catch (error) {
      console.error('Error fetching my meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMeals();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('my-meals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meals',
        },
        () => {
          fetchMyMeals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addMeal = async (mealData: {
    dish_name: string;
    description?: string;
    price: number;
    total_portions: number;
    image_url?: string;
  }) => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to add meals.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.from('meals').insert({
        cook_id: user.id,
        dish_name: mealData.dish_name,
        description: mealData.description || null,
        price: mealData.price,
        total_portions: mealData.total_portions,
        remaining_portions: mealData.total_portions,
        image_url: mealData.image_url || null,
      });

      if (error) throw error;

      toast({
        title: 'Menu posted! 🍽️',
        description: 'Your neighbors can now see your dish.',
      });

      return true;
    } catch (error) {
      console.error('Error adding meal:', error);
      toast({
        title: 'Failed to post',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { meals, loading, addMeal, refetch: fetchMyMeals };
}
