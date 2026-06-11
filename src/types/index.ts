export type Role = 'ARTIST' | 'MANAGER' | 'ADMIN';

export type MarketingPlanStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  role: Role;
  subscriptionStatus: 'FREE' | 'PREMIUM';
  trialEndsAt?: Date | string | null;
  trialUsed: boolean;
  createdAt: Date;
  artistProfile?: ArtistProfile;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  genre?: string;
  location?: string;
  socialLinks?: any;
  profileImageUrl?: string;
  epks?: EPK[];
  marketingPlans?: MarketingPlan[];
  gigApplications?: GigApplication[];
}

export interface EPK {
  id: string;
  artistId: string;
  title: string;
  slug: string;
  description?: string;
  musicLinks?: any;
  videoLinks?: any;
  pressQuotes?: any;
  isPublic: boolean;
}

export interface MarketingPlan {
  id: string;
  artistId: string;
  title: string;
  strategy?: string;
  goals?: any;
  status: MarketingPlanStatus;
  tasks?: MarketingTask[];
}

export interface MarketingTask {
  id: string;
  marketingPlanId: string;
  title: string;
  description?: string;
  week?: number;
  isCompleted: boolean;
  order: number;
}

export interface Gig {
  id: string;
  title: string;
  description?: string;
  location?: string;
  genre?: string;
  venueType?: string;
  gigDate?: Date;
  pitchDeadline?: Date;
  applications?: GigApplication[];
}

export interface GigApplication {
  id: string;
  gigId: string;
  artistId: string;
  status: ApplicationStatus;
  pitchMessage?: string;
}

export interface PitchingWindow {
  id: string;
  title: string;
  description?: string;
  month: string;
  location?: string;
  deadline?: string;
  category?: string;
}
