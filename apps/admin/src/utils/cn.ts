import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Standard shadcn class-merge utility — docs/58_FRONTEND_FOLDER_STRUCTURE.md. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
