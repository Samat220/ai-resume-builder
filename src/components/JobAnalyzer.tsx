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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          Job Analysis
        </h2>
        <p className="text-gray-900 mb-6">
          Paste a job description below. Our AI will analyze it and help optimize your resume for maximum relevance.
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-gray-900 mb-2">
              Job Description
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description including requirements, responsibilities, and qualifications..."
              className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isAnalyzing}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-900">
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  Analyze Job Description
                </>
              )}
            </button>

            {currentAnalysis && (
              <button
                onClick={onApplyAISelections}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <span>🤖</span>
                Apply AI Selections
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="mt-6 space-y-6">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-green-600 text-xl">✓</span>
              <h3 className="text-lg font-semibold text-green-800">Analysis Complete</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {currentAnalysis.matchScore}%
                </div>
                <div className="text-sm text-gray-900">Overall Match</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {currentAnalysis.relevantSkills.length}
                </div>
                <div className="text-sm text-gray-900">Relevant Skills</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {currentAnalysis.recommendations.length}
                </div>
                <div className="text-sm text-gray-900">Recommendations</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Job Details</h4>
                <div className="text-sm text-gray-900">
                  <p><strong>Company:</strong> {currentAnalysis.analysis.company}</p>
                  <p><strong>Position:</strong> {currentAnalysis.analysis.jobTitle}</p>
                  <p><strong>Industry:</strong> {currentAnalysis.analysis.industry}</p>
                  <p><strong>Seniority:</strong> {currentAnalysis.analysis.seniority}</p>
                </div>
              </div>

              {currentAnalysis.relevantSkills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Relevant Skills Found</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.relevantSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {currentAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {currentAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-900 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentAnalysis.optimizationSuggestions.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Optimization Tips</h4>
                  <ul className="space-y-1">
                    {currentAnalysis.optimizationSuggestions.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-900 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
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