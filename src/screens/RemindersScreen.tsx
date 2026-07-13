import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReminderSettings {
  enabled: boolean;
  minutesBefore: number[];
}

const REMINDER_STORAGE_KEY = 'reminderSettings';
const DEFAULT_REMINDERS: ReminderSettings = {
  enabled: true,
  minutesBefore: [30, 5],
};

const REMINDER_OPTIONS = [5, 10, 15, 30, 45, 60];

interface RemindersScreenProps {
  onNavigateBack: () => void;
}

export default function RemindersScreen({ onNavigateBack }: RemindersScreenProps) {
  const [reminders, setReminders] = useState<ReminderSettings>(DEFAULT_REMINDERS);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const saveReminders = async (newReminders: ReminderSettings) => {
    try {
      await AsyncStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  };

  const toggleReminder = (minutes: number) => {
    const newMinutes = reminders.minutesBefore.includes(minutes)
      ? reminders.minutesBefore.filter((m) => m !== minutes)
      : [...reminders.minutesBefore].sort((a, b) => b - a);

    if (!reminders.minutesBefore.includes(minutes)) {
      newMinutes.push(minutes);
      newMinutes.sort((a, b) => b - a);
    }

    saveReminders({ ...reminders, minutesBefore: newMinutes });
  };

  const toggleEnabled = (value: boolean) => {
    saveReminders({ ...reminders, enabled: value });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meal Reminders</Text>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Master Toggle */}
        <View style={styles.toggleSection}>
          <View style={styles.toggleContent}>
            <Text style={styles.toggleLabel}>Enable Reminders</Text>
            <Text style={styles.toggleDescription}>Get notified before your next meal</Text>
          </View>
          <Switch
            value={reminders.enabled}
            onValueChange={toggleEnabled}
            trackColor={{ false: '#767577', true: '#81C784' }}
            thumbColor={reminders.enabled ? '#4CAF50' : '#f4f3f4'}
          />
        </View>

        {reminders.enabled && (
          <>
            {/* How It Works */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  📬 You'll get a notification at your selected time before each meal is due.
                </Text>
                <Text style={styles.infoText}>
                  ⏰ Plus a final alert when it's time to eat.
                </Text>
                <Text style={styles.infoText}>
                  🎯 Example: With 30 min selected, you get a 30-minute warning + meal alert.
                </Text>
              </View>
            </View>

            {/* Reminder Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Remind Me Before Meal</Text>
              <View style={styles.optionsContainer}>
                {REMINDER_OPTIONS.map((minutes) => (
                  <TouchableOpacity
                    key={minutes}
                    style={[
                      styles.option,
                      reminders.minutesBefore.includes(minutes) && styles.optionActive,
                    ]}
                    onPress={() => toggleReminder(minutes)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        reminders.minutesBefore.includes(minutes) && styles.optionTextActive,
                      ]}
                    >
                      {minutes} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Selected Reminders */}
            {reminders.minutesBefore.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Reminders</Text>
                <View style={styles.reminderList}>
                  {reminders.minutesBefore.map((minutes) => (
                    <View key={minutes} style={styles.reminderItem}>
                      <Text style={styles.reminderIcon}>🔔</Text>
                      <View style={styles.reminderContent}>
                        <Text style={styles.reminderTime}>{minutes} minutes before</Text>
                        <Text style={styles.reminderDesc}>
                          {minutes === 60
                            ? 'One hour heads up'
                            : `${minutes} minutes to prepare`}
                        </Text>
                      </View>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
              <View style={styles.tipBox}>
                <Text style={styles.tipText}>
                  • Use a 30-minute reminder to prepare your meal
                </Text>
                <Text style={styles.tipText}>
                  • Use a 5-minute reminder as a final heads-up
                </Text>
                <Text style={styles.tipText}>
                  • Mix and match to find your ideal reminder schedule
                </Text>
              </View>
            </View>
          </>
        )}

        {!reminders.enabled && (
          <View style={styles.section}>
            <View style={styles.disabledBox}>
              <Text style={styles.disabledText}>Reminders are currently disabled</Text>
              <Text style={styles.disabledDesc}>
                Turn on reminders above to get notifications before your meals
              </Text>
            </View>
          </View>
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
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 24,
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#888',
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
  infoBox: {
    backgroundColor: '#f0f8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#4CAF50',
  },
  reminderList: {
    gap: 12,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  reminderIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reminderDesc: {
    fontSize: 12,
    color: '#888',
  },
  checkmark: {
    fontSize: 18,
    color: '#4CAF50',
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
  disabledBox: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  disabledDesc: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
});
