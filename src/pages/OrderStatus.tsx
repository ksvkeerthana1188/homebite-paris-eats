import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Package, Clock, MapPin, ChefHat } from 'lucide-react';
import { useOrders, OrderWithDetails } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { RatingPopup } from '@/components/RatingPopup';
import { getFlag } from '@/lib/nationalities';
import { supabase } from '@/integrations/supabase/client';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: Clock, description: 'Your order has been received' },
  { key: 'packing', label: 'Cooking', icon: ChefHat, description: 'Your meal is being prepared' },
  { key: 'ready', label: 'Ready for Pickup', icon: MapPin, description: 'Your meal is ready!' },
];

export default function OrderStatus() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const { user } = useAuth();
  const [showRating, setShowRating] = useState(false);
  const [cookNationality, setCookNationality] = useState<string | null>(null);

  const order = orders.find((o) => o.id === orderId);

  useEffect(() => {
    if (order) {
      // Fetch cook's nationality
      const fetchCookData = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('nationality' as any)
          .eq('user_id', order.cook_id)
          .maybeSingle();
        setCookNationality((data as any)?.nationality || null);
      };
      fetchCookData();
    }
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Order not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const currentIndex = statusSteps.findIndex((s) => s.key === order.status);
  const isPickedUp = order.status === 'picked_up';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg">Order Status</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="font-display text-xl text-foreground">{order.dish_name}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                {cookNationality && (
                  <span className="text-base">{getFlag(cookNationality)}</span>
                )}
                {order.cook_name}
                {cookNationality && ` · ${cookNationality}`}
              </p>
            </div>
            <span className="text-xl font-semibold text-primary">€{order.price}</span>
          </div>

          {cookNationality && (
            <p className="text-xs text-primary/80 italic mb-2">
              Authentic {cookNationality} recipe
            </p>
          )}
        </motion.div>

        {/* Status */}
        {isCancelled ? (
          <div className="bg-destructive/10 text-destructive px-6 py-8 rounded-2xl text-center">
            <p className="text-lg font-medium">Order Cancelled</p>
            <p className="text-sm mt-2 opacity-80">This order has been cancelled</p>
          </div>
        ) : isPickedUp ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 text-primary px-6 py-8 rounded-2xl text-center"
          >
            <Check className="w-12 h-12 mx-auto mb-3" />
            <p className="text-lg font-medium">Order Completed!</p>
            <p className="text-sm mt-2 opacity-80">Enjoy your meal 🍽️</p>
            
            {!showRating && (
              <Button
                onClick={() => setShowRating(true)}
                variant="outline"
                className="mt-4"
              >
                Rate Your Meal ⭐
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="bg-card border border-border rounded-2xl p-6">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const Icon = step.icon;

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    {/* Step indicator */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor:
                            isCompleted || isCurrent
                              ? 'hsl(var(--primary))'
                              : 'hsl(var(--muted))',
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCurrent ? 'animate-pulse' : ''
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isCompleted || isCurrent
                              ? 'text-primary-foreground'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </motion.div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            isCompleted ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="pt-2 pb-4">
                      <p
                        className={`font-medium ${
                          isCurrent ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      {isCurrent && order.status === 'packing' && (
                        <p className="text-xs text-primary mt-1 animate-pulse">
                          {order.cook_name} is cooking your meal...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ready notification */}
            {order.status === 'ready' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary text-primary-foreground rounded-2xl p-6 text-center"
              >
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="font-display text-lg">Ready for Pickup!</p>
                <p className="text-sm opacity-90 mt-1">
                  Head to {order.cook_name}'s location
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="w-full mt-6"
        >
          Back to Home
        </Button>
      </main>

      {/* Rating Popup */}
      {showRating && (
        <RatingPopup order={order} onClose={() => setShowRating(false)} />
      )}
    </div>
  );
}
