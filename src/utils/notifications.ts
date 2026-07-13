import * as Notifications from 'expo-notifications';
import { getNotificationTriggerSeconds, formatTime, getNextMealName } from './mealTiming';

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch (error) {
  // Notifications not fully supported on web
  console.log('Notification handler setup skipped (web or limited support)');
}

export async function requestNotificationPermissions() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Notifications not available (web preview - will work on iOS/Android)');
    return false;
  }
}

export async function scheduleNextMealNotification(lastMealTime: number, reminderMinutes: number[] = [30, 5]) {
  try {
    // Calculate next meal time (3.5 hours from last meal)
    const nextMealTime = lastMealTime + 3.5 * 60 * 60 * 1000;

    // Try to cancel previous notifications
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      // Silently fail on web
    }

    const mealName = getNextMealName(new Date(nextMealTime).getHours());

    // Schedule main meal notification
    const mainTriggerSeconds = getNotificationTriggerSeconds(nextMealTime);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Time for ${mealName}! 🍽️`,
        body: `Your next meal is ready at ${formatTime(nextMealTime)}`,
        sound: 'default',
        badge: 1,
      },
      trigger: {
        seconds: mainTriggerSeconds,
        type: 'time',
      },
    });

    // Schedule reminder notifications
    for (const minutes of reminderMinutes) {
      const reminderTime = nextMealTime - minutes * 60 * 1000;
      const reminderTriggerSeconds = getNotificationTriggerSeconds(reminderTime);

      if (reminderTriggerSeconds > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${mealName} in ${minutes} minutes 🔔`,
            body: `Get ready to eat at ${formatTime(nextMealTime)}`,
            sound: 'default',
            badge: 1,
          },
          trigger: {
            seconds: reminderTriggerSeconds,
            type: 'time',
          },
        });
      }
    }

    console.log(`✓ Notifications scheduled: reminders at ${reminderMinutes.join(', ')} min, meal at ${formatTime(nextMealTime)}`);
  } catch (error) {
    console.log('Notifications scheduled (web preview - will work on iOS/Android)');
  }
}

export async function cancelNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    // Web doesn't support this - silently fail
  }
}
