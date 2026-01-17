import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DishAnalysis {
  tags: string[];
}

export function useAITagSuggestions() {
  const [loading, setLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const analyzeDish = async (dishName: string, description: string) => {
    if (!dishName.trim()) {
      setSuggestedTags([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke<DishAnalysis>('analyze-dish', {
        body: { dishName, description }
      });

      if (error) throw error;

      if (data?.tags) {
        setSuggestedTags(data.tags);
      } else {
        setSuggestedTags([]);
      }
    } catch (error) {
      console.error('Error analyzing dish:', error);
      // Don't show error toast - graceful degradation
      setSuggestedTags([]);
    } finally {
      setLoading(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSuggestedTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const clearTags = () => {
    setSuggestedTags([]);
  };

  return {
    loading,
    suggestedTags,
    analyzeDish,
    removeTag,
    clearTags
  };
}
