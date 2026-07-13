import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useMealStore } from '@/store/mealStore';
import { formatTime } from '@/utils/mealTiming';

interface HistoryScreenProps {
  onNavigateBack: () => void;
}

export default function HistoryScreen({ onNavigateBack }: HistoryScreenProps) {
  const { meals } = useMealStore();
  const [selectedDays, setSelectedDays] = useState(7);
  const [historyMeals, setHistoryMeals] = useState<any[]>([]);

  useEffect(() => {
    updateHistory();
  }, [selectedDays, meals.length]);

  const updateHistory = () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - selectedDays);
    cutoffDate.setHours(0, 0, 0, 0);

    const filtered = meals.filter((meal) => new Date(meal.timestamp) >= cutoffDate);
    setHistoryMeals(filtered.reverse());
  };

  const getMealsByDay = () => {
    const grouped: { [key: string]: any[] } = {};

    historyMeals.forEach((meal) => {
      const date = new Date(meal.timestamp);
      const key = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(meal);
    });

    return grouped;
  };

  const mealsByDay = getMealsByDay();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meal History</Text>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Time Filter */}
        <View style={styles.filterContainer}>
          {[7, 14, 30].map((days) => (
            <TouchableOpacity
              key={days}
              style={[styles.filterButton, selectedDays === days && styles.filterButtonActive]}
              onPress={() => setSelectedDays(days)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedDays === days && styles.filterButtonTextActive,
                ]}
              >
                {days}d
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Meals</Text>
            <Text style={styles.statValue}>{historyMeals.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Per Day Avg</Text>
            <Text style={styles.statValue}>
              {selectedDays > 0 ? (historyMeals.length / selectedDays).toFixed(1) : '0'}
            </Text>
          </View>
        </View>

        {/* History by Day */}
        {historyMeals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals in this period</Text>
          </View>
        ) : (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Meal Timeline</Text>
            {Object.entries(mealsByDay).map(([day, dayMeals]) => (
              <View key={day} style={styles.dayGroup}>
                <Text style={styles.dayLabel}>
                  {day} ({dayMeals.length} meals)
                </Text>
                {dayMeals.map((meal) => (
                  <View key={meal.id} style={styles.mealItem}>
                    <View style={styles.mealTime}>
                      <Text style={styles.mealTimeText}>{formatTime(meal.timestamp)}</Text>
                    </View>
                    <View style={styles.mealInfo}>
                      <Text style={styles.mealLabel}>Meal logged</Text>
                      {meal.energyLevel && (
                        <Text style={styles.mealEnergy}>Energy: {meal.energyLevel}</Text>
                      )}
                    </View>
                    <Text style={styles.mealIcon}>🍽️</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Insights */}
        {historyMeals.length > 0 && (
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>📊 Insights</Text>
            <Text style={styles.insightText}>
              You logged {historyMeals.length} meals over {selectedDays} days
            </Text>
            <Text style={styles.insightText}>
              Average: {(historyMeals.length / selectedDays).toFixed(1)} meals per day
            </Text>
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
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#4CAF50',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  historySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dayGroup: {
    marginBottom: 20,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 6,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  mealTime: {
    marginRight: 12,
  },
  mealTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  mealInfo: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  mealEnergy: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  mealIcon: {
    fontSize: 16,
  },
  insightBox: {
    backgroundColor: '#f0f8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
});
