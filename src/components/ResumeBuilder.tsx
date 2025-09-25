"use client";

import { useState } from 'react';
import { ResumeData, BulletPointPool, JobAnalysisResponse, OptimizedResume } from '@/lib/types';
import { ResumeConstructor } from '@/lib/resumeConstructor';
import JobAnalyzer from './JobAnalyzer';
import ResumePreview from './ResumePreview';
import ProfileEditor from './ProfileEditor';
import BulletPointManager from './BulletPointManager';

interface ResumeBuilderProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  bulletPool: BulletPointPool[];
  setBulletPool: (bullets: BulletPointPool[]) => void;
  currentAnalysis: JobAnalysisResponse | null;
  setCurrentAnalysis: (analysis: JobAnalysisResponse | null) => void;
}

type ActiveTab = 'analyze' | 'profile' | 'bullets' | 'preview';

export default function ResumeBuilder({
  resumeData,
  setResumeData,
  bulletPool,
  setBulletPool,
  currentAnalysis,
  setCurrentAnalysis,
}: ResumeBuilderProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analyze');
  const [optimizedResume, setOptimizedResume] = useState<OptimizedResume | null>(null);
  const [isUsingOptimizedResume, setIsUsingOptimizedResume] = useState(false);

  // Function to apply AI selections and create optimized resume
  const applyAISelections = () => {
    if (!currentAnalysis) return;

    const optimized = ResumeConstructor.createOptimizedResume(
      resumeData,
      currentAnalysis,
      bulletPool
    );

    setOptimizedResume(optimized);
    setIsUsingOptimizedResume(true);
    setActiveTab('preview');
  };

  // Function to revert to original resume
  const revertToOriginal = () => {
    setIsUsingOptimizedResume(false);
  };

  // Get the current resume data (optimized or original)
  const getCurrentResumeData = (): ResumeData => {
    return isUsingOptimizedResume && optimizedResume
      ? optimizedResume.optimizedResume
      : resumeData;
  };

  const tabs = [
    { id: 'analyze', label: 'Job Analysis', icon: '🎯' },
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'bullets', label: 'Content Pool', icon: '📝' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Resume Builder
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Intelligently match your experience with job requirements
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {currentAnalysis && !isUsingOptimizedResume && (
                <button
                  onClick={applyAISelections}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors font-medium"
                >
                  🤖 Apply AI Selections
                </button>
              )}

              {isUsingOptimizedResume && optimizedResume && (
                <div className="flex items-center space-x-3">
                  <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    ✅ AI-Optimized: {optimizedResume.relevanceScore}% match
                  </div>
                  <button
                    onClick={revertToOriginal}
                    className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    ↶ Revert to Original
                  </button>
                </div>
              )}

              {currentAnalysis && !isUsingOptimizedResume && (
                <div className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Match: {currentAnalysis.matchScore}%
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'analyze' && (
          <JobAnalyzer
            resumeData={resumeData}
            bulletPool={bulletPool}
            onAnalysisComplete={setCurrentAnalysis}
            currentAnalysis={currentAnalysis}
            onApplyAISelections={applyAISelections}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileEditor
            resumeData={isUsingOptimizedResume ? resumeData : getCurrentResumeData()}
            setResumeData={setResumeData}
            isOptimized={isUsingOptimizedResume}
          />
        )}

        {activeTab === 'bullets' && (
          <BulletPointManager
            bulletPool={bulletPool}
            setBulletPool={setBulletPool}
          />
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Resume Comparison */}
            {isUsingOptimizedResume && optimizedResume && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">AI Optimization Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {optimizedResume.relevanceScore}%
                    </div>
                    <div className="text-sm text-gray-600">Job Match Score</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {optimizedResume.selectedBullets.length}
                    </div>
                    <div className="text-sm text-gray-600">AI-Selected Bullets</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {optimizedResume.optimizations.skillsHighlighted.length}
                    </div>
                    <div className="text-sm text-gray-600">Skills Highlighted</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    {isUsingOptimizedResume ? 'AI-Optimized Resume' : 'Resume Preview'}
                  </h2>
                  {isUsingOptimizedResume && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      AI-Enhanced
                    </span>
                  )}
                </div>
                <ResumePreview
                  resumeData={getCurrentResumeData()}
                  originalResumeData={resumeData}
                  analysis={currentAnalysis}
                  isOptimized={isUsingOptimizedResume}
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Optimization Tips</h2>
              {currentAnalysis ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Match Score</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${currentAnalysis.matchScore}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentAnalysis.matchScore}% match with job requirements
                    </p>
                  </div>

                  {currentAnalysis.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
                      <ul className="space-y-1">
                        {currentAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentAnalysis.optimizationSuggestions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Optimization Tips</h3>
                      <ul className="space-y-1">
                        {currentAnalysis.optimizationSuggestions.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">💡</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Analyze a job description to see optimization tips
                  </p>
                  <button
                    onClick={() => setActiveTab('analyze')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start Analysis
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}