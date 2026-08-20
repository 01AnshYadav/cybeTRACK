/**
 * CyberSync Streaks System
 * 
 * Deterministic learning streak calculation based on actual activity timestamps.
 * 
 * No fake activity rewards. All streaks are calculated from real user activity
 * in the Supabase activity table.
 */

/**
 * Calculate streak from an array of activity timestamps.
 * 
 * Activity timestamps should be sorted in descending order (most recent first).
 * 
 * @param timestamps ISO date strings from activity.created_at
 * @returns Streak calculation result
 */
export function calculateStreak(timestamps: string[]): {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
} {
  if (timestamps.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  // Parse timestamps to dates
  const dates = timestamps
    .map((ts) => new Date(ts))
    .filter((date) => !isNaN(date.getTime()));

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  // Sort dates ascending for easier processing
  dates.sort((a, b) => a.getTime() - b.getTime());

  // Helper: get start of day (midnight) for a date
  const startOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Get unique days with activity
  const uniqueDays = [...new Set(dates.map(startOfDay))].sort(
    (a, b) => a.getTime() - b.getTime()
  );

  // Calculate current streak (most recent consecutive days from today)
  const today = startOfDay(new Date());
  const yesterday = startOfDay(new Date());
  yesterday.setDate(yesterday.getDate() - 1);

  let currentStreak = 0;
  let i = uniqueDays.length - 1;

  // Check if the most recent activity was today or yesterday
  if (
    uniqueDays[i].getTime() === today.getTime() ||
    uniqueDays[i].getTime() === yesterday.getTime()
  ) {
    // Count consecutive days backwards
    const checkDate = startOfDay(new Date());
    checkDate.setDate(checkDate.getDate() - currentStreak);

    while (i >= 0 && uniqueDays[i].getTime() >= checkDate.getTime()) {
      currentStreak++;
      i--;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Calculate longest streak (anywhere in the history)
  let longestStreak = 0;
  let currentRun = 0;

  for (let j = 0; j < uniqueDays.length; j++) {
    if (j === 0) {
      currentRun = 1;
    } else {
      const diffDays = Math.ceil(
        (uniqueDays[j].getTime() - uniqueDays[j - 1].getTime()) / 86400000
      );
      if (diffDays === 1) {
        currentRun++;
      } else {
        longestStreak = Math.max(longestStreak, currentRun);
        currentRun = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, currentRun);

  // Last active date
  const lastActiveDate = uniqueDays[uniqueDays.length - 1]
    .toISOString()
    .split("T")[0];

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
  };
}

/**
 * Get streak color class for UI display.
 * 
 * @param streak Current streak number
 * @returns Tailwind CSS class name
 */
export function getStreakColorClass(streak: number): string {
  if (streak >= 7) return "text-green-400";
  if (streak >= 3) return "text-indigo-300";
  return "text-gray-400";
}

/**
 * Format streak for display.
 * 
 * @param streak Streak number
 * @returns Formatted string
 */
export function formatStreak(streak: number): string {
  if (streak === 0) return "No streak";
  if (streak === 1) return "1 day";
  return `${streak} days`;
}