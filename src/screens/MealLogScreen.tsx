import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealStore } from '@/store/mealStore';
import { Meal } from '@/types';
import { scheduleNextMealNotification, requestNotificationPermissions } from '@/utils/notifications';

interface MealLogScreenProps {
  onMealLogged: () => void;
}

export default function MealLogScreen({ onMealLogged }: MealLogScreenProps) {
  const { addMeal } = useMealStore();
  const [selectedEnergy, setSelectedEnergy] = useState<'low' | 'medium' | 'high' | null>(null);
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'okay' | 'bad' | null>(null);
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const handleLogMeal = async () => {
    setIsLogging(true);
    try {
      const newMeal: Meal = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        energyLevel: selectedEnergy || undefined,
        mood: selectedMood || undefined,
        notes: notes.trim() || undefined,
      };

      await addMeal(newMeal);

      // Schedule notification for next meal with custom reminders
      const reminderSettings = await AsyncStorage.getItem('reminderSettings');
      const reminders = reminderSettings ? JSON.parse(reminderSettings) : { enabled: true, minutesBefore: [30, 5] };

      if (reminders.enabled) {
        await scheduleNextMealNotification(newMeal.timestamp, reminders.minutesBefore);
      } else {
        await scheduleNextMealNotification(newMeal.timestamp, []);
      }

      Alert.alert('Success', 'Meal logged! 🍽️\nNotification set for your next meal.');
      setSelectedEnergy(null);
      onMealLogged();
    } catch (error) {
      Alert.alert('Error', 'Failed to log meal');
      console.error(error);
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Log a Meal</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Just ate? Great! When did you finish?</Text>
          <Text style={styles.timestamp}>{new Date().toLocaleTimeString()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>How's your energy?</Text>
          <View style={styles.energyButtons}>
            {(['low', 'medium', 'high'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyButton,
                  selectedEnergy === level && styles.energyButtonActive,
                ]}
                onPress={() => setSelectedEnergy(level)}
              >
                <Text
                  style={[
                    styles.energyButtonText,
                    selectedEnergy === level && styles.energyButtonTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hint}>Optional - helps optimize your meal timing</Text>
        </View>

        <TouchableOpacity
          style={[styles.logButton, isLogging && styles.logButtonDisabled]}
          onPress={handleLogMeal}
          disabled={isLogging}
        >
          <Text style={styles.logButtonText}>{isLogging ? 'Logging...' : 'Log Meal'}</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 How it works</Text>
          <Text style={styles.infoText}>
            Log when you finish eating. We'll suggest your next meal based on a 3-4 hour window, adjusted
            for time of day.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
    marginTop: 16,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  energyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  energyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  energyButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  energyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  energyButtonTextActive: {
    color: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  logButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  logButtonDisabled: {
    opacity: 0.6,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f8f0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
