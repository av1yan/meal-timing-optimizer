import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMealStore, loadMeals } from '@/store/mealStore';
import { useThemeStore } from '@/store/themeStore';
import { getTheme } from '@/utils/themes';
import TodayScreen from '@/screens/TodayScreen';
import MealLogScreen from '@/screens/MealLogScreen';
import WeeklyStatsScreen from '@/screens/WeeklyStatsScreen';
import RemindersScreen from '@/screens/RemindersScreen';
import GoalsScreen from '@/screens/GoalsScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import FastingScreen from '@/screens/FastingScreen';
import CalendarScreen from '@/screens/CalendarScreen';

type Screen = 'today' | 'log' | 'stats' | 'reminders' | 'goals' | 'history' | 'fasting' | 'calendar';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('today');
  const [isLoading, setIsLoading] = useState(true);
  const { getMealsForToday } = useMealStore();
  const { isDark, initTheme } = useThemeStore();
  const theme = getTheme(isDark);

  useEffect(() => {
    const initializeApp = async () => {
      await loadMeals();
      await initTheme();
      setIsLoading(false);
    };
    initializeApp();
  }, [initTheme]);

  const handleMealLogged = () => {
    setCurrentScreen('today');
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {currentScreen === 'today' ? (
        <TodayScreen
          onNavigateToLog={() => setCurrentScreen('log')}
          onNavigateToStats={() => setCurrentScreen('stats')}
          onNavigateToReminders={() => setCurrentScreen('reminders')}
          onNavigateToGoals={() => setCurrentScreen('goals')}
          onNavigateToHistory={() => setCurrentScreen('history')}
          onNavigateToFasting={() => setCurrentScreen('fasting')}
          onNavigateToCalendar={() => setCurrentScreen('calendar')}
        />
      ) : currentScreen === 'log' ? (
        <MealLogScreen onMealLogged={handleMealLogged} />
      ) : currentScreen === 'stats' ? (
        <WeeklyStatsScreen onNavigateBack={() => setCurrentScreen('today')} />
      ) : currentScreen === 'reminders' ? (
        <RemindersScreen onNavigateBack={() => setCurrentScreen('today')} />
      ) : currentScreen === 'goals' ? (
        <GoalsScreen onNavigateBack={() => setCurrentScreen('today')} />
      ) : currentScreen === 'history' ? (
        <HistoryScreen onNavigateBack={() => setCurrentScreen('today')} />
      ) : currentScreen === 'fasting' ? (
        <FastingScreen onNavigateBack={() => setCurrentScreen('today')} />
      ) : (
        <CalendarScreen onNavigateBack={() => setCurrentScreen('today')} />
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
