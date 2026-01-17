import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { HeaderDB } from '@/components/HeaderDB';
import { EaterFeedDB } from '@/components/EaterFeedDB';
import { CookDashboardDB } from '@/components/CookDashboardDB';
import { BottomNav } from '@/components/BottomNav';
import { RatingPopup } from '@/components/RatingPopup';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders, OrderWithDetails } from '@/hooks/useOrders';

function HomebiteContent() {
  const { role, loading, user } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const [ratingOrder, setRatingOrder] = useState<OrderWithDetails | null>(null);

  // Check for recently picked up orders that need rating
  useEffect(() => {
    if (!user) return;
    
    const recentlyPickedUp = orders.find(
      (o) =>
        o.eater_id === user.id &&
        o.status === 'picked_up' &&
        new Date(o.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    );

    // Check if already rated (we'd need to track this - for now, just show once)
    if (recentlyPickedUp && !localStorage.getItem(`rated_${recentlyPickedUp.id}`)) {
      setRatingOrder(recentlyPickedUp);
    }
  }, [orders, user]);

  const handleRatingClose = () => {
    if (ratingOrder) {
      localStorage.setItem(`rated_${ratingOrder.id}`, 'true');
    }
    setRatingOrder(null);
  };

  const handleOrderClick = (order: OrderWithDetails) => {
    navigate(`/order/${order.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 h-14 flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <HeaderDB />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          key={role || 'guest'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {role === 'cook' ? <CookDashboardDB /> : <EaterFeedDB />}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 mb-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 Homebite · Paris, France</p>
            <p className="flex items-center gap-1">
              Made with <span className="text-primary">♥</span> for home cooks
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation */}
      <BottomNav onOrderClick={handleOrderClick} />

      {/* Rating Popup */}
      {ratingOrder && (
        <RatingPopup order={ratingOrder} onClose={handleRatingClose} />
      )}
    </div>
  );
}

const Index = () => {
  return <HomebiteContent />;
};

export default Index;
