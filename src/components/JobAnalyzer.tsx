"use client";

import { useState } from 'react';
import { ResumeData, BulletPointPool, JobAnalysisResponse } from '@/lib/types';
import { analyzeJob, handleAPIError } from '@/lib/api';
import { MAX_JOB_DESCRIPTION_LENGTH } from '@/lib/utils';

interface JobAnalyzerProps {
  resumeData: ResumeData;
  bulletPool: BulletPointPool[];
  onAnalysisComplete: (analysis: JobAnalysisResponse | null) => void;
  currentAnalysis: JobAnalysisResponse | null;
  onApplyAISelections?: () => void;
}

export default function JobAnalyzer({
  resumeData,
  bulletPool,
  onAnalysisComplete,
  currentAnalysis,
  onApplyAISelections,
}: JobAnalyzerProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH) {
      setError(`Job description is too long. Maximum ${MAX_JOB_DESCRIPTION_LENGTH} characters allowed.`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Collect all user skills
      const userSkills = [
        ...resumeData.skills.programmingLanguages,
        ...resumeData.skills.machineLearning,
        ...resumeData.skills.softwareAndTools,
        ...resumeData.skills.cloudAndDevOps,
        ...resumeData.skills.frameworksAndLibraries,
        ...resumeData.skills.softSkills,
      ];

      const analysisResponse = await analyzeJob({
        jobDescription: jobDescription.trim(),
        userSkills,
        availableBullets: bulletPool,
      });

      onAnalysisComplete(analysisResponse);

    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearAnalysis = () => {
    onAnalysisComplete(null);
    setJobDescription('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Job Description Analysis</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
              Paste the job description here
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description including requirements, responsibilities, and qualifications..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              disabled={isAnalyzing}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {jobDescription.length} / {MAX_JOB_DESCRIPTION_LENGTH} characters
              </p>
              {jobDescription.length > MAX_JOB_DESCRIPTION_LENGTH * 0.9 && (
                <p className="text-xs text-amber-600">
                  Approaching character limit
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-red-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Job & Optimize Resume'
              )}
            </button>

            {currentAnalysis && (
              <button
                onClick={handleClearAnalysis}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Clear Analysis
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Analysis Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Job Analysis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Position Details</h4>
                <p className="text-sm text-gray-600">
                  <strong>Title:</strong> {currentAnalysis.analysis.jobTitle}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Company:</strong> {currentAnalysis.analysis.company}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Seniority:</strong> {currentAnalysis.analysis.seniority}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Industry:</strong> {currentAnalysis.analysis.industry}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {currentAnalysis.analysis.requiredSkills.slice(0, 10).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Preferred Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {currentAnalysis.analysis.preferredSkills.slice(0, 8).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Selected Content */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">AI-Selected Content</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Selected Bullet Points ({currentAnalysis.selectedBullets.length})
                </h4>
                <div className="space-y-2">
                  {currentAnalysis.selectedBullets.map((bullet) => (
                    <div key={bullet.id} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50">
                      <p className="text-sm text-gray-800">{bullet.content}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bullet.skills.slice(0, 4).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Highlighted Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {currentAnalysis.relevantSkills.slice(0, 12).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Apply AI Selections Button */}
              {onApplyAISelections && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={onApplyAISelections}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                  >
                    🚀 Apply AI Selections to Resume
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    This will create an optimized resume using the AI-selected content above
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400">💡</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900">Tips for Best Results</h4>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Include the complete job description with requirements and responsibilities</li>
              <li>• Make sure your bullet point pool contains relevant experiences</li>
              <li>• Review the selected content and adjust your profile if needed</li>
              <li>• Use the preview tab to see your optimized resume</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}