import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Sparkles } from 'lucide-react';
import { MealWithCook } from '@/hooks/useMeals';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { getFlag } from '@/lib/nationalities';

interface MealCardDBProps {
  meal: MealWithCook;
  index: number;
  aiReason?: string;
}

// Tag color mapping for visual differentiation
const getTagStyle = (tag: string) => {
  const lowerTag = tag.toLowerCase();
  if (lowerTag.includes('vegan')) return 'bg-green-500/15 text-green-700 dark:text-green-400';
  if (lowerTag.includes('vegetarian')) return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
  if (lowerTag.includes('halal')) return 'bg-purple-500/15 text-purple-700 dark:text-purple-400';
  if (lowerTag.includes('kosher')) return 'bg-blue-500/15 text-blue-700 dark:text-blue-400';
  if (lowerTag.includes('gluten-free')) return 'bg-amber-500/15 text-amber-700 dark:text-amber-400';
  if (lowerTag.includes('dairy-free')) return 'bg-sky-500/15 text-sky-700 dark:text-sky-400';
  if (lowerTag.includes('nut-free')) return 'bg-orange-500/15 text-orange-700 dark:text-orange-400';
  if (lowerTag.includes('contains')) return 'bg-red-500/10 text-red-600 dark:text-red-400';
  if (lowerTag.includes('spicy')) return 'bg-red-500/15 text-red-700 dark:text-red-400';
  return 'bg-muted text-muted-foreground';
};

export function MealCardDB({ meal, index, aiReason }: MealCardDBProps) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  
  const isSoldOut = meal.remaining_portions <= 0;
  const isUrgent = meal.remaining_portions <= 3 && meal.remaining_portions > 0;
  const isCook = role === 'cook';
  const isOwnMeal = user?.id === meal.cook_id;

  const handleOrder = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/checkout/${meal.id}`);
  };

  // Generate random distance for display (would be real in production)
  const distances = ['100m', '180m', '250m', '350m', '450m', '650m', '800m', '950m', '1.1km', '1.2km'];
  const distance = distances[index % distances.length];

  // Only show top 3 most relevant tags
  const displayTags = (meal.tags || []).slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className={`flex flex-col gap-2 px-4 py-3 bg-card border-b border-border transition-all ${
        isSoldOut ? 'opacity-50 grayscale' : ''
      } ${aiReason ? 'bg-primary/5' : ''}`}
    >
      {/* AI Recommendation Badge */}
      {aiReason && (
        <div className="flex items-center gap-1.5 -mt-1 mb-1">
          <Badge variant="secondary" className="bg-primary/15 text-primary text-[10px] px-2 py-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Pick: {aiReason}
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Profile Photo */}
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={meal.cook_avatar || undefined} alt={meal.cook_name} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
            {meal.cook_name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        {/* Dish Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[15px] text-foreground truncate">
              {meal.dish_name}
            </h3>
            {!isSoldOut ? (
              <span
                className={`flex-shrink-0 px-1.5 py-0.5 text-[11px] font-semibold rounded ${
                  isUrgent
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400 animate-[pulse_0.8s_ease-in-out_infinite]'
                    : 'bg-primary/15 text-primary'
                }`}
              >
                {meal.remaining_portions} left
              </span>
            ) : (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-[11px] font-medium bg-muted text-muted-foreground rounded">
                Gone
              </span>
            )}
          </div>
          
          {/* Cook info with flag next to name */}
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <span className="truncate flex items-center gap-1">
              {meal.nationality && (
                <span className="text-sm">{getFlag(meal.nationality)}</span>
              )}
              {meal.cook_name}
            </span>
            {meal.cook_rating && (
              <span className="flex items-center gap-0.5 text-primary flex-shrink-0">
                <Star className="w-3 h-3 fill-primary" />
                {meal.cook_rating.toFixed(1)}
              </span>
            )}
            <span className="flex-shrink-0">· {distance}</span>
          </div>
          
          {/* Tags row - dietary tags + cuisine type */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {meal.nationality && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {meal.nationality}
              </span>
            )}
            {displayTags.map((tag) => (
              <span
                key={tag}
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getTagStyle(tag)}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Food Thumbnail */}
        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {meal.image_url ? (
            <img
              src={meal.image_url}
              alt={meal.dish_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg">
              🍽️
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-[52px]">
          <span className="text-[15px] font-semibold text-foreground">
            €{Number(meal.price).toFixed(0)}
          </span>
          {!isCook && !isOwnMeal && (
            <button
              onClick={handleOrder}
              disabled={isSoldOut}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
                isSoldOut
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
              }`}
            >
              {isSoldOut ? 'Sold' : 'Order'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
