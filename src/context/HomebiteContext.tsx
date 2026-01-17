import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, Meal } from '@/types/homebite';

interface HomebiteContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  meals: Meal[];
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => void;
  purchaseMeal: (mealId: string) => boolean;
  currentCook: { id: string; name: string };
}

const HomebiteContext = createContext<HomebiteContextType | undefined>(undefined);

// Sample meals for demonstration
const initialMeals: Meal[] = [
  {
    id: '1',
    cookId: 'cook1',
    cookName: 'Marie Dubois',
    dishName: 'Coq au Vin',
    description: 'Classic French braised chicken in red wine with mushrooms, pearl onions, and fresh herbs from my garden.',
    price: 14.50,
    totalPortions: 8,
    remainingPortions: 5,
    createdAt: new Date(),
  },
  {
    id: '2',
    cookId: 'cook2',
    cookName: 'Jean-Pierre Martin',
    dishName: 'Ratatouille Provençale',
    description: 'Layered summer vegetables slow-roasted with olive oil, garlic, and herbes de Provence.',
    price: 11.00,
    totalPortions: 10,
    remainingPortions: 3,
    createdAt: new Date(),
  },
  {
    id: '3',
    cookId: 'cook3',
    cookName: 'Amélie Rousseau',
    dishName: 'Boeuf Bourguignon',
    description: 'Tender beef stewed in Burgundy wine with carrots, potatoes, and crispy lardons.',
    price: 16.00,
    totalPortions: 6,
    remainingPortions: 0,
    createdAt: new Date(),
  },
  {
    id: '4',
    cookId: 'user',
    cookName: 'You',
    dishName: 'Quiche Lorraine',
    description: 'Buttery shortcrust filled with bacon, Gruyère cheese, and a silky egg custard.',
    price: 9.50,
    totalPortions: 12,
    remainingPortions: 8,
    createdAt: new Date(),
  },
];

export function HomebiteProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('eater');
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  
  const currentCook = { id: 'user', name: 'You' };

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
