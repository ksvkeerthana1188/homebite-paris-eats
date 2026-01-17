import { motion } from 'framer-motion';
import { Meal } from '@/types/homebite';

interface ActiveListingCardProps {
  meal: Meal;
  index: number;
}

export function ActiveListingCard({ meal, index }: ActiveListingCardProps) {
  const isSoldOut = meal.remainingPortions <= 0;
  const portionPercentage = (meal.remainingPortions / meal.totalPortions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card border border-border rounded-xl ${
        isSoldOut ? 'opacity-60' : ''
      }`}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <h4 className="font-display text-lg font-semibold text-foreground">
            {meal.dishName}
          </h4>
          {isSoldOut && (
            <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
              Sold Out
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">€{meal.price.toFixed(2)} per portion</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Portions Progress */}
        <div className="flex-1 sm:w-40">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Portions</span>
            <span className="font-medium text-foreground">
              {meal.remainingPortions}/{meal.totalPortions}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${portionPercentage}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
              className={`h-full rounded-full ${
                isSoldOut
                  ? 'bg-muted-foreground'
                  : portionPercentage <= 25
                  ? 'bg-terracotta'
                  : 'bg-sage'
              }`}
            />
          </div>
        </div>

        {/* Sold Count */}
        <div className="text-right">
          <p className="text-2xl font-semibold text-foreground">
            {meal.totalPortions - meal.remainingPortions}
          </p>
          <p className="text-xs text-muted-foreground">sold</p>
        </div>
      </div>
    </motion.div>
  );
}
