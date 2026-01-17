import { motion } from 'framer-motion';
import { Meal } from '@/types/homebite';
import { useHomebite } from '@/context/HomebiteContext';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MealCardProps {
  meal: Meal;
  index: number;
}

export function MealCard({ meal, index }: MealCardProps) {
  const { purchaseMeal, role } = useHomebite();
  const isSoldOut = meal.remainingPortions <= 0;

  const handlePurchase = () => {
    const success = purchaseMeal(meal.id);
    if (success) {
      toast({
        title: "Reserved! 🎉",
        description: `${meal.cookName} will have your ${meal.dishName} ready.`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      className={`flex items-center gap-3 p-3 bg-card border-b border-border ${
        isSoldOut ? 'opacity-50' : ''
      }`}
    >
      {/* Profile Photo */}
      <Avatar className="w-11 h-11 flex-shrink-0">
        <AvatarImage src={meal.cookAvatar} alt={meal.cookName} />
        <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
          {meal.cookName.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      {/* Dish Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base text-foreground truncate">
            {meal.dishName}
          </h3>
          {!isSoldOut ? (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
              {meal.remainingPortions} left
            </span>
          ) : (
            <span className="flex-shrink-0 px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
              Gone
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {meal.cookName} · {meal.neighborhood}
        </p>
      </div>

      {/* Food Thumbnail */}
      <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={meal.dishName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl">
            🍽️
          </div>
        )}
      </div>

      {/* Price & Action */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-base font-semibold text-foreground">
          €{meal.price.toFixed(0)}
        </span>
        {role === 'eater' && (
          <button
            onClick={handlePurchase}
            disabled={isSoldOut}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              isSoldOut
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-terracotta-dark active:scale-95'
            }`}
          >
            {isSoldOut ? 'Sold' : 'Order'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
