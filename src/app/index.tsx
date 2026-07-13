import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMealStore, loadMeals } from '@/store/mealStore';
import TodayScreen from '@/screens/TodayScreen';
import MealLogScreen from '@/screens/MealLogScreen';
import WeeklyStatsScreen from '@/screens/WeeklyStatsScreen';
import RemindersScreen from '@/screens/RemindersScreen';

type Screen = 'today' | 'log' | 'stats' | 'reminders';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('today');
  const [isLoading, setIsLoading] = useState(true);
  const { getMealsForToday } = useMealStore();

  useEffect(() => {
    const initializeMeals = async () => {
      await loadMeals();
      setIsLoading(false);
    };
    initializeMeals();
  }, []);

  const handleMealLogged = () => {
    setCurrentScreen('today');
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {currentScreen === 'today' ? (
        <TodayScreen
          onNavigateToLog={() => setCurrentScreen('log')}
          onNavigateToStats={() => setCurrentScreen('stats')}
          onNavigateToReminders={() => setCurrentScreen('reminders')}
        />
      ) : currentScreen === 'log' ? (
        <MealLogScreen onMealLogged={handleMealLogged} />
      ) : currentScreen === 'stats' ? (
        <WeeklyStatsScreen onNavigateBack={() => setCurrentScreen('today')} />
      ) : (
        <RemindersScreen onNavigateBack={() => setCurrentScreen('today')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
