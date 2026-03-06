
import { NextResponse } from 'next/server';
import { generateWeeklyReport, generateMonthlyReport } from '@/lib/analytics';

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'UserId required' }, { status: 400 });
        }

        const weekly = await generateWeeklyReport(userId);
        const monthly = await generateMonthlyReport(userId);

        return NextResponse.json({ success: true, weekly, monthly });
    } catch (error) {
        console.error("Report Sync Error:", error);
        return NextResponse.json({ error: 'Failed to sync reports' }, { status: 500 });
    }
}
