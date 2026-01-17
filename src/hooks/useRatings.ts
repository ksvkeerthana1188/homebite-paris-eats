import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface CookRating {
  cook_id: string;
  average_rating: number;
  total_ratings: number;
}

export function useRatings() {
  const { user } = useAuth();
  const [cookRatings, setCookRatings] = useState<Map<string, CookRating>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchRatings = async () => {
    try {
      // Using raw query since types may not be regenerated yet
      const { data, error } = await supabase
        .from('ratings' as any)
        .select('cook_id, rating') as { data: Array<{ cook_id: string; rating: number }> | null; error: any };

      if (error) throw error;

      // Aggregate ratings by cook
      const ratingsMap = new Map<string, { sum: number; count: number }>();
      
      (data || []).forEach((r) => {
        const existing = ratingsMap.get(r.cook_id) || { sum: 0, count: 0 };
        ratingsMap.set(r.cook_id, {
          sum: existing.sum + r.rating,
          count: existing.count + 1,
        });
      });

      const cookRatingsMap = new Map<string, CookRating>();
      ratingsMap.forEach((value, cookId) => {
        cookRatingsMap.set(cookId, {
          cook_id: cookId,
          average_rating: value.sum / value.count,
          total_ratings: value.count,
        });
      });

      setCookRatings(cookRatingsMap);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('ratings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ratings',
        },
        () => {
          fetchRatings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const submitRating = async (orderId: string, cookId: string, rating: number): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to rate.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.from('ratings' as any).insert({
        order_id: orderId,
        cook_id: cookId,
        eater_id: user.id,
        rating,
      } as any);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already rated',
            description: 'You have already rated this order.',
          });
          return false;
        }
        throw error;
      }

      toast({
        title: 'Thanks for your feedback! ⭐',
        description: 'Your rating helps the community.',
      });

      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Rating failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getCookRating = (cookId: string): CookRating | null => {
    return cookRatings.get(cookId) || null;
  };

  return { cookRatings, loading, submitRating, getCookRating, refetch: fetchRatings };
}
