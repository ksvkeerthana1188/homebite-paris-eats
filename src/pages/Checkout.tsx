import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import { useMeals, MealWithCook } from '@/hooks/useMeals';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getFlag } from '@/lib/nationalities';
import { supabase } from '@/integrations/supabase/client';

export default function Checkout() {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const { meals, loading: mealsLoading } = useMeals();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cookNationality, setCookNationality] = useState<string | null>(null);

  const meal = meals.find((m) => m.id === mealId);

  useEffect(() => {
    if (meal) {
      // Fetch cook's nationality
      const fetchCookData = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('nationality' as any)
          .eq('user_id', meal.cook_id)
          .maybeSingle();
        setCookNationality((data as any)?.nationality || null);
      };
      fetchCookData();
    }
  }, [meal]);

  const handleCheckout = async () => {
    if (!user || !meal) return;
    
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Place the actual order
    const newOrderId = await placeOrder(meal.id);
    
    if (newOrderId) {
      setOrderId(newOrderId);
      setIsSuccess(true);
    }
    
    setIsProcessing(false);
  };

  if (mealsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Meal not found</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-muted-foreground mb-4">Please sign in to checkout</p>
        <Button onClick={() => navigate('/auth')}>Sign In</Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-6"
        >
          <Check className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h2 className="font-display text-2xl text-foreground mb-2">Order Placed!</h2>
        <p className="text-muted-foreground text-center mb-6">
          {meal.cook_name} has been notified and will start preparing your meal.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
          {orderId && (
            <Button onClick={() => navigate(`/order/${orderId}`)}>
              Track Order
            </Button>
          )}
        </div>
      </div>
    );
  }

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
          <h1 className="font-display text-lg">Checkout</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display text-lg text-foreground mb-4">Order Summary</h2>
          
          <div className="flex items-start gap-4">
            {meal.image_url && (
              <img
                src={meal.image_url}
                alt={meal.dish_name}
                className="w-20 h-20 rounded-xl object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{meal.dish_name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                {cookNationality && (
                  <span className="text-base">{getFlag(cookNationality)}</span>
                )}
                {meal.cook_name}
              </p>
              {cookNationality && (
                <p className="text-xs text-primary/80 italic mt-1">
                  Authentic {cookNationality} recipe
                </p>
              )}
            </div>
            <span className="text-lg font-semibold text-primary">
              €{Number(meal.price).toFixed(2)}
            </span>
          </div>

          <div className="border-t border-border mt-4 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>€{Number(meal.price).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-muted-foreground">Service fee</span>
              <span>€0.00</span>
            </div>
            <div className="flex justify-between font-semibold mt-3 pt-3 border-t border-border">
              <span>Total</span>
              <span className="text-primary">€{Number(meal.price).toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Form (Mock) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg text-foreground">Payment</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="4242 4242 4242 4242"
                defaultValue="4242 4242 4242 4242"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  defaultValue="12/28"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  defaultValue="123"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            <span>Demo mode - no real payment will be processed</span>
          </div>
        </motion.div>

        {/* Reserve Button */}
        <Button
          onClick={handleCheckout}
          disabled={isProcessing || meal.remaining_portions <= 0}
          className="w-full h-12 text-base"
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : meal.remaining_portions <= 0 ? (
            'Sold Out'
          ) : (
            `Reserve for €${Number(meal.price).toFixed(2)}`
          )}
        </Button>
      </main>
    </div>
  );
}
