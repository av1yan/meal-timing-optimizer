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

interface FastingScreenProps {
  onNavigateBack: () => void;
}

export default function FastingScreen({ onNavigateBack }: FastingScreenProps) {
  const { getMealsForToday, meals } = useMealStore();
  const [currentFast, setCurrentFast] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 });
  const [lastMealTime, setLastMealTime] = useState<string>('');
  const [stats, setStats] = useState({
    longestFast: 0,
    averageFast: 0,
    todayFasting: 0,
  });

  useEffect(() => {
    calculateFastingMetrics();
    const interval = setInterval(calculateFastingMetrics, 60000);
    return () => clearInterval(interval);
  }, [meals.length]);

  const calculateFastingMetrics = () => {
    const todayMeals = getMealsForToday();

    if (todayMeals.length > 0) {
      const lastMeal = todayMeals[todayMeals.length - 1];
      const now = Date.now();
      const fastMs = now - lastMeal.timestamp;
      const fastHours = Math.floor(fastMs / (1000 * 60 * 60));
      const fastMinutes = Math.floor((fastMs % (1000 * 60 * 60)) / (1000 * 60));

      setCurrentFast({ hours: fastHours, minutes: fastMinutes });
      setLastMealTime(formatTime(lastMeal.timestamp));
    } else {
      setCurrentFast({ hours: 0, minutes: 0 });
      setLastMealTime('No meals yet');
    }

    // Calculate stats from all meals
    const fasts: number[] = [];
    for (let i = 1; i < meals.length; i++) {
      const fastDuration = (meals[i].timestamp - meals[i - 1].timestamp) / (1000 * 60 * 60);
      fasts.push(fastDuration);
    }

    if (fasts.length > 0) {
      const longestFast = Math.max(...fasts);
      const averageFast = fasts.reduce((a, b) => a + b) / fasts.length;

      setStats({
        longestFast: Math.round(longestFast * 10) / 10,
        averageFast: Math.round(averageFast * 10) / 10,
        todayFasting: currentFast.hours + currentFast.minutes / 60,
      });
    }
  };

  const getGoalStatus = () => {
    const { hours, minutes } = currentFast;
    const totalHours = hours + minutes / 60;

    if (totalHours < 4) return { text: '🍽️ Eating window', color: '#4CAF50' };
    if (totalHours < 8) return { text: '⏱️ Standard fast', color: '#2196F3' };
    if (totalHours < 16) return { text: '🌙 Moderate fast', color: '#FF9800' };
    return { text: '⭐ Extended fast', color: '#9C27B0' };
  };

  const goal = getGoalStatus();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Fasting Tracker</Text>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Current Fast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Fast</Text>
          <View style={[styles.fastCard, { borderLeftColor: goal.color }]}>
            <View style={styles.fastContent}>
              <View style={styles.fastTime}>
                <Text style={styles.fastHours}>{currentFast.hours}</Text>
                <Text style={styles.fastLabel}>h</Text>
              </View>
              <Text style={styles.fastSeparator}>:</Text>
              <View style={styles.fastTime}>
                <Text style={styles.fastMinutes}>{String(currentFast.minutes).padStart(2, '0')}</Text>
                <Text style={styles.fastLabel}>m</Text>
              </View>
            </View>
            <View style={styles.fastStatus}>
              <Text style={[styles.statusText, { color: goal.color }]}>{goal.text}</Text>
              <Text style={styles.lastMeal}>Since: {lastMealTime}</Text>
            </View>
          </View>
        </View>

        {/* Fasting Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fasting Zones</Text>
          <View style={styles.zonesContainer}>
            <FastingZone
              label="Eating"
              range="0-4h"
              description="Normal eating window"
              active={currentFast.hours < 4}
              icon="🍽️"
              color="#4CAF50"
            />
            <FastingZone
              label="Standard Fast"
              range="4-8h"
              description="After meals"
              active={currentFast.hours >= 4 && currentFast.hours < 8}
              icon="⏱️"
              color="#2196F3"
            />
            <FastingZone
              label="Moderate Fast"
              range="8-16h"
              description="Intermittent fasting"
              active={currentFast.hours >= 8 && currentFast.hours < 16}
              icon="🌙"
              color="#FF9800"
            />
            <FastingZone
              label="Extended Fast"
              range="16h+"
              description="Deep fasting"
              active={currentFast.hours >= 16}
              icon="⭐"
              color="#9C27B0"
            />
          </View>
        </View>

        {/* Fasting Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fasting Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Longest Fast" value={`${stats.longestFast}h`} />
            <StatCard label="Average Fast" value={`${stats.averageFast}h`} />
          </View>
        </View>

        {/* Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Fasting Tips</Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              • Start with 12-14 hour fasts (overnight + morning)
            </Text>
            <Text style={styles.tipText}>
              • Gradually extend to 16-18 hours
            </Text>
            <Text style={styles.tipText}>
              • Stay hydrated during fasting periods
            </Text>
            <Text style={styles.tipText}>
              • Consistent meal timing improves results
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface FastingZoneProps {
  label: string;
  range: string;
  description: string;
  active: boolean;
  icon: string;
  color: string;
}

function FastingZone({ label, range, description, active, icon, color }: FastingZoneProps) {
  return (
    <View
      style={[
        styles.zoneCard,
        active && { borderColor: color, backgroundColor: `${color}10`, borderWidth: 2 },
      ]}
    >
      <Text style={styles.zoneIcon}>{icon}</Text>
      <Text style={[styles.zoneLabel, active && { color }]}>{label}</Text>
      <Text style={styles.zoneRange}>{range}</Text>
      <Text style={styles.zoneDesc}>{description}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
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
  fastCard: {
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fastContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  fastTime: {
    alignItems: 'center',
  },
  fastHours: {
    fontSize: 48,
    fontWeight: '700',
    color: '#333',
  },
  fastMinutes: {
    fontSize: 36,
    fontWeight: '700',
    color: '#333',
  },
  fastSeparator: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ccc',
  },
  fastLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  fastStatus: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMeal: {
    fontSize: 12,
    color: '#888',
  },
  zonesContainer: {
    gap: 12,
  },
  zoneCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  zoneIcon: {
    fontSize: 18,
    marginBottom: 6,
  },
  zoneLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  zoneRange: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  zoneDesc: {
    fontSize: 11,
    color: '#999',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
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
});
