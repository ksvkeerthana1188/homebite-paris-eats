import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChefHat, TrendingUp } from 'lucide-react';
import { useHomebite } from '@/context/HomebiteContext';
import { ActiveListingCard } from './ActiveListingCard';
import { toast } from '@/hooks/use-toast';

export function CookDashboard() {
  const { meals, addMeal, currentCook } = useHomebite();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    dishName: '',
    description: '',
    price: '',
    totalPortions: '',
  });

  const myMeals = meals.filter(m => m.cookId === currentCook.id);
  const totalPortionsSold = myMeals.reduce(
    (acc, m) => acc + (m.totalPortions - m.remainingPortions),
    0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const price = parseFloat(formData.price);
    const portions = parseInt(formData.totalPortions);

    if (!formData.dishName || !formData.description || isNaN(price) || isNaN(portions)) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to post a meal.",
        variant: "destructive",
      });
      return;
    }

    addMeal({
      cookId: currentCook.id,
      cookName: currentCook.name,
      dishName: formData.dishName,
      description: formData.description,
      price,
      totalPortions: portions,
      remainingPortions: portions,
    });

    setFormData({ dishName: '', description: '', price: '', totalPortions: '' });
    setIsFormOpen(false);
    
    toast({
      title: "Menu posted! 🎉",
      description: `${formData.dishName} is now live for hungry neighbors.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-display font-semibold text-foreground">
            Your Kitchen
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage your daily menu and track orders
          </p>
        </div>
        
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-terracotta-dark transition-colors active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Post Today's Menu
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-sage-dark" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{myMeals.length}</p>
              <p className="text-sm text-muted-foreground">Active Listings</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-terracotta-dark" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{totalPortionsSold}</p>
              <p className="text-sm text-muted-foreground">Portions Sold</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Meal Form */}
      {isFormOpen && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <h3 className="text-lg font-display font-semibold text-foreground">
            Add Menu of the Day
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Dish Name</label>
              <input
                type="text"
                value={formData.dishName}
                onChange={e => setFormData({ ...formData, dishName: e.target.value })}
                placeholder="e.g., Coq au Vin"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price (€)</label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="14.50"
                className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your dish, ingredients, and what makes it special..."
              rows={3}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Total Portions Available</label>
            <input
              type="number"
              min="1"
              value={formData.totalPortions}
              onChange={e => setFormData({ ...formData, totalPortions: e.target.value })}
              placeholder="8"
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-5 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-terracotta-dark transition-colors"
            >
              Post Menu
            </button>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-5 py-3 bg-muted text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      {/* Active Listings */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-semibold text-foreground">
          Active Listings
        </h3>
        
        {myMeals.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {myMeals.map((meal, index) => (
              <ActiveListingCard key={meal.id} meal={meal} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-card border border-dashed border-border rounded-xl"
          >
            <span className="text-5xl mb-4 block">👨‍🍳</span>
            <h4 className="text-lg font-display text-foreground mb-2">
              No active listings
            </h4>
            <p className="text-muted-foreground">
              Post your first menu to start receiving orders!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
