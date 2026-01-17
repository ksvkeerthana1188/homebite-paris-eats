import { motion } from 'framer-motion';
import { Check, Package, Clock, MapPin } from 'lucide-react';

type OrderStatus = 'placed' | 'packing' | 'ready' | 'picked_up' | 'cancelled';

interface OrderStatusBarProps {
  status: OrderStatus;
  cookName: string;
}

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: Clock },
  { key: 'packing', label: 'Packing', icon: Package },
  { key: 'ready', label: 'Ready for Pickup', icon: MapPin },
];

export function OrderStatusBar({ status, cookName }: OrderStatusBarProps) {
  const currentIndex = statusSteps.findIndex((s) => s.key === status);
  const isReady = status === 'ready';
  const isPickedUp = status === 'picked_up';

  if (status === 'cancelled') {
    return (
      <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
        Order cancelled
      </div>
    );
  }

  if (isPickedUp) {
    return (
      <div className="bg-primary/10 text-primary px-4 py-3 rounded-lg text-sm flex items-center gap-2">
        <Check className="w-4 h-4" />
        Order completed! Enjoy your meal 🍽️
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        {statusSteps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center relative">
              {/* Connector line */}
              {index > 0 && (
                <div
                  className={`absolute left-0 top-4 w-full h-0.5 -translate-x-1/2 ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                  style={{ width: '100%', left: '-50%' }}
                />
              )}

              {/* Step circle */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted || isCurrent ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                }}
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                  isCurrent && isReady ? 'animate-pulse' : ''
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isCompleted || isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}
                />
              </motion.div>

              {/* Label */}
              <span
                className={`text-xs mt-2 text-center ${
                  isCurrent ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status message */}
      <div className="text-center text-sm text-muted-foreground">
        {status === 'placed' && `${cookName} received your order`}
        {status === 'packing' && `${cookName} is packing your meal...`}
        {status === 'ready' && (
          <span className="text-primary font-medium">
            🎉 {cookName}'s meal is ready for pickup!
          </span>
        )}
      </div>
    </div>
  );
}
