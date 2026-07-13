import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealStore } from '@/store/mealStore';
import { calculateNextMealTime, formatTime, getTimeUntil, getNextMealName } from '@/utils/mealTiming';
import MealEntry from '@/screens/MealEntry';
import { requestNotificationPermissions, scheduleNextMealNotification } from '@/utils/notifications';

interface TodayScreenProps {
  onNavigateToLog: () => void;
  onNavigateToStats: () => void;
  onNavigateToReminders: () => void;
}

export default function TodayScreen({ onNavigateToLog, onNavigateToStats, onNavigateToReminders }: TodayScreenProps) {
  const { getMealsForToday } = useMealStore();
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  const [nextMealInfo, setNextMealInfo] = useState<any>(null);
  const [timeUntil, setTimeUntil] = useState<string>('');

  useEffect(() => {
    const initializeApp = async () => {
      await requestNotificationPermissions();

      const meals = getMealsForToday();
      setTodayMeals(meals);

      if (meals.length > 0) {
        const lastMeal = meals[meals.length - 1];
        const timing = calculateNextMealTime(lastMeal.timestamp);
        setNextMealInfo({
          suggestedTime: timing.suggestedTime,
          minTime: timing.minTime,
          maxTime: timing.maxTime,
          mealName: getNextMealName(new Date(timing.suggestedTime).getHours()),
        });
        setTimeUntil(getTimeUntil(timing.suggestedTime));

        // Reschedule notification in case app was closed
        const reminderSettings = await AsyncStorage.getItem('reminderSettings');
        const reminders = reminderSettings ? JSON.parse(reminderSettings) : { enabled: true, minutesBefore: [30, 5] };

        if (reminders.enabled) {
          await scheduleNextMealNotification(lastMeal.timestamp, reminders.minutesBefore);
        } else {
          await scheduleNextMealNotification(lastMeal.timestamp, []);
        }
      }
    };

    initializeApp();
  }, [todayMeals.length]);

  useEffect(() => {
    if (!nextMealInfo) return;

    const interval = setInterval(() => {
      setTimeUntil(getTimeUntil(nextMealInfo.suggestedTime));
    }, 60000);

    return () => clearInterval(interval);
  }, [nextMealInfo]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Meals</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onNavigateToReminders}
            >
              <Text style={styles.headerButtonText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onNavigateToStats}
            >
              <Text style={styles.headerButtonText}>📊</Text>
            </TouchableOpacity>
          </View>
        </View>

        {todayMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals logged yet</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={onNavigateToLog}>
              <Text style={styles.buttonText}>Log Your First Meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.mealsSection}>
              <Text style={styles.sectionTitle}>Logged Meals</Text>
              {todayMeals.map((meal, index) => (
                <MealEntry key={meal.id} meal={meal} index={index + 1} />
              ))}
            </View>

            {nextMealInfo && (
              <View style={styles.suggestionSection}>
                <Text style={styles.sectionTitle}>Next Meal Suggestion</Text>
                <View style={styles.suggestionCard}>
                  <Text style={styles.mealName}>{nextMealInfo.mealName}</Text>
                  <Text style={styles.suggestedTime}>{formatTime(nextMealInfo.suggestedTime)}</Text>
                  <Text style={styles.timeUntil}>{timeUntil}</Text>

                  <View style={styles.timeRangeContainer}>
                    <Text style={styles.rangeLabel}>Ideal window</Text>
                    <Text style={styles.timeRange}>
                      {formatTime(nextMealInfo.minTime)} - {formatTime(nextMealInfo.maxTime)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.primaryButton} onPress={onNavigateToLog}>
              <Text style={styles.buttonText}>Log Another Meal</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  mealsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  suggestionSection: {
    marginBottom: 32,
  },
  suggestionCard: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  suggestedTime: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  timeUntil: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  timeRangeContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  timeRange: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
