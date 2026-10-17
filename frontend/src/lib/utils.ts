import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (d: string) => format(new Date(d), 'dd MMM yyyy');
export const formatDateTime = (d: string) => format(new Date(d), 'dd MMM yyyy, HH:mm');
export const timeAgo = (d: string) => formatDistanceToNow(new Date(d), { addSuffix: true });

export const SEVERITY_COLOR: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  assigned: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  closed: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const CATEGORY_ICON: Record<string, string> = {
  'Pothole': '🕳️', 'Garbage': '🗑️', 'Drainage': '🌊', 'Streetlight': '💡',
  'Water Leakage': '💧', 'Road Damage': '🛣️', 'Fallen Tree': '🌳',
  'Broken Footpath': '🚶', 'Traffic Signal': '🚦', 'Encroachment': '🏗️', 'Other': '📋',
};

export const PRIORITY_COLOR = (score: number): string => {
  if (score >= 80) return 'text-red-500';
  if (score >= 60) return 'text-orange-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-green-500';
};
