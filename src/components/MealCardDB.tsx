import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { MealWithCook } from '@/hooks/useMeals';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFlag } from '@/lib/nationalities';

interface MealCardDBProps {
  meal: MealWithCook;
  index: number;
}

export function MealCardDB({ meal, index }: MealCardDBProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className={`flex items-center gap-3 px-4 py-3 bg-card border-b border-border transition-all ${
        isSoldOut ? 'opacity-50 grayscale' : ''
      }`}
    >
      {/* Profile Photo with Flag */}
      <div className="relative flex-shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={meal.cook_avatar || undefined} alt={meal.cook_name} />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
            {meal.cook_name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        {meal.nationality && (
          <span className="absolute -bottom-1 -right-1 text-sm">
            {getFlag(meal.nationality)}
          </span>
        )}
      </div>

      {/* Dish Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-[15px] text-foreground truncate">
            {meal.dish_name}
          </h3>
          {!isSoldOut ? (
            <span
              className={`flex-shrink-0 px-1.5 py-0.5 text-[11px] font-medium rounded ${
                isUrgent
                  ? 'bg-primary/25 text-primary animate-pulse'
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
        
        {/* Cook info with nationality and rating */}
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span className="truncate">
            {meal.cook_name}
            {meal.nationality && ` (${meal.nationality})`}
          </span>
          {meal.cook_rating && (
            <span className="flex items-center gap-0.5 text-primary flex-shrink-0">
              <Star className="w-3 h-3 fill-primary" />
              {meal.cook_rating.toFixed(1)}
            </span>
          )}
          <span className="flex-shrink-0">· {distance}</span>
        </div>
        
        {/* Authentic recipe tag */}
        {meal.nationality && (
          <p className="text-[11px] text-primary/70 italic">
            Authentic {meal.nationality} recipe
          </p>
        )}
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
                : !user
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
            }`}
          >
            {isSoldOut ? 'Sold' : 'Order'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
