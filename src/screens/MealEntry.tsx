import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Meal } from '@/types';
import { formatTime } from '@/utils/mealTiming';

interface MealEntryProps {
  meal: Meal;
  index: number;
}

export default function MealEntry({ meal, index }: MealEntryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.time}>{formatTime(meal.timestamp)}</Text>
        {meal.energyLevel && (
          <Text style={styles.energy}>Energy: {meal.energyLevel}</Text>
        )}
      </View>
      <Text style={styles.index}>#{index}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    marginVertical: 6,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  energy: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  index: {
    fontSize: 14,
    color: '#ccc',
    fontWeight: '500',
  },
});
