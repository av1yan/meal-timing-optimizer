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

interface CalendarScreenProps {
  onNavigateBack: () => void;
}

export default function CalendarScreen({ onNavigateBack }: CalendarScreenProps) {
  const { meals } = useMealStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealCountByDay, setMealCountByDay] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    calculateMealCounts();
  }, [meals.length]);

  const calculateMealCounts = () => {
    const counts: { [key: number]: number } = {};

    meals.forEach((meal) => {
      const mealDate = new Date(meal.timestamp);
      const day = mealDate.getDate();
      counts[day] = (counts[day] || 0) + 1;
    });

    setMealCountByDay(counts);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);
  const allDays = [...emptyDays, ...days];

  const getColorForMealCount = (count: number) => {
    if (count === 0) return '#f0f0f0';
    if (count === 1) return '#e8f5e9';
    if (count === 2) return '#c8e6c9';
    if (count === 3) return '#a5d6a7';
    return '#4CAF50';
  };

  const getMealCountsForMonth = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    let totalMeals = 0;
    let daysWithMeals = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const count = mealCountByDay[i] || 0;
      totalMeals += count;
      if (count > 0) {
        daysWithMeals++;
      }
    }

    return { totalMeals, daysWithMeals };
  };

  const { totalMeals, daysWithMeals } = getMealCountsForMonth();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Meal Calendar</Text>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Month Navigation */}
        <View style={styles.navContainer}>
          <TouchableOpacity onPress={prevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>← Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>Next →</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.monthTitle}>{getMonthName(currentDate)}</Text>

        {/* Month Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Meals</Text>
            <Text style={styles.statValue}>{totalMeals}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Days</Text>
            <Text style={styles.statValue}>{daysWithMeals}</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.weekday}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {allDays.map((day, index) => (
              <View
                key={index}
                style={[
                  styles.dayCell,
                  day && { backgroundColor: getColorForMealCount(mealCountByDay[day] || 0) },
                ]}
              >
                {day && (
                  <>
                    <Text style={styles.dayNumber}>{day}</Text>
                    {mealCountByDay[day] && (
                      <Text style={styles.mealCount}>{mealCountByDay[day]}</Text>
                    )}
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#f0f0f0' }]} />
            <Text style={styles.legendLabel}>0 meals</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#e8f5e9' }]} />
            <Text style={styles.legendLabel}>1 meal</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#c8e6c9' }]} />
            <Text style={styles.legendLabel}>2 meals</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#a5d6a7' }]} />
            <Text style={styles.legendLabel}>3 meals</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendBox, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendLabel}>4+ meals</Text>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightBox}>
          <Text style={styles.insightTitle}>📊 Consistency</Text>
          {daysWithMeals > 0 && (
            <Text style={styles.insightText}>
              You logged meals on {daysWithMeals} days this month ({Math.round((daysWithMeals / (daysInMonth || 30)) * 100)}%)
            </Text>
          )}
          {totalMeals > 0 && (
            <Text style={styles.insightText}>
              Average {(totalMeals / (daysWithMeals || 1)).toFixed(1)} meals per active day
            </Text>
          )}
        </View>
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
  navContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  todayButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
  calendarContainer: {
    marginBottom: 24,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingVertical: 4,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 6,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  mealCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 2,
  },
  legendContainer: {
    marginBottom: 24,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 10,
  },
  legendLabel: {
    fontSize: 13,
    color: '#666',
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
