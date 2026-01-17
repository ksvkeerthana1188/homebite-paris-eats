export type UserRole = 'cook' | 'eater';

export interface Meal {
  id: string;
  cookId: string;
  cookName: string;
  dishName: string;
  description: string;
  price: number;
  totalPortions: number;
  remainingPortions: number;
  createdAt: Date;
  imageUrl?: string;
}

export interface Cook {
  id: string;
  name: string;
  neighborhood: string;
  rating: number;
}
