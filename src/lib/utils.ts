import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isPremium(user: { subscriptionStatus: string; trialEndsAt?: Date | string | null }) {
  if (user.subscriptionStatus === 'PREMIUM') {
    if (!user.trialEndsAt) return true;
    return new Date(user.trialEndsAt) > new Date();
  }
  return false;
}
