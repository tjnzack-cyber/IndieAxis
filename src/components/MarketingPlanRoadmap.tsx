'use client';

import { MarketingPlan, MarketingTask } from '@/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, ExternalLink, Lightbulb, Lock } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Props {
  plan: MarketingPlan;
  premium?: boolean;
}

export default function MarketingPlanRoadmap({ plan, premium = true }: Props) {
  const [tasks, setTasks] = useState<MarketingTask[]>(plan.tasks || []);

  const toggleTask = (taskId: string) => {
    if (!premium) return;
    // In a real app, this would be an API call
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    ));
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 relative overflow-hidden">
        {!premium && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
            <Lock className="text-cyan-400 mb-4" size={40} />
            <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
            <p className="text-zinc-300 text-sm max-w-xs mb-6">Upgrade to unlock your personalized AI marketing roadmap and track your progress.</p>
            <Link href="/pricing" className="bg-cyan-400 text-black px-6 py-2 rounded-full font-bold hover:bg-white transition-all">
              View Plans
            </Link>
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
            <p className="text-zinc-400">{plan.strategy}</p>
          </div>
          <div className="text-right">
            <span className="text-cyan-500 font-bold text-xl">{progress}%</span>
            <p className="text-zinc-500 text-sm">Completed</p>
          </div>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="text-indigo-500" size={20} />
            Action Roadmap
          </h3>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div 
                key={task.id}
                className={cn(
                  "p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-4",
                  task.isCompleted 
                    ? "bg-zinc-900/50 border-emerald-900/30 opacity-60" 
                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                )}
                onClick={() => toggleTask(task.id)}
              >
                <div className="mt-1">
                  {task.isCompleted ? (
                    <CheckCircle2 className="text-emerald-500" size={20} />
                  ) : (
                    <Circle className="text-zinc-600" size={20} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className={cn(
                      "font-medium",
                      task.isCompleted ? "text-zinc-500 line-through" : "text-zinc-200"
                    )}>
                      {task.title}
                    </h4>
                    {task.week && (
                      <span className="text-xs font-mono text-zinc-500 uppercase">
                        Week {task.week}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-zinc-500 mt-1">{task.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-900/20 rounded-xl p-6 border border-indigo-500/20">
            <h3 className="text-lg font-semibold text-indigo-300 flex items-center gap-2 mb-4">
              <Lightbulb size={20} />
              Strategy Insights
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-zinc-300 font-medium">Release Tactics</p>
                <a 
                  href="https://www.youtube.com/results?search_query=indie+music+release+strategy" 
                  target="_blank"
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-indigo-500/50 group transition-all"
                >
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200">Watch: Successful Release Tactics</span>
                  <ExternalLink size={14} className="text-zinc-600 group-hover:text-indigo-400" />
                </a>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-zinc-300 font-medium">Community Advice</p>
                <a 
                  href="https://www.reddit.com/r/wearethemusicmakers" 
                  target="_blank"
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-indigo-500/50 group transition-all"
                >
                  <span className="text-xs text-zinc-400 group-hover:text-zinc-200">Reddit: r/WeAreTheMusicMakers</span>
                  <ExternalLink size={14} className="text-zinc-600 group-hover:text-indigo-400" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">Key Goals</h3>
            <ul className="space-y-3">
              {Array.isArray(plan.goals) && plan.goals.map((goal: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
