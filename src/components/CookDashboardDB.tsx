import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChefHat, Bell, Settings, Camera } from 'lucide-react';
import { useMyMeals, MealWithCook } from '@/hooks/useMeals';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload, AvatarUpload } from '@/components/ImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function CookDashboardDB() {
  const { meals, loading: mealsLoading, addMeal } = useMyMeals();
  const { orders, updateOrderStatus } = useOrders();
  const { user, profile, refetchProfile } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [formData, setFormData] = useState({
    dishName: '',
    description: '',
    price: '',
    portions: '',
    imageUrl: '',
  });

  const handleAvatarUpdate = async (url: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Profile picture updated!');
      refetchProfile?.();
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update profile picture');
    }
  };

  // Get orders for this cook's meals
  const myOrders = orders.filter((o) => o.cook_id === user?.id);
  const pendingOrders = myOrders.filter((o) => !['picked_up', 'cancelled'].includes(o.status));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dishName || !formData.price || !formData.portions) return;

    setIsSubmitting(true);

    const success = await addMeal({
      dish_name: formData.dishName,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      total_portions: parseInt(formData.portions),
      image_url: formData.imageUrl || undefined,
    });

    if (success) {
      setFormData({ dishName: '', description: '', price: '', portions: '', imageUrl: '' });
      setIsFormOpen(false);
    }

    setIsSubmitting(false);
  };

  const totalPortionsSold = meals.reduce(
    (sum, m) => sum + (m.total_portions - m.remaining_portions),
    0
  );

  if (mealsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar with upload capability */}
          <AvatarUpload
            currentAvatar={profile?.avatar_url || undefined}
            onUploadComplete={handleAvatarUpdate}
            size="md"
          />
          <div>
            <h2 className="font-display text-2xl text-foreground">My Kitchen</h2>
            <p className="text-sm text-muted-foreground">
              Welcome back, {profile?.display_name || 'Chef'}!
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="h-10 w-10"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-primary hover:bg-primary/90"
          >
            {isFormOpen ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isFormOpen ? 'Cancel' : "Post Today's Menu"}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg">Profile Settings</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <AvatarUpload
                currentAvatar={profile?.avatar_url || undefined}
                onUploadComplete={handleAvatarUpdate}
                size="lg"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                  Click to upload a new photo. JPG, PNG or WebP (max 5MB)
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Active Listings</p>
          <p className="text-2xl font-display text-primary">{meals.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Portions Sold</p>
          <p className="text-2xl font-display text-primary">{totalPortionsSold}</p>
        </div>
      </div>

      {/* New Meal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-xl p-6 space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-5 h-5 text-primary" />
              <h3 className="font-display text-lg">Add New Dish</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dishName">Dish Name *</Label>
                <Input
                  id="dishName"
                  placeholder="Coq au Vin"
                  value={formData.dishName}
                  onChange={(e) => setFormData({ ...formData, dishName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (€) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="12"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="My grandmother's recipe, passed down 3 generations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portions">Portions Available *</Label>
              <Input
                id="portions"
                type="number"
                min="1"
                max="50"
                placeholder="6"
                value={formData.portions}
                onChange={(e) => setFormData({ ...formData, portions: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Dish Photo</Label>
              <ImageUpload
                bucket="meal-images"
                folder="dishes"
                currentImage={formData.imageUrl}
                onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
                aspectRatio="landscape"
                label="Upload a photo of your dish"
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Posting...' : 'Post to Neighbors'}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Pending Orders ({pendingOrders.length})
          </h3>
          <div className="space-y-2">
            {pendingOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{order.dish_name}</p>
                  <p className="text-sm text-muted-foreground">
                    For {order.eater_name} · €{order.price}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Status: <span className="capitalize">{order.status}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {order.status === 'placed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'packing')}
                    >
                      Start Packing
                    </Button>
                  )}
                  {order.status === 'packing' && (
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Notify Ready
                    </Button>
                  )}
                  {order.status === 'ready' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateOrderStatus(order.id, 'picked_up')}
                    >
                      Mark Picked Up
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* My Listings */}
      <div className="space-y-3">
        <h3 className="font-display text-lg text-foreground">My Listings</h3>
        {meals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground bg-card border border-border rounded-xl">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active listings</p>
            <p className="text-sm">Post your first dish to get started!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((meal, index) => (
              <ActiveListingCardDB key={meal.id} meal={meal} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveListingCardDB({ meal, index }: { meal: MealWithCook; index: number }) {
  const isSoldOut = meal.remaining_portions <= 0;
  const soldCount = meal.total_portions - meal.remaining_portions;
  // Progress bar shows remaining inventory: 100% when full, depletes as portions are sold
  const remainingPercentage = (meal.remaining_portions / meal.total_portions) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-card border border-border rounded-xl p-4 ${isSoldOut ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="font-display text-foreground">{meal.dish_name}</h4>
          {isSoldOut && (
            <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
              Sold Out
            </span>
          )}
        </div>
        <span className="font-semibold text-primary">€{Number(meal.price).toFixed(0)}</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{meal.remaining_portions} remaining</span>
          <span>{soldCount} sold</span>
        </div>
        <Progress
          value={remainingPercentage}
          className={`h-2 ${isSoldOut ? 'bg-muted' : ''}`}
        />
      </div>
    </motion.div>
  );
}
