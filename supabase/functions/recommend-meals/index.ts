import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DietaryPreferences {
  allergies?: string[];
  restrictions?: string[];
  maxBudget?: number;
}

interface Meal {
  id: string;
  dish_name: string;
  description: string | null;
  price: number;
  tags: string[];
  remaining_portions: number;
}

interface RecommendedMeal extends Meal {
  aiReason: string;
  matchScore: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { meals, preferences } = await req.json() as { 
      meals: Meal[]; 
      preferences: DietaryPreferences;
    };
    
    if (!meals || !Array.isArray(meals)) {
      return new Response(
        JSON.stringify({ error: 'Meals array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${meals.length} meals with preferences:`, preferences);

    // Filter and score meals based on preferences
    const recommendations: RecommendedMeal[] = [];
    const allergyTags = preferences.allergies || [];
    const restrictions = preferences.restrictions || [];
    const maxBudget = preferences.maxBudget;

    for (const meal of meals) {
      // Skip sold out meals
      if (meal.remaining_portions <= 0) continue;

      const mealTags = meal.tags || [];
      let matchScore = 0;
      const reasons: string[] = [];
      let excluded = false;

      // Check for allergies - exclude if contains allergen
      for (const allergy of allergyTags) {
        const allergenTag = `Contains ${allergy}`;
        if (mealTags.includes(allergenTag)) {
          excluded = true;
          break;
        }
        // Positive match if explicitly free of allergen
        const freeTag = `${allergy}-Free`;
        if (mealTags.includes(freeTag)) {
          matchScore += 20;
          reasons.push(`${allergy}-Free`);
        }
      }

      if (excluded) continue;

      // Check dietary restrictions
      for (const restriction of restrictions) {
        if (restriction === 'Vegetarian' && mealTags.includes('Vegetarian')) {
          matchScore += 30;
          reasons.push('Vegetarian');
        }
        if (restriction === 'Vegan' && mealTags.includes('Vegan')) {
          matchScore += 30;
          reasons.push('Vegan');
        }
        if (restriction === 'Halal' && mealTags.includes('Halal')) {
          matchScore += 30;
          reasons.push('Halal-friendly');
        }
        if (restriction === 'Gluten-Free' && mealTags.includes('Gluten-Free')) {
          matchScore += 25;
          reasons.push('Gluten-Free');
        }
      }

      // Budget matching
      if (maxBudget && meal.price <= maxBudget) {
        matchScore += 15;
        reasons.push(`Within your €${maxBudget} budget`);
      } else if (maxBudget && meal.price <= maxBudget * 1.1) {
        matchScore += 5;
        reasons.push(`Close to your €${maxBudget} budget`);
      }

      // Boost low stock items (urgency)
      if (meal.remaining_portions <= 3) {
        matchScore += 10;
        reasons.push('Low stock - order soon!');
      }

      // Only recommend if there's at least one positive reason
      if (matchScore > 0 && reasons.length > 0) {
        // Create a human-readable reason
        let aiReason = '';
        if (reasons.length === 1) {
          aiReason = reasons[0];
        } else if (reasons.includes('Within your €' + maxBudget + ' budget') || 
                   reasons.some(r => r.includes('budget'))) {
          const budgetReason = reasons.find(r => r.includes('budget'));
          const otherReasons = reasons.filter(r => !r.includes('budget') && !r.includes('stock'));
          if (otherReasons.length > 0) {
            aiReason = `${otherReasons[0]} & ${budgetReason}`;
          } else {
            aiReason = budgetReason || reasons[0];
          }
        } else {
          aiReason = reasons.slice(0, 2).join(' & ');
        }

        recommendations.push({
          ...meal,
          matchScore,
          aiReason
        });
      }
    }

    // Sort by match score (highest first)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 5 recommendations
    const topRecommendations = recommendations.slice(0, 5);
    
    console.log(`Returning ${topRecommendations.length} recommendations`);

    return new Response(
      JSON.stringify({ recommendations: topRecommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error generating recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
