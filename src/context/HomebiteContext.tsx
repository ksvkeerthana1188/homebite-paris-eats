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

// Sample meals with personal touch and distance
const initialMeals: Meal[] = [
  {
    id: '1',
    cookId: 'cook1',
    cookName: 'Grandma Marie',
    cookAvatar: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Le Marais',
    distance: '350m',
    dishName: 'Coq au Vin',
    description: 'My grandmother\'s recipe, passed down 3 generations.',
    price: 15,
    totalPortions: 8,
    remainingPortions: 5,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&h=200&fit=crop',
  },
  {
    id: '2',
    cookId: 'cook2',
    cookName: 'Student Theo',
    cookAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Latin Quarter',
    distance: '180m',
    dishName: 'Classic Croque Monsieur',
    description: 'Crispy, cheesy, and made with love between classes!',
    price: 7,
    totalPortions: 4,
    remainingPortions: 4,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop',
  },
  {
    id: '3',
    cookId: 'cook3',
    cookName: 'Tante Amélie',
    cookAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Montmartre',
    distance: '450m',
    dishName: 'Homemade Quiche aux Poireaux',
    description: 'Buttery crust with fresh leeks from the market.',
    price: 9,
    totalPortions: 6,
    remainingPortions: 2,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1608039829572-4f419b5c1f74?w=200&h=200&fit=crop',
  },
  {
    id: '4',
    cookId: 'cook4',
    cookName: 'Chef in Training Marc',
    cookAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Le Marais',
    distance: '220m',
    dishName: 'Duck Confit with Sarladaise Potatoes',
    description: 'Practicing for my culinary exam. You be the judge!',
    price: 18,
    totalPortions: 6,
    remainingPortions: 6,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=200&h=200&fit=crop',
  },
  {
    id: '5',
    cookId: 'cook5',
    cookName: 'Grandmère Odette',
    cookAvatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Saint-Germain',
    distance: '800m',
    dishName: 'Slow-cooked Cassoulet',
    description: 'A taste of Toulouse, simmered all morning.',
    price: 15,
    totalPortions: 8,
    remainingPortions: 0,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=200&h=200&fit=crop',
  },
  {
    id: '6',
    cookId: 'cook6',
    cookName: 'Yasmine\'s Kitchen',
    cookAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Belleville',
    distance: '650m',
    dishName: 'Authentic Vegetable Couscous',
    description: 'My mom\'s recipe from Marrakech. Vegetarian & full of spices!',
    price: 12,
    totalPortions: 10,
    remainingPortions: 10,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop',
  },
  {
    id: '7',
    cookId: 'cook7',
    cookName: 'Papa Jean-Pierre',
    cookAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Bastille',
    distance: '1.1km',
    dishName: 'Boeuf Bourguignon',
    description: 'Sunday tradition. Rich, hearty, and perfect for sharing.',
    price: 16,
    totalPortions: 6,
    remainingPortions: 3,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=200&fit=crop',
  },
  {
    id: '8',
    cookId: 'cook8',
    cookName: 'Student Lucas',
    cookAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Belleville',
    distance: '290m',
    dishName: 'Ratatouille Maison',
    description: 'Learning to cook like my mum! Fresh market veggies.',
    price: 11,
    totalPortions: 10,
    remainingPortions: 3,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1572453800999-e8d2d1589b7c?w=200&h=200&fit=crop',
  },
  {
    id: '9',
    cookId: 'cook9',
    cookName: 'Mémé Claudine',
    cookAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    neighborhood: 'Batignolles',
    distance: '950m',
    dishName: 'Pot-au-Feu',
    description: 'Old-fashioned French comfort. Come warm up!',
    price: 14,
    totalPortions: 5,
    remainingPortions: 0,
    createdAt: new Date(),
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop',
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
