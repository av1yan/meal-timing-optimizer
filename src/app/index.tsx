import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useMealStore, loadMeals } from '@/store/mealStore';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { getTheme } from '@/utils/themes';
import TodayScreen from '@/screens/TodayScreen';
import MealLogScreen from '@/screens/MealLogScreen';
import WeeklyStatsScreen from '@/screens/WeeklyStatsScreen';
import RemindersScreen from '@/screens/RemindersScreen';
import GoalsScreen from '@/screens/GoalsScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import FastingScreen from '@/screens/FastingScreen';
import CalendarScreen from '@/screens/CalendarScreen';
import LoginScreen from '@/screens/LoginScreen';
import SignupScreen from '@/screens/SignupScreen';

type Screen = 'today' | 'log' | 'stats' | 'reminders' | 'goals' | 'history' | 'fasting' | 'calendar' | 'login' | 'signup';
type AuthScreen = 'login' | 'signup';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [isLoading, setIsLoading] = useState(true);
  const { getMealsForToday } = useMealStore();
  const { isDark, initTheme } = useThemeStore();
  const { user, initAuth } = useAuthStore();
  const theme = getTheme(isDark);

  useEffect(() => {
    const initializeApp = async () => {
      await initTheme();
      await initAuth();
      await loadMeals();
      setIsLoading(false);
    };
    initializeApp();
  }, [initTheme, initAuth]);

  const handleMealLogged = () => {
    setCurrentScreen('today');
  };

  if (isLoading) {
    return <View style={styles.container} />;
  }

  if (isLoading) {
    return <View style={[styles.container, { backgroundColor: theme.background }]} />;
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {authScreen === 'login' ? (
          <LoginScreen onSignupPress={() => setAuthScreen('signup')} />
        ) : (
          <SignupScreen onLoginPress={() => setAuthScreen('login')} />
        )}
      </View>
    );
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
