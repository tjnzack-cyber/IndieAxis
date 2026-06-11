'use client';

import { useState } from 'react';
import { Rocket, CheckCircle2, Circle, Lightbulb } from 'lucide-react';
import AIFormLayout, { AIFormField, inputClassName, textareaClassName } from './AIFormLayout';
import AIResultPanel from './AIResultPanel';
import { cn } from '@/lib/utils';

interface MarketingPlanResult {
  title: string;
  strategy: string;
  goals: string[];
  tasks: { title: string; description: string; week: number }[];
  insights: string[];
}

interface Props {
  defaultGenre?: string;
  defaultLocation?: string;
  defaultName?: string;
}

export default function MarketingPlanGenerator({
  defaultGenre = '',
  defaultLocation = '',
  defaultName = '',
}: Props) {
  const [genre, setGenre] = useState(defaultGenre);
  const [location, setLocation] = useState(defaultLocation);
  const [artistName, setArtistName] = useState(defaultName);
  const [careerStage, setCareerStage] = useState('Emerging');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MarketingPlanResult | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/marketing-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, location, goals, artistName, careerStage }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setResult(data);
      setCompletedTasks(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (index: number) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const progress = result
    ? Math.round((completedTasks.size / result.tasks.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <AIFormLayout
        title="AI Marketing Plan Generator"
        description="Get a personalised 8-week marketing roadmap based on your genre, location, and goals."
        icon={<Rocket size={22} />}
        onSubmit={handleSubmit}
        loading={loading}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIFormField label="Artist Name">
            <input
              className={inputClassName}
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Your stage name"
            />
          </AIFormField>
          <AIFormField label="Career Stage">
            <select
              className={inputClassName}
              value={careerStage}
              onChange={(e) => setCareerStage(e.target.value)}
            >
              <option value="Emerging">Emerging (0-2 years)</option>
              <option value="Developing">Developing (2-5 years)</option>
              <option value="Established">Established (5+ years)</option>
            </select>
          </AIFormField>
          <AIFormField label="Genre *">
            <input
              className={inputClassName}
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Indie Pop, Afrobeat, Electronic"
              required
            />
          </AIFormField>
          <AIFormField label="Location *">
            <input
              className={inputClassName}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. London, UK"
              required
            />
          </AIFormField>
        </div>
        <AIFormField label="Your Goals *" hint="What do you want to achieve? e.g. grow Spotify listeners, book local gigs, get playlist features">
          <textarea
            className={textareaClassName}
            rows={4}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Describe your music career goals..."
            required
          />
        </AIFormField>
      </AIFormLayout>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <AIResultPanel title={result.title}>
          <div className="space-y-8">
            <div>
              <p className="text-zinc-300 leading-relaxed">{result.strategy}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2 bg-purple-900/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6c5ce7] to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-pink-400 font-bold text-sm">{progress}%</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-3">Key Goals</h4>
              <ul className="space-y-2">
                {result.goals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-purple-300 uppercase tracking-widest mb-4">Action Roadmap</h4>
              <div className="space-y-3">
                {result.tasks.map((task, i) => (
                  <div
                    key={i}
                    onClick={() => toggleTask(i)}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3',
                      completedTasks.has(i)
                        ? 'bg-purple-900/20 border-purple-500/20 opacity-60'
                        : 'bg-[#080814] border-purple-500/20 hover:border-pink-500/30'
                    )}
                  >
                    {completedTasks.has(i) ? (
                      <CheckCircle2 className="text-pink-400 mt-0.5" size={18} />
                    ) : (
                      <Circle className="text-purple-500 mt-0.5" size={18} />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h5 className={cn('font-medium text-sm', completedTasks.has(i) && 'line-through text-zinc-500')}>
                          {task.title}
                        </h5>
                        <span className="text-[10px] font-mono text-purple-400 uppercase">Week {task.week}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.insights.length > 0 && (
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-5">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2 mb-3">
                  <Lightbulb size={16} />
                  Strategy Insights
                </h4>
                <ul className="space-y-2">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-zinc-400">{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AIResultPanel>
      )}
    </div>
  );
}
