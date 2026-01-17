import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

type OrderStatus = 'placed' | 'packing' | 'ready' | 'picked_up' | 'cancelled';

export interface OrderWithDetails {
  id: string;
  meal_id: string;
  eater_id: string;
  cook_id: string;
  status: OrderStatus;
  created_at: string;
  dish_name: string;
  cook_name: string;
  eater_name: string;
  price: number;
}

export function useOrders() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch related data
      const mealIds = [...new Set(ordersData?.map((o) => o.meal_id) || [])];
      const userIds = [
        ...new Set([
          ...(ordersData?.map((o) => o.eater_id) || []),
          ...(ordersData?.map((o) => o.cook_id) || []),
        ]),
      ];

      const { data: mealsData } = await supabase
        .from('meals')
        .select('id, dish_name, price')
        .in('id', mealIds);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', userIds);

      const mealMap = new Map(mealsData?.map((m) => [m.id, m]) || []);
      const profileMap = new Map(profilesData?.map((p) => [p.user_id, p]) || []);

      const ordersWithDetails: OrderWithDetails[] = (ordersData || []).map((order) => {
        const meal = mealMap.get(order.meal_id);
        const cookProfile = profileMap.get(order.cook_id);
        const eaterProfile = profileMap.get(order.eater_id);

        return {
          ...order,
          status: order.status as OrderStatus,
          dish_name: meal?.dish_name || 'Unknown dish',
          price: meal?.price || 0,
          cook_name: cookProfile?.display_name || 'Cook',
          eater_name: eaterProfile?.display_name || 'Customer',
        };
      });

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const placeOrder = async (mealId: string): Promise<string | null> => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to place an order.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('place_order', {
        p_meal_id: mealId,
      });

      if (error) {
        if (error.message.includes('No portions remaining')) {
          toast({
            title: 'Sold out! 😢',
            description: 'This dish just sold out.',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return null;
      }

      toast({
        title: 'Order placed! 🎉',
        description: 'Your neighbor is preparing your meal.',
      });

      return data as string;
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: 'Order failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      const statusMessages: Record<OrderStatus, string> = {
        placed: 'Order placed',
        packing: 'Packing in progress',
        ready: 'Ready for pickup!',
        picked_up: 'Order completed',
        cancelled: 'Order cancelled',
      };

      toast({
        title: statusMessages[status],
        description: status === 'ready' ? 'Your neighbor has been notified!' : undefined,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update failed',
        description: 'Could not update order status.',
        variant: 'destructive',
      });
    }
  };

  return { orders, loading, placeOrder, updateOrderStatus, refetch: fetchOrders };
}
