export interface Meal {
  id: string;
  timestamp: number;
  energyLevel?: 'low' | 'medium' | 'high';
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'bad';
}

export interface MealStore {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  getMealsForToday: () => Meal[];
  clearOldMeals: () => void;
}
