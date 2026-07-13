import { Meal } from '@/types';

export interface WeeklyStats {
  totalMeals: number;
  mealsPerDay: number[];
  averageInterval: number;
  energyBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  earliestMeal: string;
  latestMeal: string;
  consistencyScore: number;
  bestDay: string;
  averageMealTime: string;
}

export function getWeeklyStats(meals: Meal[]): WeeklyStats {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Filter meals from last 7 days
  const weeklyMeals = meals.filter((meal) => new Date(meal.timestamp) >= sevenDaysAgo);

  // Calculate meals per day
  const mealsPerDay: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const dayMeals = weeklyMeals.filter(
      (meal) => new Date(meal.timestamp) >= dayStart && new Date(meal.timestamp) < dayEnd
    );

    mealsPerDay.push(dayMeals.length);
  }

  // Energy breakdown
  const energyBreakdown = {
    low: weeklyMeals.filter((m) => m.energyLevel === 'low').length,
    medium: weeklyMeals.filter((m) => m.energyLevel === 'medium').length,
    high: weeklyMeals.filter((m) => m.energyLevel === 'high').length,
  };

  // Calculate average interval
  let totalInterval = 0;
  let intervalCount = 0;
  for (let i = 1; i < weeklyMeals.length; i++) {
    const interval = weeklyMeals[i].timestamp - weeklyMeals[i - 1].timestamp;
    totalInterval += interval;
    intervalCount++;
  }
  const averageInterval = intervalCount > 0 ? totalInterval / intervalCount / (1000 * 60 * 60) : 0;

  // Earliest and latest meal
  const times = weeklyMeals.map((m) => new Date(m.timestamp).getHours() * 60 + new Date(m.timestamp).getMinutes());
  const earliestMeal = weeklyMeals.length > 0 ? formatMealTime(Math.min(...times)) : 'N/A';
  const latestMeal = weeklyMeals.length > 0 ? formatMealTime(Math.max(...times)) : 'N/A';

  // Consistency score (0-100, based on how consistent meal times are)
  let consistencyScore = 0;
  if (weeklyMeals.length > 0) {
    const avgInterval = averageInterval;
    const variance = calculateIntervalVariance(weeklyMeals);
    consistencyScore = Math.max(0, Math.min(100, 100 - variance * 10));
  }

  // Best day (most meals)
  const bestDayIndex = mealsPerDay.indexOf(Math.max(...mealsPerDay));
  const bestDay = getDayName(6 - bestDayIndex);

  // Average meal time
  const avgTime = times.length > 0 ? times.reduce((a, b) => a + b) / times.length : 0;
  const averageMealTime = formatMealTime(avgTime);

  return {
    totalMeals: weeklyMeals.length,
    mealsPerDay,
    averageInterval: Math.round(averageInterval * 10) / 10,
    energyBreakdown,
    earliestMeal,
    latestMeal,
    consistencyScore: Math.round(consistencyScore),
    bestDay,
    averageMealTime,
  };
}

function calculateIntervalVariance(meals: Meal[]): number {
  if (meals.length < 2) return 0;

  const intervals: number[] = [];
  for (let i = 1; i < meals.length; i++) {
    const interval = (meals[i].timestamp - meals[i - 1].timestamp) / (1000 * 60 * 60);
    intervals.push(interval);
  }

  const avg = intervals.reduce((a, b) => a + b) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervals.length;
  return Math.sqrt(variance);
}

function formatMealTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function getDayName(daysAgo: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return days[date.getDay()];
}

export function getDayLabel(daysAgo: number): string {
  if (daysAgo === 0) return 'Today';
  if (daysAgo === 1) return 'Yesterday';
  return getDayName(daysAgo).slice(0, 3);
}
