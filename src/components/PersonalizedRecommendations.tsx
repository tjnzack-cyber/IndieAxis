'use client';

import Link from 'next/link';
import { FEATURE_TRIGGERS, DASHBOARD_FEATURES } from '@/lib/onboarding.config';

interface Props {
  journeyStage: string | null;
  challenges: string[];
  goals90Day: string[];
}

export default function PersonalizedRecommendations({ journeyStage, challenges, goals90Day }: Props) {
  const tags = [...challenges, ...goals90Day, ...(journeyStage ? [journeyStage] : [])];

  if (tags.length === 0) return null;

  const scores: Record<string, number> = {};
  for (const tag of tags) {
    const features = FEATURE_TRIGGERS[tag] || [];
    for (const feature of features) {
      scores[feature] = (scores[feature] || 0) + 1;
    }
  }

  const topFeatures = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => key)
    .filter(key => DASHBOARD_FEATURES[key]);

  if (topFeatures.length === 0) return null;

  return (
    <section className="md:col-span-2">
      <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-4">
        Recommended for you
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {topFeatures.map(key => {
          const feature = DASHBOARD_FEATURES[key];
          return (
            <Link
              key={key}
              href={feature.href}
              className="bg-gradient-to-br from-[#6c5ce7]/10 to-pink-500/5 border border-purple-500/20 rounded-xl p-5 hover:border-pink-500/40 transition-all block"
            >
              <div className="text-2xl mb-2">{feature.emoji}</div>
              <h3 className="font-bold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-zinc-400">{feature.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
