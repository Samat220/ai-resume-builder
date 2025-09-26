// Enhanced types for AI-powered resume builder

export interface BulletPointPool {
  id: string;
  category: 'technical' | 'leadership' | 'achievement' | 'project' | 'soft-skill';
  content: string;
  skills: string[];
  impact?: string;
  relevanceScore?: number;
  experienceId?: string; // Links to specific experience/project
}

export interface Experience {
  id: number;
  organization: string;
  position: string;
  dates: string;
  bullets: string[];
  allBullets?: BulletPointPool[]; // Pool of all available bullets for this experience
}

export interface Project {
  id: number;
  name: string;
  technologies: string;
  bullets: string[];
  allBullets?: BulletPointPool[]; // Pool of all available bullets for this project
}

export interface Education {
  id: number;
  degree: string;
  institution: string;
  graduationDate: string;
  courses: string[];
  bullets?: string[];
}

export interface Skills {
  programmingLanguages: string[];
  machineLearning: string[];
  softwareAndTools: string[];
  cloudAndDevOps: string[];
  frameworksAndLibraries: string[];
  softSkills: string[];
}

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  linkedin: string;
  github: string;
  portfolio: string;
  phone?: string;
  location?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  projects: Project[];
  skills: Skills;
  education: Education[];
}

// AI Analysis interfaces
export interface JobAnalysis {
  id: string;
  jobTitle: string;
  company: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  seniority: 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  industry: string;
  technicalFocus: string[];
  leadershipLevel: 'individual' | 'team-lead' | 'manager' | 'director';
}

export interface JobAnalysisRequest {
  jobDescription: string;
  userSkills: string[];
  availableBullets: BulletPointPool[];
}

// Enhanced ranking interfaces for new AI system
export interface RankedBullet {
  bulletId: string;
  relevanceScore: number;
  reasoning: string;
}

export interface RankedSkill {
  skill: string;
  relevanceScore: number;
}

export interface RankedSkillCategories {
  programmingLanguages: RankedSkill[];
  frameworks: RankedSkill[];
  tools: RankedSkill[];
  others: RankedSkill[];
}

export interface EnhancedJobAnalysisResponse {
  analysis: JobAnalysis;
  rankedBullets: RankedBullet[];
  rankedSkills: RankedSkillCategories;
  matchScore: number;
  recommendations: string[];
  optimizationSuggestions: string[];
}

// Legacy interface for backward compatibility
export interface JobAnalysisResponse {
  analysis: JobAnalysis;
  selectedBullets: BulletPointPool[];
  relevantSkills: string[];
  matchScore: number;
  recommendations: string[];
  optimizationSuggestions: string[];
}

export interface OptimizedResume {
  id: string;
  originalResume: ResumeData;
  optimizedResume: ResumeData;
  selectedBullets: BulletPointPool[];
  relevanceScore: number;
  jobAnalysis: JobAnalysis;
  optimizations: {
    skillsHighlighted: string[];
    bulletPointsSelected: number;
    experienceReordered: boolean;
    skillsReordered: boolean;
  };
  createdAt: Date;
  jobTitle: string;
  company: string;
}

// User profile for storing all data
export interface UserProfile {
  id: string;
  personalInfo: PersonalInfo;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: Skills;
  bulletPointPool: BulletPointPool[];
  savedResumes: OptimizedResume[];
  createdAt: Date;
  updatedAt: Date;
}

// Template and formatting types
export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  layout: 'single-column' | 'two-column' | 'modern' | 'traditional';
  colorScheme: 'black-white' | 'blue-accent' | 'minimal-color';
  isATSFriendly: boolean;
}

export interface FormattingOptions {
  template: ResumeTemplate;
  fontSize: 'small' | 'medium' | 'large';
  margin: 'tight' | 'standard' | 'loose';
  lineSpacing: 'compact' | 'standard' | 'relaxed';
  maxBulletPoints: number;
}

// Dynamic resume building interfaces
export interface PageSpaceEstimate {
  totalAvailableLines: number;
  usedLines: number;
  remainingLines: number;
  canFitMoreContent: boolean;
}

export interface DynamicResumeRequest {
  originalResume: ResumeData;
  rankedContent: EnhancedJobAnalysisResponse;
  bulletPool: BulletPointPool[];
  maxJobs?: number; // Default 2
  minBulletsPerJob?: number; // Default 3
}

export interface OptimizedResumeContent {
  resumeData: ResumeData;
  usedBullets: string[];
  selectedProjectId?: number;
  pageSpaceUsed: PageSpaceEstimate;
  optimizationDetails: {
    totalBulletsAdded: number;
    skillsReordered: boolean;
    projectSelected: boolean;
    jobsPrioritized: boolean;
  };
}