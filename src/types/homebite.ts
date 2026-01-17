export type UserRole = 'cook' | 'eater';

export interface Meal {
  id: string;
  cookId: string;
  cookName: string;
  cookAvatar?: string;
  neighborhood: string;
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
  avatar?: string;
  neighborhood: string;
  rating: number;
}
