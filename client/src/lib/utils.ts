import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();

  if (dateObj.toDateString() === now.toDateString()) {
    return `Today at ${format(dateObj, "h:mm a")}`;
  }
  
 
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (dateObj.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${format(dateObj, "h:mm a")}`;
  }
  
 
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  if (dateObj > oneWeekAgo) {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
  

  return format(dateObj, "MMM d, yyyy 'at' h:mm a");
}

export function getUserFullName(firstName?: string | null, lastName?: string | null): string {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (lastName) {
    return lastName;
  }
  return "Anonymous User";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}

// format like and comment counts
export function formatCount(count: number): string {
  if (count === 0) {
    return "0";
  } else if (count < 1000) {
    return count.toString();
  } else if (count < 1000000) {
    return (count / 1000).toFixed(count % 1000 < 100 ? 0 : 1) + "k";
  } else {
    return (count / 1000000).toFixed(count % 1000000 < 100000 ? 0 : 1) + "m";
  }
}
