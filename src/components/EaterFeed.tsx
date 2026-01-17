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
    <div className="space-y-6">
      {/* Friendly Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <h2 className="text-2xl md:text-3xl font-display font-semibold text-foreground mb-2">
          Your neighbors are cooking 🍳
        </h2>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" />
          Fresh homemade meals near you in Paris
        </p>
      </motion.div>

      {/* Vertical Feed - Social style */}
      <div className="max-w-lg mx-auto space-y-6">
        {sortedMeals.map((meal, index) => (
          <MealCard key={meal.id} meal={meal} index={index} />
        ))}
      </div>

      {meals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <span className="text-6xl mb-4 block">🏠</span>
          <h3 className="text-xl font-display text-foreground mb-2">
            No one's cooking yet today
          </h3>
          <p className="text-muted-foreground">
            Be the first to share a meal with your neighbors!
          </p>
        </motion.div>
      )}
    </div>
  );
}
