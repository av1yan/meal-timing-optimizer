import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Meal, MealStore } from '@/types';

const STORAGE_KEY = 'meals';

interface ReminderSettings {
  enabled: boolean;
  minutesBefore: number[];
}

const DEFAULT_REMINDERS: ReminderSettings = {
  enabled: true,
  minutesBefore: [30, 5],
};

const REMINDER_STORAGE_KEY = 'reminderSettings';

export const useMealStore = create<MealStore>((set, get) => ({
  meals: [],

  addMeal: async (meal: Meal) => {
    const currentMeals = get().meals;
    const updatedMeals = [...currentMeals, meal];
    set({ meals: updatedMeals });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMeals));
    } catch (error) {
      console.error('Failed to save meal:', error);
    }
  },

  getMealsForToday: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const tomorrow = new Date(todayTimestamp);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return get().meals.filter(
      (meal) => meal.timestamp >= todayTimestamp && meal.timestamp < tomorrow.getTime()
    );
  },

  clearOldMeals: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const recentMeals = get().meals.filter((meal) => meal.timestamp >= todayTimestamp);
    set({ meals: recentMeals });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recentMeals));
    } catch (error) {
      console.error('Failed to clear old meals:', error);
    }
  },
}));

export async function loadMeals() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const meals = JSON.parse(stored);
      useMealStore.setState({ meals });
    }
  } catch (error) {
    console.error('Failed to load meals:', error);
  }
}
