
import { db } from "@/lib/db";
import { habits, habitCompletions, weeklyReports, monthlyReports } from "@/lib/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

export async function generateWeeklyReport(userId: string, date: Date = new Date()) {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(date, { weekStartsOn: 1 });
    const weekStartStr = format(start, 'yyyy-MM-dd');
    const startIso = format(start, 'yyyy-MM-dd');
    const endIso = format(end, 'yyyy-MM-dd');

    // 1. Get Total Habits (Active)
    const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));
    const totalHabitsCount = userHabits.length;

    if (totalHabitsCount === 0) return null;

    // 2. Count Completions in this range
    const completions = await db.select({ count: sql<number>`count(*)` })
        .from(habitCompletions)
        .where(
            and(
                eq(habitCompletions.userId, userId),
                gte(habitCompletions.date, startIso),
                lte(habitCompletions.date, endIso)
            )
        );

    const totalCompleted = Number(completions[0].count);

    // 3. Calculate Rate
    // Naive calc: Rate = (Completions / (Habits * 7)) * 100
    // This assumes all habits are daily. A better metric would account for frequency.
    // For V1, we stick to raw volume or simple percentage of "Tasks Done".
    // Let's use simple volume for now, or relative to max possible if all were daily.
    // Enhanced: Check habit frequency. 
    // Daily = 7 opps, Weekly = 1 opp.

    let maxPossible = 0;
    userHabits.forEach(h => {
        if (h.frequency === 'daily' || h.frequency === 'custom') maxPossible += 7;
        else if (h.frequency === 'weekly') maxPossible += 1;
    });

    const rate = maxPossible > 0 ? Math.round((totalCompleted / maxPossible) * 100) : 0;

    // 4. Upsert Report
    // Check existing
    const existing = await db.select().from(weeklyReports).where(
        and(
            eq(weeklyReports.userId, userId),
            eq(weeklyReports.weekStart, weekStartStr)
        )
    );

    if (existing.length > 0) {
        await db.update(weeklyReports)
            .set({ totalHabits: totalHabitsCount, totalCompleted, completionRate: rate, updatedAt: new Date() })
            .where(eq(weeklyReports.id, existing[0].id));
    } else {
        await db.insert(weeklyReports).values({
            userId,
            weekStart: weekStartStr,
            totalHabits: totalHabitsCount,
            totalCompleted,
            completionRate: rate
        });
    }

    return { weekStart: weekStartStr, rate, totalCompleted };
}

export async function generateMonthlyReport(userId: string, date: Date = new Date()) {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const monthStr = format(start, 'yyyy-MM');
    const startIso = format(start, 'yyyy-MM-dd');
    const endIso = format(end, 'yyyy-MM-dd');

    // 1. Get Total Habits
    const userHabits = await db.select().from(habits).where(eq(habits.userId, userId));
    const totalHabitsCount = userHabits.length;

    if (totalHabitsCount === 0) return null;

    // 2. Count Completions
    const completions = await db.select({ count: sql<number>`count(*)` })
        .from(habitCompletions)
        .where(
            and(
                eq(habitCompletions.userId, userId),
                gte(habitCompletions.date, startIso),
                lte(habitCompletions.date, endIso)
            )
        );

    const totalCompleted = Number(completions[0].count);

    // 3. Rate (Approximate for month)
    // Daily = ~30, Weekly = ~4
    let maxPossible = 0;
    const daysInMonth = end.getDate();

    userHabits.forEach(h => {
        if (h.frequency === 'daily' || h.frequency === 'custom') maxPossible += daysInMonth;
        else if (h.frequency === 'weekly') maxPossible += 4; // Approx
    });

    const rate = maxPossible > 0 ? Math.round((totalCompleted / maxPossible) * 100) : 0;

    // 4. Upsert
    const existing = await db.select().from(monthlyReports).where(
        and(
            eq(monthlyReports.userId, userId),
            eq(monthlyReports.month, monthStr)
        )
    );

    if (existing.length > 0) {
        await db.update(monthlyReports)
            .set({ totalHabits: totalHabitsCount, totalCompleted, completionRate: rate, updatedAt: new Date() })
            .where(eq(monthlyReports.id, existing[0].id));
    } else {
        await db.insert(monthlyReports).values({
            userId,
            month: monthStr,
            totalHabits: totalHabitsCount,
            totalCompleted,
            completionRate: rate
        });
    }

    return { month: monthStr, rate, totalCompleted };
}
