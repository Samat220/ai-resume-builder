"use client";

import { useState } from 'react';
import { ResumeData, JobAnalysisResponse } from '@/lib/types';
import { PDFGenerator, PDFGenerationState } from '@/lib/pdfGenerator';

interface ResumePreviewProps {
  resumeData: ResumeData;
  originalResumeData?: ResumeData;
  analysis: JobAnalysisResponse | null;
  isOptimized?: boolean;
}

export default function ResumePreview({ resumeData, originalResumeData, analysis, isOptimized }: ResumePreviewProps) {
  const { personalInfo, experience, projects, skills, education } = resumeData;
  const [pdfState, setPdfState] = useState<PDFGenerationState>({
    isGenerating: false,
    error: null,
  });

  const handleDownloadPDF = async () => {
    setPdfState({ isGenerating: true, error: null });

    try {
      await PDFGenerator.downloadPDF({
        resumeData: originalResumeData || resumeData,
        analysis: analysis || undefined,
        isOptimized: false,
      });
      setPdfState({ isGenerating: false, error: null });
    } catch (error) {
      setPdfState({
        isGenerating: false,
        error: PDFGenerator.handlePDFError(error),
      });
    }
  };

  // For optimized resumes, bullets are already pre-selected in the resume data
  const getDisplayedBullets = (bullets: string[]) => {
    return bullets;
  };

  const getHighlightedSkills = () => {
    if (!analysis) {
      // Return all skills if no analysis
      return [
        ...skills.programmingLanguages,
        ...skills.frameworksAndLibraries,
        ...skills.softwareAndTools,
        ...skills.cloudAndDevOps,
      ];
    }

    // Return AI-highlighted skills
    return analysis.relevantSkills;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white">
      {/* Print styles */}
      <style jsx>{`
        @media print {
          .no-print { display: none !important; }
          .print-page {
            width: 8.5in;
            margin: 0;
            box-shadow: none;
          }
        }
      `}</style>

      <div className="print-page p-8 shadow-lg">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {personalInfo.name || 'Your Name'}
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            {personalInfo.title || 'Professional Title'}
          </p>

          {/* Contact Information */}
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-600 flex-wrap">
            {personalInfo.email && (
              <>
                <a href={`mailto:${personalInfo.email}`} className="hover:text-blue-600">
                  {personalInfo.email}
                </a>
                <span>•</span>
              </>
            )}
            {personalInfo.phone && (
              <>
                <span>{personalInfo.phone}</span>
                <span>•</span>
              </>
            )}
            {personalInfo.linkedin && (
              <>
                <a
                  href={`https://${personalInfo.linkedin.replace(/^https?:\/\//, '')}`}
                  className="hover:text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {personalInfo.linkedin.replace(/^https?:\/\//, '')}
                </a>
                <span>•</span>
              </>
            )}
            {personalInfo.github && (
              <>
                <a
                  href={`https://${personalInfo.github.replace(/^https?:\/\//, '')}`}
                  className="hover:text-blue-600"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {personalInfo.github.replace(/^https?:\/\//, '')}
                </a>
                <span>•</span>
              </>
            )}
            {personalInfo.portfolio && (
              <a
                href={`https://${personalInfo.portfolio.replace(/^https?:\/\//, '')}`}
                className="hover:text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {personalInfo.portfolio.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Work Experience */}
          {experience.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 border-b-2 border-black pb-1 mb-4 uppercase tracking-wider">
                Work Experience
              </h2>
              {experience.map((exp) => (
                <div key={exp.id} className="mb-6 last:mb-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {exp.organization || 'Company Name'}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {exp.dates || 'Employment Dates'}
                    </span>
                  </div>
                  <p className="text-md italic text-gray-700 mb-3">
                    {exp.position || 'Position Title'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                    {getDisplayedBullets(exp.bullets).map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 border-b-2 border-black pb-1 mb-4 uppercase tracking-wider">
                Projects
              </h2>
              {projects.map((project) => (
                <div key={project.id} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {project.name || 'Project Name'}
                  </h3>
                  {project.technologies && (
                    <p className="text-sm italic text-gray-600 mb-2">
                      Technologies: {project.technologies}
                    </p>
                  )}
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-800">
                    {getDisplayedBullets(project.bullets).map((bullet, index) => (
                      <li key={index} className="leading-relaxed">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          )}

          {/* Skills */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-black pb-1 mb-4 uppercase tracking-wider">
              Skills
            </h2>
            <div className="text-sm space-y-1">
              <div className="space-y-1">
                {skills.programmingLanguages.length > 0 && (
                  <p>
                    <strong>● Programming Languages:</strong> {skills.programmingLanguages.join(', ')}
                  </p>
                )}
                {skills.machineLearning.length > 0 && (
                  <p>
                    <strong>● Machine Learning & Data:</strong> {skills.machineLearning.join(', ')}
                  </p>
                )}
                {skills.softwareAndTools.length > 0 && (
                  <p>
                    <strong>● Software & Tools:</strong> {skills.softwareAndTools.join(', ')}
                  </p>
                )}
                {skills.cloudAndDevOps.length > 0 && (
                  <p>
                    <strong>● Cloud & DevOps:</strong> {skills.cloudAndDevOps.join(', ')}
                  </p>
                )}
                {skills.frameworksAndLibraries.length > 0 && (
                  <p>
                    <strong>● Frameworks & Libraries:</strong> {skills.frameworksAndLibraries.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 border-b-2 border-black pb-1 mb-4 uppercase tracking-wider">
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className="mb-4 last:mb-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {edu.degree || 'Degree'}
                    </h3>
                    <span className="text-sm text-gray-600">
                      {edu.graduationDate || 'Graduation Date'}
                    </span>
                  </div>
                  <p className="text-md italic text-gray-700">
                    {edu.institution || 'Institution Name'}
                  </p>
                  {edu.courses && edu.courses.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Relevant Coursework: </strong>
                      {edu.courses.join(' • ')}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="no-print mt-6 space-y-4">
        {/* Error Message */}
        {pdfState.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{pdfState.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleDownloadPDF}
            disabled={pdfState.isGenerating}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {pdfState.isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <span>📄</span>
                <span>Download Professional PDF</span>
              </>
            )}
          </button>

          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            🖨️ Browser Print
          </button>

          <button
            onClick={() => {
              // Copy resume content to clipboard
              const resumeElement = document.querySelector('.print-page');
              if (resumeElement) {
                const resumeText = resumeElement.textContent;
                navigator.clipboard.writeText(resumeText || '').then(() => {
                  alert('Resume content copied to clipboard!');
                });
              }
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            📋 Copy Text
          </button>
        </div>

        {/* Download Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Professional PDF generation creates an ATS-friendly resume optimized for job applications
            {isOptimized && (
              <span className="block mt-1 text-green-600 font-medium">
                ✨ This PDF will include your AI-optimized content selections
              </span>
            )}
          </p>
        </div>
      </div>

      {/* AI Analysis Badge */}
      {analysis && (
        <div className="no-print mt-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
            <span className="mr-2">🤖</span>
            AI-Optimized for: {analysis.analysis.jobTitle} at {analysis.analysis.company}
            <span className="ml-2 font-semibold">({analysis.matchScore}% match)</span>
          </div>
        </div>
      )}
    </div>
  );
}