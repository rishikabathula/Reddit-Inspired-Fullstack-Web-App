import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNowStrict } from 'date-fns'


export function formatTimeToNow(date: Date): string {
  return formatDistanceToNowStrict(date, { addSuffix: true })
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
