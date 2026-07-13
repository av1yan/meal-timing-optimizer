import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useMealStore } from '@/store/mealStore';
import { getWeeklyStats, getDayLabel, WeeklyStats } from '@/utils/stats';

interface WeeklyStatsScreenProps {
  onNavigateBack: () => void;
}

export default function WeeklyStatsScreen({ onNavigateBack }: WeeklyStatsScreenProps) {
  const { meals } = useMealStore();
  const [stats, setStats] = useState<WeeklyStats | null>(null);

  useEffect(() => {
    const weeklyStats = getWeeklyStats(meals);
    setStats(weeklyStats);
  }, [meals.length]);

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Weekly Stats</Text>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Stats</Text>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <MetricCard label="Total Meals" value={stats.totalMeals.toString()} color="#4CAF50" />
          <MetricCard
            label="Avg Interval"
            value={`${stats.averageInterval}h`}
            color="#2196F3"
          />
          <MetricCard label="Consistency" value={`${stats.consistencyScore}%`} color="#FF9800" />
          <MetricCard label="Best Day" value={stats.bestDay.slice(0, 3)} color="#9C27B0" />
        </View>

        {/* Meals Per Day Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meals Per Day</Text>
          <View style={styles.chartContainer}>
            {stats.mealsPerDay.map((count, index) => (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barLabelContainer}>
                  {count > 0 && <Text style={styles.barValue}>{count}</Text>}
                </View>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(40, count * 30),
                      backgroundColor: count > 0 ? '#4CAF50' : '#e0e0e0',
                    },
                  ]}
                />
                <Text style={styles.dayLabel}>{getDayLabel(6 - index)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meal Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meal Timing</Text>
          <View style={styles.timingCard}>
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Earliest Meal</Text>
              <Text style={styles.timingValue}>{stats.earliestMeal}</Text>
            </View>
            <View style={styles.timingDivider} />
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Latest Meal</Text>
              <Text style={styles.timingValue}>{stats.latestMeal}</Text>
            </View>
            <View style={styles.timingDivider} />
            <View style={styles.timingRow}>
              <Text style={styles.timingLabel}>Average Time</Text>
              <Text style={styles.timingValue}>{stats.averageMealTime}</Text>
            </View>
          </View>
        </View>

        {/* Energy Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Energy Levels</Text>
          <View style={styles.energyContainer}>
            <EnergyBar
              label="High"
              count={stats.energyBreakdown.high}
              total={stats.totalMeals}
              color="#4CAF50"
            />
            <EnergyBar
              label="Medium"
              count={stats.energyBreakdown.medium}
              total={stats.totalMeals}
              color="#2196F3"
            />
            <EnergyBar
              label="Low"
              count={stats.energyBreakdown.low}
              total={stats.totalMeals}
              color="#FF9800"
            />
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightBox}>
            {stats.totalMeals === 0 ? (
              <Text style={styles.insightText}>Start logging meals to see your weekly patterns!</Text>
            ) : (
              <>
                <Text style={styles.insightText}>
                  📊 You logged {stats.totalMeals} meals this week, averaging{' '}
                  <Text style={styles.insightBold}>{stats.averageInterval}h</Text> between meals.
                </Text>
                <Text style={styles.insightText}>
                  🎯 Your consistency score is{' '}
                  <Text style={styles.insightBold}>{stats.consistencyScore}%</Text> — keep up the
                  routine!
                </Text>
                <Text style={styles.insightText}>
                  ⚡ Most meals were logged with <Text style={styles.insightBold}>
                    {getTopEnergyLevel(stats.energyBreakdown)}
                  </Text>{' '}
                  energy.
                </Text>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  color: string;
}

function MetricCard({ label, value, color }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

interface EnergyBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function EnergyBar({ label, count, total, color }: EnergyBarProps) {
  const percentage = total > 0 ? (count / total) * 100 : 0;

  return (
    <View style={styles.energyRow}>
      <Text style={styles.energyLabel}>{label}</Text>
      <View style={styles.energyBarBackground}>
        <View style={[styles.energyBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.energyCount}>{count}</Text>
    </View>
  );
}

function getTopEnergyLevel(breakdown: { low: number; medium: number; high: number }): string {
  const { low, medium, high } = breakdown;
  if (high >= medium && high >= low) return 'high';
  if (medium >= high && medium >= low) return 'medium';
  return 'low';
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
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    minWidth: '48%',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
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
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 200,
    paddingHorizontal: 8,
    paddingBottom: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barLabelContainer: {
    height: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  bar: {
    width: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  timingCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  timingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timingLabel: {
    fontSize: 14,
    color: '#666',
  },
  timingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timingDivider: {
    height: 0.5,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  energyContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
  },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  energyLabel: {
    fontSize: 14,
    color: '#666',
    width: 50,
  },
  energyBarBackground: {
    flex: 1,
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  energyBarFill: {
    height: '100%',
  },
  energyCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 30,
    textAlign: 'right',
  },
  insightsSection: {
    marginBottom: 24,
  },
  insightBox: {
    backgroundColor: '#f0f8f0',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
  },
  insightText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  insightBold: {
    fontWeight: '600',
    color: '#4CAF50',
  },
});
