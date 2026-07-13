export interface Meal {
  id: string;
  timestamp: number;
  energyLevel?: 'low' | 'medium' | 'high';
}

export interface MealStore {
  meals: Meal[];
  addMeal: (meal: Meal) => void;
  getMealsForToday: () => Meal[];
  clearOldMeals: () => void;
}
