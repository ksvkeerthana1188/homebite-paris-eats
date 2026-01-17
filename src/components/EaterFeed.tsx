import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
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
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          Today's Homemade Meals
        </h2>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" />
          Fresh from kitchens in Paris
        </p>
      </motion.div>

      {/* Search hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-md mx-auto"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl text-muted-foreground">
          <Search className="w-5 h-5" />
          <span className="text-sm">Browse meals near you...</span>
        </div>
      </motion.div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
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
          <span className="text-6xl mb-4 block">🍳</span>
          <h3 className="text-xl font-display text-foreground mb-2">
            No meals available yet
          </h3>
          <p className="text-muted-foreground">
            Check back soon for fresh homemade dishes!
          </p>
        </motion.div>
      )}
    </div>
  );
}
