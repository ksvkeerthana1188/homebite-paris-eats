import { motion, AnimatePresence } from 'framer-motion';
import { Home, ChefHat, ShoppingBag, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrders, OrderWithDetails } from '@/hooks/useOrders';

interface BottomNavProps {
  onOrderClick?: (order: OrderWithDetails) => void;
}

export function BottomNav({ onOrderClick }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role } = useAuth();
  const { orders } = useOrders();

  // Get user's active orders
  const activeOrder = orders.find(
    (o) => o.eater_id === user?.id && !['picked_up', 'cancelled'].includes(o.status)
  );

  const navItems = [
    { key: 'home', label: 'Home', icon: Home, path: '/' },
    { key: 'orders', label: 'Orders', icon: ShoppingBag, path: '/orders' },
    ...(role === 'cook' ? [{ key: 'kitchen', label: 'Kitchen', icon: ChefHat, path: '/' }] : []),
    { key: 'profile', label: 'Profile', icon: User, path: user ? '/' : '/auth' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Active Order Status Bar */}
      <AnimatePresence>
        {activeOrder && onOrderClick && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => onOrderClick(activeOrder)}
            className="w-full bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-2 h-2 bg-primary-foreground rounded-full animate-ping absolute" />
                <div className="w-2 h-2 bg-primary-foreground rounded-full relative" />
              </div>
              <span className="text-sm font-medium">
                {activeOrder.status === 'placed' && `${activeOrder.cook_name} received your order...`}
                {activeOrder.status === 'packing' && `${activeOrder.cook_name} is cooking...`}
                {activeOrder.status === 'ready' && `Ready for pickup! 🎉`}
              </span>
            </div>
            <span className="text-xs opacity-80">View</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="bg-card border-t border-border px-4 py-2 pb-safe">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.path)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
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
