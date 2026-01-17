import { motion } from 'framer-motion';
import { MapPin, Heart } from 'lucide-react';
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
  const isLowStock = meal.remainingPortions <= 2 && meal.remainingPortions > 0;

  const handlePurchase = () => {
    const success = purchaseMeal(meal.id);
    if (success) {
      toast({
        title: "You're all set! 🎉",
        description: `${meal.cookName} is preparing your ${meal.dishName}. They'll message you soon!`,
      });
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`bg-card border border-border rounded-2xl overflow-hidden ${
        isSoldOut ? 'opacity-60' : ''
      }`}
    >
      {/* Cook Header - Like a social post */}
      <div className="flex items-center gap-3 p-4 pb-3">
        <Avatar className="w-12 h-12 border-2 border-primary/20">
          <AvatarImage src={meal.cookAvatar} alt={meal.cookName} />
          <AvatarFallback className="bg-sage/20 text-sage-dark font-medium">
            {meal.cookName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground truncate">
            {meal.cookName}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Cooking today in {meal.neighborhood}
          </p>
        </div>
      </div>

      {/* Food Image - Large and appetizing */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={meal.dishName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-terracotta-light/30 to-sage-light/30">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        
        {/* Friendly Status Badges */}
        {isSoldOut ? (
          <div className="absolute top-3 right-3 bg-warm-brown/80 text-cream px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            All gone! 💫
          </div>
        ) : isLowStock ? (
          <div className="absolute top-3 right-3 bg-terracotta text-cream px-3 py-1.5 rounded-full text-sm font-medium animate-pulse-soft">
            Only {meal.remainingPortions} left!
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-sage/90 text-cream px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
            {meal.remainingPortions} portions left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Dish name and price */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-display text-xl font-semibold text-foreground leading-tight">
            {meal.dishName}
          </h4>
          <span className="text-xl font-semibold text-terracotta whitespace-nowrap">
            €{meal.price.toFixed(2)}
          </span>
        </div>

        {/* Personal description */}
        <p className="text-muted-foreground leading-relaxed">
          {meal.description}
        </p>

        {/* Action Row */}
        <div className="flex items-center gap-3 pt-2">
          {role === 'eater' && (
            <>
              <button
                onClick={handlePurchase}
                disabled={isSoldOut}
                className={`flex-1 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                  isSoldOut
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-terracotta-dark active:scale-[0.98]'
                }`}
              >
                {isSoldOut ? 'Sold Out' : 'Reserve a Plate'}
              </button>
              <button className="p-3 rounded-xl border border-border hover:bg-muted transition-colors">
                <Heart className="w-5 h-5 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}
