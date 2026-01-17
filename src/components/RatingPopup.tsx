import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderWithDetails } from '@/hooks/useOrders';
import { useRatings } from '@/hooks/useRatings';

interface RatingPopupProps {
  order: OrderWithDetails;
  onClose: () => void;
}

export function RatingPopup({ order, onClose }: RatingPopupProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitRating } = useRatings();

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    const success = await submitRating(order.id, order.cook_id, rating);
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-foreground/50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl p-6 max-w-sm w-full shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-foreground">Rate Your Meal</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">
            How was <span className="font-medium text-foreground">{order.dish_name}</span> from{' '}
            <span className="font-medium text-foreground">{order.cook_name}</span>?
          </p>

          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <div className="text-center mb-6">
            <span className="text-sm text-muted-foreground">
              {rating === 0 && 'Tap to rate'}
              {rating === 1 && 'Not great 😕'}
              {rating === 2 && 'Could be better'}
              {rating === 3 && 'It was okay'}
              {rating === 4 && 'Really good! 👍'}
              {rating === 5 && 'Absolutely delicious! 🤤'}
            </span>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
