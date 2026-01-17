import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, Meal } from '@/types/homebite';

interface HomebiteContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => void;
  purchaseMeal: (mealId: string) => boolean;
  currentCook: { id: string; name: string; neighborhood: string };
}

const HomebiteContext = createContext<HomebiteContextType | undefined>(undefined);

// Paris neighborhoods for that local feel
const neighborhoods = ['Le Marais', 'Montmartre', 'Belleville', 'Bastille', 'Saint-Germain'];

// Sample meals for demonstration with personal touch
const initialMeals: Meal[] = [
  {
    id: '1',
    cookId: 'cook1',
    cookName: 'Grandma Marie',
    cookAvatar: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Le Marais',
    dishName: 'Coq au Vin',
    description: 'My grandmother\'s recipe, passed down 3 generations. Made with love and fresh herbs from my windowsill garden 🌿',
    price: 14.50,
    totalPortions: 8,
    remainingPortions: 5,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop',
  },
  {
    id: '2',
    cookId: 'cook2',
    cookName: 'Student Chef Lucas',
    cookAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Belleville',
    dishName: 'Ratatouille Maison',
    description: 'Learning to cook like my mum! Vegetables from the Sunday market. Perfect for a cozy evening 🍅',
    price: 11.00,
    totalPortions: 10,
    remainingPortions: 3,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=600&h=400&fit=crop',
  },
  {
    id: '3',
    cookId: 'cook3',
    cookName: 'Amélie',
    cookAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Montmartre',
    dishName: 'Boeuf Bourguignon',
    description: 'Slow-cooked all afternoon while working from home. My apartment smells amazing! Come get some 😋',
    price: 16.00,
    totalPortions: 6,
    remainingPortions: 0,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=600&h=400&fit=crop',
  },
  {
    id: '4',
    cookId: 'cook4',
    cookName: 'Papa Jean-Pierre',
    cookAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Bastille',
    dishName: 'Quiche Lorraine',
    description: 'Kids are visiting this weekend so I made extra! Buttery crust, smoky bacon, real Gruyère 🥧',
    price: 9.50,
    totalPortions: 12,
    remainingPortions: 8,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-4f419b5c1f74?w=600&h=400&fit=crop',
  },
];

export function HomebiteProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('eater');
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  
  const currentCook = { id: 'user', name: 'You', neighborhood: 'Le Marais' };

  const addMeal = (mealData: Omit<Meal, 'id' | 'createdAt'>) => {
    const newMeal: Meal = {
      ...mealData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setMeals(prev => [newMeal, ...prev]);
  };

  const purchaseMeal = (mealId: string): boolean => {
    const meal = meals.find(m => m.id === mealId);
    if (!meal || meal.remainingPortions <= 0) return false;

    setMeals(prev =>
      prev.map(m =>
        m.id === mealId
          ? { ...m, remainingPortions: m.remainingPortions - 1 }
          : m
      )
    );
    return true;
  };

  return (
    <HomebiteContext.Provider
      value={{ role, setRole, meals, addMeal, purchaseMeal, currentCook }}
    >
      {children}
    </HomebiteContext.Provider>
  );
}

export function useHomebite() {
  const context = useContext(HomebiteContext);
  if (!context) {
    throw new Error('useHomebite must be used within a HomebiteProvider');
  }
  return context;
}
