"use client";

import { useApp } from "@/lib/store";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskHeatmap } from "@/components/tasks/task-heatmap";

export default function TasksPage() {
    const { tasks, addTask, toggleTask, updateTask, deleteTask } = useApp();

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
                    <p className="text-muted-foreground">Manage your daily to-dos and priorities.</p>
                </div>
                <AddTaskDialog onAdd={addTask} />
            </div>

            <TaskHeatmap tasks={tasks} />

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    {activeTasks.length > 0 ? (
                        activeTasks.map(task => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onToggle={toggleTask}
                                onUpdate={updateTask}
                                onDelete={deleteTask}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                            No active tasks. Good job!
                        </div>
                    )}

                    {completedTasks.length > 0 && (
                        <>
                            <h3 className="text-sm font-medium text-muted-foreground pt-4">Completed</h3>
                            <div className="opacity-60">
                                {completedTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        onToggle={toggleTask}
                                        onUpdate={updateTask}
                                        onDelete={deleteTask}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="hidden md:block space-y-4">
                    <div className="p-4 rounded-lg bg-card border shadow-sm">
                        <h3 className="font-semibold mb-2">Priority Breakdown</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-red-500">High</span>
                                <span className="font-mono">{tasks.filter(t => t.priority === 'high' && !t.completed).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-yellow-500">Medium</span>
                                <span className="font-mono">{tasks.filter(t => t.priority === 'medium' && !t.completed).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-blue-500">Low</span>
                                <span className="font-mono">{tasks.filter(t => t.priority === 'low' && !t.completed).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
