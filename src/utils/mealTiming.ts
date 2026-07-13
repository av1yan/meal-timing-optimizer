export const MEAL_INTERVALS = {
  breakfast: { min: 8, max: 12 },
  lunch: { min: 4, max: 5 },
  dinner: { min: 4, max: 6 },
};

export function getHourOfDay(timestamp: number): number {
  return new Date(timestamp).getHours();
}

export function calculateNextMealTime(lastMealTime: number): {
  suggestedTime: number;
  minTime: number;
  maxTime: number;
} {
  const now = Date.now();
  const msSinceLastMeal = now - lastMealTime;
  const hoursSinceLastMeal = msSinceLastMeal / (1000 * 60 * 60);

  // Base interval: 3-4 hours
  const minInterval = 3;
  const maxInterval = 4;

  const minReadyTime = lastMealTime + minInterval * 60 * 60 * 1000;
  const maxReadyTime = lastMealTime + maxInterval * 60 * 60 * 1000;
  const suggestedTime = lastMealTime + 3.5 * 60 * 60 * 1000;

  return {
    suggestedTime,
    minTime: minReadyTime,
    maxTime: maxReadyTime,
  };
}

export function getNextMealName(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Lunch';
  if (hour >= 12 && hour < 17) return 'Snack';
  if (hour >= 17 && hour < 21) return 'Dinner';
  return 'Next Meal';
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getTimeUntil(targetTime: number): string {
  const now = Date.now();
  const diff = targetTime - now;

  if (diff < 0) return 'Ready now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function getNotificationTriggerSeconds(targetTime: number): number {
  const now = Date.now();
  const diff = targetTime - now;
  return Math.max(1, Math.floor(diff / 1000)); // At least 1 second
}
