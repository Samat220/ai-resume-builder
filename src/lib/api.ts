// Client-side API utilities for secure communication

import { JobAnalysisRequest, JobAnalysisResponse } from './types';

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Generic API call function with error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.error || 'API request failed',
      response.status,
      errorData.code
    );
  }

  return response.json();
}

// Job analysis API call
export async function analyzeJob(
  request: JobAnalysisRequest
): Promise<JobAnalysisResponse> {
  // Client-side validation
  if (!request.jobDescription?.trim()) {
    throw new APIError('Job description is required', 400);
  }

  if (request.jobDescription.length > 50000) {
    throw new APIError('Job description is too long', 400);
  }

  if (!Array.isArray(request.userSkills)) {
    throw new APIError('User skills must be provided', 400);
  }

  if (!Array.isArray(request.availableBullets)) {
    throw new APIError('Available bullet points must be provided', 400);
  }

  try {
    const response = await apiCall<JobAnalysisResponse>('/api/analyze-job', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Handle network errors, etc.
    throw new APIError('Failed to analyze job description', 500);
  }
}

// Utility function to handle API errors in components
export function handleAPIError(error: unknown): string {
  if (error instanceof APIError) {
    switch (error.status) {
      case 400:
        return 'Invalid input. Please check your data and try again.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 503:
        return 'AI service is temporarily unavailable. Please try again later.';
      default:
        return error.message || 'An error occurred while processing your request.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

// Loading states for API calls
export interface APILoadingState {
  isLoading: boolean;
  error: string | null;
}

// Hook-like function for managing API state
export function createAPIState(): {
  state: APILoadingState;
  setLoading: () => void;
  setError: (error: unknown) => void;
  setSuccess: () => void;
} {
  const state: APILoadingState = {
    isLoading: false,
    error: null,
  };

  return {
    state,
    setLoading: () => {
      state.isLoading = true;
      state.error = null;
    },
    setError: (error: unknown) => {
      state.isLoading = false;
      state.error = handleAPIError(error);
    },
    setSuccess: () => {
      state.isLoading = false;
      state.error = null;
    },
  };
}