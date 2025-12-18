import { parseISO, subDays, format, isSameDay, differenceInCalendarDays } from 'date-fns';

export function calculateStreak(completedDates: string[]): number {
    if (!completedDates || completedDates.length === 0) return 0;

    // Filter out invalid dates and sort descending
    const validDates = completedDates.filter(d => Boolean(d)).sort().reverse();

    if (validDates.length === 0) return 0;

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(today, 1), 'yyyy-MM-dd');

    // Case 1: Streak logic involves "current chain"
    // The chain is valid if the most recent completion is Today OR Yesterday.
    // If the most recent completion is older than yesterday, the streak is broken (0).

    const lastCompletion = validDates[0];

    if (lastCompletion !== todayStr && lastCompletion !== yesterdayStr) {
        return 0;
    }

    let streak = 0;
    let currentCheckDate = today;

    // If today is NOT completed, start checking from yesterday
    // This handles the "Active Streak" case where you haven't done it YET today, 
    // but you did it yesterday, so your streak is alive (e.g., 5 days), just at risk.
    if (!validDates.includes(todayStr)) {
        currentCheckDate = subDays(today, 1);
    }

    // Now count backwards
    while (true) {
        const checkStr = format(currentCheckDate, 'yyyy-MM-dd');
        if (validDates.includes(checkStr)) {
            streak++;
            currentCheckDate = subDays(currentCheckDate, 1);
        } else {
            break;
        }
    }

    return streak;
}
