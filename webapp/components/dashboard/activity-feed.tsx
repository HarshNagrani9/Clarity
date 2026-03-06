"use client";

import { useState } from "react";
import { formatDistanceToNow, isToday } from "date-fns";
import { Activity as ActivityIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ActivityItem {
    id: number;
    type: string;
    description: string;
    createdAt: string;
}

interface ActivityFeedProps {
    activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const [showAll, setShowAll] = useState(false);

    const todayActivities = activities.filter(a => isToday(new Date(a.createdAt)));
    const displayedActivities = showAll ? activities : todayActivities;

    return (
        <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CardTitle>{showAll ? "All Activity" : "Today's Activity"}</CardTitle>
                        <ActivityIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-auto p-0 text-primary"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? "Show Today" : "Show All"}
                    </Button>
                </div>
                <CardDescription>
                    {showAll ? "Full history of achievements" : "What you've done today"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {displayedActivities.length > 0 ? displayedActivities.map(activity => (
                        <div key={activity.id} className="flex items-center border-b pb-2 last:border-0 last:pb-0">
                            <div className="h-2 w-2 rounded-full bg-primary mr-3 flex-shrink-0"></div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{activity.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {activity.createdAt ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }) : 'Just now'}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground">
                            {showAll ? "No activity recorded yet." : "No activity today."}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
