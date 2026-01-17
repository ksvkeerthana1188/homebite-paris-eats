import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useHomebite } from '@/context/HomebiteContext';
import { MealCard } from './MealCard';

export function EaterFeed() {
  const { meals } = useHomebite();

  // Sort meals: available first, then sold out
  const sortedMeals = [...meals].sort((a, b) => {
    if (a.remainingPortions === 0 && b.remainingPortions > 0) return 1;
    if (a.remainingPortions > 0 && b.remainingPortions === 0) return -1;
    return 0;
  });

  return (
    <div className="space-y-0">
      {/* Simple Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="px-4 py-4 border-b border-border"
      >
        <h2 className="text-lg font-display text-foreground">
          Cooking nearby today
        </h2>
        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="w-3 h-3" />
          Paris neighborhoods
        </p>
      </motion.div>

      {/* Compact Vertical List */}
      <div className="divide-y divide-border">
        {sortedMeals.map((meal, index) => (
          <MealCard key={meal.id} meal={meal} index={index} />
        ))}
      </div>

      {meals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-4"
        >
          <span className="text-4xl mb-3 block">🏠</span>
          <h3 className="font-display text-foreground mb-1">
            No one's cooking yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Check back soon!
          </p>
        </motion.div>
      )}
    </div>
  );
}
