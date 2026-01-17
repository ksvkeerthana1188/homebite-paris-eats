import { motion } from 'framer-motion';
import { useMeals } from '@/hooks/useMeals';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { MealCardDB } from './MealCardDB';
import { OrderStatusBar } from './OrderStatusBar';
import { Skeleton } from '@/components/ui/skeleton';

export function EaterFeedDB() {
  const { meals, loading: mealsLoading } = useMeals();
  const { orders, loading: ordersLoading } = useOrders();
  const { user } = useAuth();

  // Get user's active orders (not picked up or cancelled)
  const activeOrders = orders.filter(
    (o) => o.eater_id === user?.id && !['picked_up', 'cancelled'].includes(o.status)
  );

  if (mealsLoading) {
    return (
      <div className="space-y-0 rounded-xl border border-border overflow-hidden bg-card">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="w-12 h-12 rounded-lg" />
            <Skeleton className="w-12 h-6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <h2 className="font-display text-lg text-foreground">Your Orders</h2>
          {activeOrders.map((order) => (
            <div key={order.id} className="space-y-2">
              <div className="text-sm font-medium text-foreground">
                {order.dish_name}
              </div>
              <OrderStatusBar status={order.status} cookName={order.cook_name} />
            </div>
          ))}
        </motion.div>
      )}

      {/* Meals Feed */}
      <div>
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-foreground">
              Today's Neighborhood Specials
            </h2>
            <span className="text-sm text-muted-foreground">
              {meals.filter((m) => m.remaining_portions > 0).length} available
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Freshly made by your neighbors in Paris.
          </p>
        </div>

        {meals.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg mb-2">No meals posted yet</p>
            <p className="text-sm">Check back soon for home-cooked goodness!</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {meals.map((meal, index) => (
              <MealCardDB key={meal.id} meal={meal} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
