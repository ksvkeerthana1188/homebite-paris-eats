import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Package, MapPin, Check, X } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { BottomNav } from '@/components/BottomNav';
import { Skeleton } from '@/components/ui/skeleton';
import { getFlag } from '@/lib/nationalities';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const statusConfig = {
  placed: { icon: Clock, label: 'Order Placed', color: 'text-muted-foreground' },
  packing: { icon: Package, label: 'Cooking', color: 'text-primary' },
  ready: { icon: MapPin, label: 'Ready for Pickup', color: 'text-primary' },
  picked_up: { icon: Check, label: 'Completed', color: 'text-primary' },
  cancelled: { icon: X, label: 'Cancelled', color: 'text-destructive' },
};

export default function Orders() {
  const navigate = useNavigate();
  const { orders, loading } = useOrders();
  const { user } = useAuth();
  const [nationalities, setNationalities] = useState<Record<string, string>>({});

  // Fetch nationalities for all cooks
  useEffect(() => {
    const fetchNationalities = async () => {
      const cookIds = [...new Set(orders.map(o => o.cook_id))];
      if (cookIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('user_id, nationality' as any)
        .in('user_id', cookIds);

      const map: Record<string, string> = {};
      ((data as any[]) || []).forEach(p => {
        if (p.nationality) map[p.user_id] = p.nationality;
      });
      setNationalities(map);
    };

    fetchNationalities();
  }, [orders]);

  const myOrders = orders.filter(o => o.eater_id === user?.id);
  const activeOrders = myOrders.filter(o => !['picked_up', 'cancelled'].includes(o.status));
  const pastOrders = myOrders.filter(o => ['picked_up', 'cancelled'].includes(o.status));

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4 h-14 flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display text-lg">My Orders</h1>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display text-lg">My Orders</h1>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-lg">
        {myOrders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-2">No orders yet</p>
            <button
              onClick={() => navigate('/')}
              className="text-primary hover:underline text-sm"
            >
              Browse home-cooked meals
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg text-foreground">Active</h2>
                {activeOrders.map((order, index) => {
                  const status = statusConfig[order.status];
                  const Icon = status.icon;
                  const nationality = nationalities[order.cook_id];

                  return (
                    <motion.button
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="w-full bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{order.dish_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            {nationality && <span>{getFlag(nationality)}</span>}
                            {order.cook_name}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          €{order.price}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 mt-3 text-sm ${status.color}`}>
                        <Icon className="w-4 h-4" />
                        <span className="font-medium">{status.label}</span>
                        {order.status === 'packing' && (
                          <span className="animate-pulse">•••</span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-display text-lg text-foreground">Past Orders</h2>
                {pastOrders.map((order, index) => {
                  const status = statusConfig[order.status];
                  const Icon = status.icon;
                  const nationality = nationalities[order.cook_id];

                  return (
                    <motion.button
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="w-full bg-card border border-border rounded-xl p-4 text-left opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{order.dish_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            {nationality && <span>{getFlag(nationality)}</span>}
                            {order.cook_name}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          €{order.price}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 mt-3 text-sm ${status.color}`}>
                        <Icon className="w-4 h-4" />
                        <span>{status.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
