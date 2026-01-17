import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, DietaryPreferences } from '@/context/AuthContext';

interface RecommendedMeal {
  id: string;
  aiReason: string;
  matchScore: number;
}

export function useAIRecommendations() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Map<string, string>>(new Map());

  const getPreferences = (): DietaryPreferences => {
    const prefs = profile?.dietary_preferences as DietaryPreferences | null;
    return {
      allergies: prefs?.allergies || [],
      restrictions: prefs?.restrictions || [],
      maxBudget: prefs?.maxBudget || null
    };
  };

  const hasPreferences = (): boolean => {
    const prefs = getPreferences();
    return prefs.allergies.length > 0 || prefs.restrictions.length > 0 || prefs.maxBudget !== null;
  };

  const fetchRecommendations = async (meals: Array<{
    id: string;
    dish_name: string;
    description: string | null;
    price: number;
    tags: string[];
    remaining_portions: number;
  }>) => {
    const prefs = getPreferences();
    
    // Only fetch if user has preferences set
    if (!hasPreferences()) {
      setRecommendations(new Map());
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-meals', {
        body: { 
          meals,
          preferences: prefs
        }
      });

      if (error) throw error;

      if (data?.recommendations) {
        const recMap = new Map<string, string>();
        for (const rec of data.recommendations as RecommendedMeal[]) {
          recMap.set(rec.id, rec.aiReason);
        }
        setRecommendations(recMap);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations(new Map());
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    recommendations,
    fetchRecommendations,
    getPreferences,
    hasPreferences
  };
}

export function useDietaryPreferences() {
  const { user, profile, refetchProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const savePreferences = async (preferences: DietaryPreferences) => {
    if (!user) return false;

    setSaving(true);
    try {
      // Use type assertion to work with Supabase's Json type
      const { error } = await supabase
        .from('profiles')
        .update({ dietary_preferences: JSON.parse(JSON.stringify(preferences)) })
        .eq('user_id', user.id);

      if (error) throw error;

      await refetchProfile?.();
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const getCurrentPreferences = (): DietaryPreferences => {
    const prefs = profile?.dietary_preferences as DietaryPreferences | null;
    return {
      allergies: prefs?.allergies || [],
      restrictions: prefs?.restrictions || [],
      maxBudget: prefs?.maxBudget || null
    };
  };

  return {
    saving,
    savePreferences,
    getCurrentPreferences
  };
}
