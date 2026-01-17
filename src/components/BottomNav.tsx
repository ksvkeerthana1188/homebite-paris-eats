import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, User, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrders, OrderWithDetails } from '@/hooks/useOrders';
import { getFlag } from '@/lib/nationalities';
import { supabase } from '@/integrations/supabase/client';

interface BottomNavProps {
  onOrderClick?: (order: OrderWithDetails) => void;
}

export function BottomNav({ onOrderClick }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();
  const { orders } = useOrders();
  const [cookNationality, setCookNationality] = useState<string | null>(null);
  const [showReadyNotification, setShowReadyNotification] = useState(false);

  // Get user's active order
  const activeOrder = orders.find(
    (o) => o.eater_id === user?.id && !['picked_up', 'cancelled'].includes(o.status)
  );

  // Fetch cook's nationality when active order changes
  useEffect(() => {
    if (activeOrder) {
      const fetchCookNationality = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('nationality' as any)
          .eq('user_id', activeOrder.cook_id)
          .maybeSingle();
        setCookNationality((data as any)?.nationality || null);
      };
      fetchCookNationality();

      // Show notification when status changes to ready
      if (activeOrder.status === 'ready') {
        setShowReadyNotification(true);
        const timer = setTimeout(() => setShowReadyNotification(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [activeOrder?.id, activeOrder?.status, activeOrder?.cook_id]);

  const navItems = [
    { key: 'home', label: 'Home', icon: Home, path: '/' },
    { key: 'orders', label: 'Orders', icon: ShoppingBag, path: '/orders' },
    { key: 'profile', label: 'Profile', icon: User, path: user ? '/' : '/auth' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleTrackClick = () => {
    if (activeOrder) {
      navigate(`/order/${activeOrder.id}`);
    }
  };

  const getStatusMessage = () => {
    if (!activeOrder) return '';
    
    const flag = cookNationality ? getFlag(cookNationality) : '👩‍🍳';
    const name = activeOrder.cook_name;

    switch (activeOrder.status) {
      case 'placed':
        return `${flag} ${name} received your order`;
      case 'packing':
        return `${flag} ${name} is cooking...`;
      case 'ready':
        return `🎉 Ready for Pickup!`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Ready Notification Toast */}
      <AnimatePresence>
        {showReadyNotification && activeOrder?.status === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute bottom-full left-4 right-4 mb-2 bg-primary text-primary-foreground rounded-xl p-4 shadow-lg"
          >
            <p className="font-medium text-center">
              🎉 Your meal is ready for pickup!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Order Status Bar - Frosted Glass */}
      <AnimatePresence>
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`
              mx-3 mb-2 rounded-2xl overflow-hidden
              backdrop-blur-xl bg-card/80 border border-border/50
              shadow-lg shadow-foreground/5
            `}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Pulsing indicator */}
                <div className="relative flex-shrink-0">
                  <div 
                    className={`w-2.5 h-2.5 rounded-full ${
                      activeOrder.status === 'ready' 
                        ? 'bg-primary' 
                        : 'bg-primary/70'
                    }`}
                  />
                  {activeOrder.status !== 'ready' && (
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  )}
                </div>

                {/* Status text */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    activeOrder.status === 'ready' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {getStatusMessage()}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeOrder.dish_name}
                  </p>
                </div>
              </div>

              {/* Track Button */}
              <button
                onClick={handleTrackClick}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium
                  transition-all active:scale-95
                  ${activeOrder.status === 'ready'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                  }
                `}
              >
                Track
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted">
              <motion.div
                initial={{ width: '0%' }}
                animate={{
                  width: activeOrder.status === 'placed' ? '33%' 
                       : activeOrder.status === 'packing' ? '66%' 
                       : '100%'
                }}
                className="h-full bg-primary transition-all duration-500"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Frosted Glass */}
      <nav className="backdrop-blur-xl bg-card/90 border-t border-border/50 px-4 py-2 pb-safe">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
