import { motion } from 'framer-motion';
import { User, Clock, ShoppingBag } from 'lucide-react';
import { Meal } from '@/types/homebite';
import { useHomebite } from '@/context/HomebiteContext';
import { toast } from '@/hooks/use-toast';

interface MealCardProps {
  meal: Meal;
  index: number;
}

export function MealCard({ meal, index }: MealCardProps) {
  const { purchaseMeal, role } = useHomebite();
  const isSoldOut = meal.remainingPortions <= 0;
  const isLowStock = meal.remainingPortions <= 2 && meal.remainingPortions > 0;

  const handlePurchase = () => {
    const success = purchaseMeal(meal.id);
    if (success) {
      toast({
        title: "Order placed! 🎉",
        description: `Your ${meal.dishName} from ${meal.cookName} is being prepared.`,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={`group relative bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 ${
        isSoldOut ? 'opacity-75' : ''
      }`}
    >
      {/* Image placeholder with gradient */}
      <div className="relative h-40 bg-gradient-to-br from-terracotta-light/30 to-sage-light/30 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>
        
        {/* Status Badge */}
        {isSoldOut ? (
          <div className="absolute top-3 right-3 bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
            Sold Out
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 right-3 bg-terracotta text-primary-foreground px-3 py-1 rounded-full text-xs font-medium animate-pulse-soft">
            Only {meal.remainingPortions} left!
          </div>
        ) : null}
      </div>

      <div className="p-4 space-y-3">
        {/* Cook info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-6 h-6 rounded-full bg-sage/20 flex items-center justify-center">
            <User className="w-3 h-3 text-sage-dark" />
          </div>
          <span>{meal.cookName}</span>
        </div>

        {/* Dish name */}
        <h3 className="font-display text-lg font-semibold text-foreground leading-tight">
          {meal.dishName}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {meal.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-xl font-semibold text-foreground">
              €{meal.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {meal.remainingPortions}/{meal.totalPortions} portions
            </span>
          </div>

          {role === 'eater' && (
            <button
              onClick={handlePurchase}
              disabled={isSoldOut}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isSoldOut
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-terracotta-dark active:scale-95'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {isSoldOut ? 'Sold Out' : 'Order'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
