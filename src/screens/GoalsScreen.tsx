import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealStore } from '@/store/mealStore';

interface Goal {
  dailyMeals: number;
  minHoursBetween: number;
  maxHoursBetween: number;
}

const DEFAULT_GOAL: Goal = {
  dailyMeals: 3,
  minHoursBetween: 3,
  maxHoursBetween: 5,
};

const GOAL_STORAGE_KEY = 'mealGoals';

interface GoalsScreenProps {
  onNavigateBack: () => void;
}

export default function GoalsScreen({ onNavigateBack }: GoalsScreenProps) {
  const { getMealsForToday } = useMealStore();
  const [goal, setGoal] = useState<Goal>(DEFAULT_GOAL);
  const [todayMeals, setTodayMeals] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadGoal();
    updateTodayMeals();
  }, []);

  const loadGoal = async () => {
    try {
      const stored = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
      if (stored) {
        setGoal(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const updateTodayMeals = () => {
    const meals = getMealsForToday();
    setTodayMeals(meals.length);
    setProgress(Math.min(100, (meals.length / goal.dailyMeals) * 100));
  };

  const saveGoal = async (newGoal: Goal) => {
    try {
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(newGoal));
      setGoal(newGoal);
      updateTodayMeals();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const updateDailyMeals = (value: string) => {
    const num = parseInt(value) || 0;
    if (num > 0 && num <= 10) {
      saveGoal({ ...goal, dailyMeals: num });
    }
  };

  const updateMinHours = (value: string) => {
    const num = parseInt(value) || 0;
    if (num > 0 && num < goal.maxHoursBetween) {
      saveGoal({ ...goal, minHoursBetween: num });
    }
  };

  const updateMaxHours = (value: string) => {
    const num = parseInt(value) || 0;
    if (num > goal.minHoursBetween && num <= 12) {
      saveGoal({ ...goal, maxHoursBetween: num });
    }
  };

  const resetGoal = () => {
    saveGoal(DEFAULT_GOAL);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meal Goals</Text>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressContent}>
              <Text style={styles.progressMeals}>{todayMeals}</Text>
              <Text style={styles.progressLabel}>of {goal.dailyMeals} meals</Text>
            </View>
            <View style={styles.progressRing}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e0e0e0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="8"
                  strokeDasharray={`${(progress / 100) * 283} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <Text style={styles.percentText}>{Math.round(progress)}%</Text>
            </View>
          </View>
        </View>

        {/* Daily Meal Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Meal Target</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>How many meals per day?</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={goal.dailyMeals.toString()}
                onChangeText={updateDailyMeals}
                keyboardType="number-pad"
                maxLength="2"
              />
              <Text style={styles.inputUnit}>meals/day</Text>
            </View>
            <Text style={styles.hint}>
              {goal.dailyMeals === 3
                ? '🥗 Standard 3 meals a day'
                : goal.dailyMeals === 4
                ? '🍽️ 4 meals with snack'
                : goal.dailyMeals === 2
                ? '⏱️ Intermittent fasting (2 meals)'}
            </Text>
          </View>
        </View>

        {/* Meal Interval Goal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ideal Meal Interval</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalLabel}>Hours between meals</Text>

            <View style={styles.rangeContainer}>
              <View style={styles.rangeInput}>
                <Text style={styles.rangeLabel}>Minimum</Text>
                <TextInput
                  style={styles.input}
                  value={goal.minHoursBetween.toString()}
                  onChangeText={updateMinHours}
                  keyboardType="number-pad"
                  maxLength="2"
                />
                <Text style={styles.inputUnit}>hours</Text>
              </View>

              <Text style={styles.rangeSymbol}>→</Text>

              <View style={styles.rangeInput}>
                <Text style={styles.rangeLabel}>Maximum</Text>
                <TextInput
                  style={styles.input}
                  value={goal.maxHoursBetween.toString()}
                  onChangeText={updateMaxHours}
                  keyboardType="number-pad"
                  maxLength="2"
                />
                <Text style={styles.inputUnit}>hours</Text>
              </View>
            </View>

            <Text style={styles.hint}>
              Ideal window: {goal.minHoursBetween}-{goal.maxHoursBetween} hours between meals
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tips</Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              • Standard eating: 3 meals, 4-5 hours apart
            </Text>
            <Text style={styles.tipText}>
              • Snacking: 4-5 meals, 2-3 hours apart
            </Text>
            <Text style={styles.tipText}>
              • Intermittent fasting: 2 meals, 8+ hours apart
            </Text>
            <Text style={styles.tipText}>
              • Adjust based on your energy and schedule
            </Text>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={styles.resetButton} onPress={resetGoal}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContent: {
    flex: 1,
  },
  progressMeals: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4CAF50',
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  progressRing: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  percentText: {
    position: 'absolute',
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  goalCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 14,
    color: '#888',
    marginLeft: 12,
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rangeInput: {
    flex: 1,
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  rangeSymbol: {
    fontSize: 16,
    color: '#ccc',
    marginHorizontal: 12,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  tipBox: {
    backgroundColor: '#fff8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});
