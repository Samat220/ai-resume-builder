"use client";

import { useState } from 'react';
import { ResumeData, Experience } from '@/lib/types';
import { isValidEmail } from '@/lib/utils';

interface ProfileEditorProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  isOptimized?: boolean;
}

export default function ProfileEditor({ resumeData, setResumeData, isOptimized }: ProfileEditorProps) {
  const [activeSection, setActiveSection] = useState<string>('personal');

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now(),
      organization: '',
      position: '',
      dates: '',
      bullets: [''],
    };

    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExperience],
    });
  };

  const updateExperience = (index: number, field: string, value: string | string[]) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value,
    };

    setResumeData({
      ...resumeData,
      experience: updatedExperience,
    });
  };

  const removeExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index),
    });
  };


  const updateSkills = (category: string, skills: string[]) => {
    setResumeData({
      ...resumeData,
      skills: {
        ...resumeData.skills,
        [category]: skills,
      },
    });
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '🚀' },
    { id: 'skills', label: 'Skills', icon: '🛠️' },
    { id: 'education', label: 'Education', icon: '🎓' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Section Navigation */}
      <div className="lg:col-span-1">
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{section.icon}</span>
              <span className="font-medium">{section.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div className="lg:col-span-3">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.title}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Software Developer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                      resumeData.personalInfo.email && !isValidEmail(resumeData.personalInfo.email)
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone || ''}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.github}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="github.com/johndoe"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Portfolio Website
                  </label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.portfolio}
                    onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="johndoe.com"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Work Experience</h2>
                <button
                  onClick={addExperience}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Experience
                </button>
              </div>
              <div className="space-y-6">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium">Experience {index + 1}</h3>
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company *
                        </label>
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => updateExperience(index, 'organization', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Acme Corp"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Position *
                        </label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dates *
                        </label>
                        <input
                          type="text"
                          value={exp.dates}
                          onChange={(e) => updateExperience(index, 'dates', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Jan 2020 - Present"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'skills' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Skills</h2>
              {Object.entries(resumeData.skills).map(([category, skills]) => (
                <div key={category}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <input
                    type="text"
                    value={skills.join(', ')}
                    onChange={(e) => updateSkills(category, e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Skill1, Skill2, Skill3"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
                </div>
              ))}
            </div>
          )}

          {/* Add similar sections for projects and education... */}
        </div>
      </div>
    </div>
  );
}