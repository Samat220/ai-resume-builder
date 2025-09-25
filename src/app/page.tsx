"use client";

import { useState, useEffect } from 'react';
import { ResumeData, BulletPointPool, JobAnalysisResponse } from '@/lib/types';
import { initialResumeData, initialBulletPointPool } from '@/lib/initialData';
import { storage, STORAGE_KEYS } from '@/lib/utils';
import ResumeBuilder from '@/components/ResumeBuilder';

export default function Home() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [bulletPool, setBulletPool] = useState<BulletPointPool[]>(initialBulletPointPool);
  const [currentAnalysis, setCurrentAnalysis] = useState<JobAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProfile = storage.get(STORAGE_KEYS.USER_PROFILE, initialResumeData);
    const savedBullets = storage.get(STORAGE_KEYS.BULLET_POOL, initialBulletPointPool);

    setResumeData(savedProfile);
    setBulletPool(savedBullets);
    setIsLoading(false);
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      storage.set(STORAGE_KEYS.USER_PROFILE, resumeData);
    }
  }, [resumeData, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      storage.set(STORAGE_KEYS.BULLET_POOL, bulletPool);
    }
  }, [bulletPool, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResumeBuilder
        resumeData={resumeData}
        setResumeData={setResumeData}
        bulletPool={bulletPool}
        setBulletPool={setBulletPool}
        currentAnalysis={currentAnalysis}
        setCurrentAnalysis={setCurrentAnalysis}
      />
    </div>
  );
}
