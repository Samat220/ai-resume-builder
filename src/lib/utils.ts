import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Format dates consistently
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(date);
}

// Calculate relevance score for bullet points
export function calculateRelevanceScore(
  bulletSkills: string[],
  jobSkills: string[]
): number {
  if (!bulletSkills.length || !jobSkills.length) return 0;

  const matches = bulletSkills.filter(skill =>
    jobSkills.some(jobSkill =>
      jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(jobSkill.toLowerCase())
    )
  );

  return Math.round((matches.length / bulletSkills.length) * 100);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Format URL with protocol
export function formatUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Score text similarity (simple implementation)
export function getTextSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const commonWords = words1.filter(word =>
    words2.includes(word) && word.length > 3
  );

  const totalWords = Math.max(words1.length, words2.length);
  return totalWords > 0 ? (commonWords.length / totalWords) * 100 : 0;
}

// Debounce function for API calls
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }
};

// Resume data helpers
export function generateEmptyResumeData() {
  return {
    personalInfo: {
      name: '',
      title: '',
      email: '',
      linkedin: '',
      github: '',
      portfolio: '',
      phone: '',
      location: ''
    },
    experience: [],
    projects: [],
    skills: {
      programmingLanguages: [],
      machineLearning: [],
      softwareAndTools: [],
      cloudAndDevOps: [],
      frameworksAndLibraries: [],
      softSkills: []
    },
    education: []
  };
}

// Constants
export const STORAGE_KEYS = {
  USER_PROFILE: 'resume_builder_profile',
  BULLET_POOL: 'resume_builder_bullets',
  RECENT_ANALYSES: 'resume_builder_analyses',
} as const;

export const MAX_BULLET_POINTS = 5;
export const MAX_JOB_DESCRIPTION_LENGTH = 50000;