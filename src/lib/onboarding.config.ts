// src/lib/onboarding.config.ts

export const JOURNEY_STAGES = [
  { value: 'JUST_STARTING', label: 'Just Starting', emoji: '🌱' },
  { value: 'RELEASING_FIRST_MUSIC', label: 'Releasing My First Music', emoji: '🎵' },
  { value: 'GROWING_AUDIENCE', label: 'Growing My Audience', emoji: '📈' },
  { value: 'ESTABLISHED', label: 'Established Independent Artist', emoji: '🏆' },
] as const;

export const CHALLENGES = [
  { value: 'GROWING_FANS', label: 'Growing Fans' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'MUSIC_DISTRIBUTION', label: 'Music Distribution' },
  { value: 'FINDING_COLLABORATORS', label: 'Finding Collaborators' },
  { value: 'NETWORKING', label: 'Networking' },
  { value: 'GETTING_BOOKINGS', label: 'Getting Bookings' },
  { value: 'MAKING_MONEY', label: 'Making Money' },
  { value: 'INDUSTRY_KNOWLEDGE', label: 'Industry Knowledge' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const GOALS_90_DAY = [
  { value: 'RELEASE_SONG', label: 'Release a Song' },
  { value: 'GROW_FOLLOWERS', label: 'Grow Followers' },
  { value: 'BOOK_PERFORMANCES', label: 'Book Performances' },
  { value: 'COLLABORATE', label: 'Collaborate' },
  { value: 'IMPROVE_BRANDING', label: 'Improve Branding' },
  { value: 'GENERATE_INCOME', label: 'Generate Income' },
] as const;

export const AFRICAN_COUNTRIES = [
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Zambia', 'Zimbabwe',
  'Tanzania', 'Uganda', 'Ethiopia', 'Senegal', 'Ivory Coast', 'Cameroon',
  'Rwanda', 'Malawi', 'Mozambique', 'Botswana', 'Namibia', 'Egypt',
  'Morocco', 'Algeria', 'DR Congo', 'Angola', 'Other',
] as const;

export const COMMON_LANGUAGES = [
  'English', 'French', 'Portuguese', 'Swahili', 'Zulu', 'Yoruba',
  'Hausa', 'Igbo', 'Amharic', 'Arabic', 'Shona', 'Bemba', 'Other',
] as const;

export const GENRE_SUGGESTIONS = [
  'Afrobeats', 'Amapiano', 'Afro-Pop', 'Hip-Hop', 'R&B', 'Gospel',
  'Bongo Flava', 'Highlife', 'Afro-Fusion', 'Reggae', 'Dancehall',
  'Soul', 'Alternative', 'Gqom',
] as const;

// Maps each challenge/goal/stage to the dashboard features that should be
// surfaced first for an artist who picked it. Used by PersonalizedRecommendations.
export const FEATURE_TRIGGERS: Record<string, string[]> = {
  // challenges
  GROWING_FANS: ['fans', 'social-strategy'],
  MARKETING: ['marketing', 'social-strategy'],
  MUSIC_DISTRIBUTION: ['releases'],
  FINDING_COLLABORATORS: ['fans', 'opportunities'],
  NETWORKING: ['opportunities', 'fans'],
  GETTING_BOOKINGS: ['opportunities'],
  MAKING_MONEY: ['revenue'],
  INDUSTRY_KNOWLEDGE: ['hub'],
  OTHER: [],
  // goals
  RELEASE_SONG: ['releases'],
  GROW_FOLLOWERS: ['social-strategy', 'analytics'],
  BOOK_PERFORMANCES: ['opportunities'],
  COLLABORATE: ['fans'],
  IMPROVE_BRANDING: ['epk'],
  GENERATE_INCOME: ['revenue'],
  // journey stage
  JUST_STARTING: ['epk'],
  RELEASING_FIRST_MUSIC: ['releases', 'epk'],
  GROWING_AUDIENCE: ['social-strategy', 'analytics'],
  ESTABLISHED: ['revenue', 'opportunities'],
};

type DashboardFeature = { title: string; description: string; href: string; emoji: string };

export const DASHBOARD_FEATURES: Record<string, DashboardFeature> = {
  marketing: {
    title: 'Generate Your Marketing Plan',
    description: 'Get an AI-built 8-week marketing strategy tailored to your genre.',
    href: '/dashboard/marketing',
    emoji: '🚀',
  },
  epk: {
    title: 'Build Your Press Kit',
    description: 'Create a professional EPK to share with venues, blogs, and curators.',
    href: '/dashboard/epk',
    emoji: '📄',
  },
  releases: {
    title: 'Plan Your Next Release',
    description: 'Use the Release Planner to organize your rollout, task by task.',
    href: '/dashboard/releases',
    emoji: '🎵',
  },
  fans: {
    title: 'Grow Your Fan & Contact CRM',
    description: 'Keep track of fans, collaborators, and industry contacts in one place.',
    href: '/dashboard/fans',
    emoji: '👥',
  },
  opportunities: {
    title: 'Find Gigs & Opportunities',
    description: 'Browse bookings, grants, and pitching windows matched to you.',
    href: '/dashboard/opportunities',
    emoji: '🎤',
  },
  'social-strategy': {
    title: 'Get a Social Media Strategy',
    description: 'AI-tailored content ideas and a posting calendar for your platforms.',
    href: '/dashboard/hub',
    emoji: '📱',
  },
  revenue: {
    title: 'Track Your Revenue',
    description: 'Log streaming, gig, and sync income to see where you stand.',
    href: '/dashboard/hub',
    emoji: '💰',
  },
  analytics: {
    title: 'View Your Analytics',
    description: 'See your follower growth and release progress over time.',
    href: '/dashboard/analytics',
    emoji: '📊',
  },
  hub: {
    title: 'Explore the Learning Hub',
    description: 'Royalty bodies, success strategies, and industry know-how.',
    href: '/dashboard/hub',
    emoji: '🎓',
  },
};
