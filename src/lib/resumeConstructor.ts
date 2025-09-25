import {
  ResumeData,
  JobAnalysisResponse,
  OptimizedResume,
  BulletPointPool,
  Experience,
  Project
} from './types';
import { generateId, calculateRelevanceScore } from './utils';

export class ResumeConstructor {
  /**
   * Creates an optimized resume based on AI analysis
   */
  static createOptimizedResume(
    originalResume: ResumeData,
    analysis: JobAnalysisResponse,
    bulletPool: BulletPointPool[]
  ): OptimizedResume {
    const optimizedResumeData = this.buildOptimizedResumeData(
      originalResume,
      analysis,
      bulletPool
    );

    return {
      id: generateId(),
      originalResume,
      optimizedResume: optimizedResumeData,
      selectedBullets: analysis.selectedBullets,
      relevanceScore: analysis.matchScore,
      jobAnalysis: analysis.analysis,
      optimizations: {
        skillsHighlighted: analysis.relevantSkills,
        bulletPointsSelected: analysis.selectedBullets.length,
        experienceReordered: false, // TODO: Implement experience reordering
        skillsReordered: true,
      },
      createdAt: new Date(),
      jobTitle: analysis.analysis.jobTitle,
      company: analysis.analysis.company,
    };
  }

  /**
   * Builds the optimized resume data structure
   */
  private static buildOptimizedResumeData(
    originalResume: ResumeData,
    analysis: JobAnalysisResponse,
    bulletPool: BulletPointPool[]
  ): ResumeData {
    return {
      personalInfo: originalResume.personalInfo, // Keep personal info unchanged
      experience: this.optimizeExperience(originalResume.experience, analysis, bulletPool),
      projects: this.optimizeProjects(originalResume.projects, analysis, bulletPool),
      skills: this.optimizeSkills(originalResume.skills, analysis),
      education: originalResume.education, // Keep education unchanged
    };
  }

  /**
   * Optimizes experience section with AI-selected bullet points
   */
  private static optimizeExperience(
    originalExperience: Experience[],
    analysis: JobAnalysisResponse,
    bulletPool: BulletPointPool[]
  ): Experience[] {
    return originalExperience.map((exp, index) => {
      // Find AI-selected bullets for this experience
      const relevantBullets = analysis.selectedBullets.filter(bullet =>
        bullet.experienceId === exp.id.toString() ||
        bullet.experienceId === `experience-${exp.id}` ||
        // If no specific experience mapping, use bullets that match skills
        (!bullet.experienceId && this.bulletMatchesExperience(bullet, exp, analysis))
      );

      // If we have AI-selected bullets, use them; otherwise optimize existing bullets
      let optimizedBullets: string[];

      if (relevantBullets.length > 0) {
        optimizedBullets = relevantBullets.slice(0, 10).map(bullet => bullet.content);
      } else {
        // Score and select best existing bullets based on job requirements
        const scoredBullets = exp.bullets.map(bullet => ({
          content: bullet,
          score: this.scoreBulletForJob(bullet, analysis),
        })).sort((a, b) => b.score - a.score);

        optimizedBullets = scoredBullets.slice(0, 10).map(item => item.content);
      }

      return {
        ...exp,
        bullets: optimizedBullets,
      };
    });
  }

  /**
   * Optimizes projects section
   */
  private static optimizeProjects(
    originalProjects: Project[],
    analysis: JobAnalysisResponse,
    bulletPool: BulletPointPool[]
  ): Project[] {
    return originalProjects.map(project => {
      // Find project-specific bullets
      const relevantBullets = analysis.selectedBullets.filter(bullet =>
        bullet.experienceId === `project-${project.id}` ||
        bullet.category === 'project'
      );

      let optimizedBullets: string[];

      if (relevantBullets.length > 0) {
        optimizedBullets = relevantBullets.slice(0, 8).map(bullet => bullet.content);
      } else {
        // Score existing project bullets
        const scoredBullets = project.bullets.map(bullet => ({
          content: bullet,
          score: this.scoreBulletForJob(bullet, analysis),
        })).sort((a, b) => b.score - a.score);

        optimizedBullets = scoredBullets.slice(0, 8).map(item => item.content);
      }

      return {
        ...project,
        bullets: optimizedBullets,
      };
    });
  }

  /**
   * Optimizes skills section based on job relevance
   */
  private static optimizeSkills(
    originalSkills: ResumeData['skills'],
    analysis: JobAnalysisResponse
  ): ResumeData['skills'] {
    const allSkills = [
      ...originalSkills.programmingLanguages,
      ...originalSkills.frameworksAndLibraries,
      ...originalSkills.softwareAndTools,
      ...originalSkills.cloudAndDevOps,
      ...originalSkills.machineLearning,
      ...originalSkills.softSkills,
    ];

    // Score skills based on job requirements
    const scoredSkills = allSkills.map(skill => ({
      skill,
      score: this.scoreSkillForJob(skill, analysis),
      category: this.categorizeSkill(skill, originalSkills),
    })).sort((a, b) => b.score - a.score);

    // Reorganize skills by relevance while maintaining categories
    const optimizedSkills = {
      programmingLanguages: this.getSkillsByCategory(scoredSkills, 'programmingLanguages', originalSkills),
      frameworksAndLibraries: this.getSkillsByCategory(scoredSkills, 'frameworksAndLibraries', originalSkills),
      softwareAndTools: this.getSkillsByCategory(scoredSkills, 'softwareAndTools', originalSkills),
      cloudAndDevOps: this.getSkillsByCategory(scoredSkills, 'cloudAndDevOps', originalSkills),
      machineLearning: this.getSkillsByCategory(scoredSkills, 'machineLearning', originalSkills),
      softSkills: this.getSkillsByCategory(scoredSkills, 'softSkills', originalSkills),
    };

    return optimizedSkills;
  }

  /**
   * Checks if a bullet point matches an experience context
   */
  private static bulletMatchesExperience(
    bullet: BulletPointPool,
    experience: Experience,
    analysis: JobAnalysisResponse
  ): boolean {
    const expSkills = bullet.skills;
    const jobSkills = [...analysis.analysis.requiredSkills, ...analysis.analysis.preferredSkills];

    // Check if bullet skills overlap with job requirements
    return expSkills.some(skill =>
      jobSkills.some(jobSkill =>
        skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
  }

  /**
   * Scores a bullet point for job relevance
   */
  private static scoreBulletForJob(bullet: string, analysis: JobAnalysisResponse): number {
    const jobKeywords = [
      ...analysis.analysis.requiredSkills,
      ...analysis.analysis.preferredSkills,
      ...analysis.analysis.keywords,
    ].map(k => k.toLowerCase());

    const bulletWords = bullet.toLowerCase().split(/\s+/);
    const matches = bulletWords.filter(word =>
      jobKeywords.some(keyword =>
        keyword.includes(word) || word.includes(keyword)
      )
    );

    return (matches.length / bulletWords.length) * 100;
  }

  /**
   * Scores a skill for job relevance
   */
  private static scoreSkillForJob(skill: string, analysis: JobAnalysisResponse): number {
    const requiredSkills = analysis.analysis.requiredSkills.map(s => s.toLowerCase());
    const preferredSkills = analysis.analysis.preferredSkills.map(s => s.toLowerCase());
    const skillLower = skill.toLowerCase();

    if (requiredSkills.some(req => req.includes(skillLower) || skillLower.includes(req))) {
      return 100; // Required skill
    }
    if (preferredSkills.some(pref => pref.includes(skillLower) || skillLower.includes(pref))) {
      return 75; // Preferred skill
    }
    return 25; // Other skill
  }

  /**
   * Categorizes a skill into its original category
   */
  private static categorizeSkill(skill: string, originalSkills: ResumeData['skills']): keyof ResumeData['skills'] {
    if (originalSkills.programmingLanguages.includes(skill)) return 'programmingLanguages';
    if (originalSkills.frameworksAndLibraries.includes(skill)) return 'frameworksAndLibraries';
    if (originalSkills.softwareAndTools.includes(skill)) return 'softwareAndTools';
    if (originalSkills.cloudAndDevOps.includes(skill)) return 'cloudAndDevOps';
    if (originalSkills.machineLearning.includes(skill)) return 'machineLearning';
    if (originalSkills.softSkills.includes(skill)) return 'softSkills';
    return 'softwareAndTools'; // Default category
  }

  /**
   * Gets skills for a specific category, sorted by relevance
   */
  private static getSkillsByCategory(
    scoredSkills: Array<{skill: string; score: number; category: keyof ResumeData['skills']}>,
    category: keyof ResumeData['skills'],
    originalSkills: ResumeData['skills']
  ): string[] {
    return scoredSkills
      .filter(item => item.category === category)
      .map(item => item.skill);
  }

  /**
   * Generates a comparison between original and optimized resume
   */
  static generateComparison(optimizedResume: OptimizedResume) {
    const changes = {
      bulletPointsChanged: 0,
      skillsReordered: optimizedResume.optimizations.skillsReordered,
      topSkillsHighlighted: optimizedResume.optimizations.skillsHighlighted.slice(0, 5),
      matchScoreImprovement: optimizedResume.relevanceScore,
    };

    // Count bullet point changes
    optimizedResume.originalResume.experience.forEach((origExp, index) => {
      const optExp = optimizedResume.optimizedResume.experience[index];
      if (optExp && JSON.stringify(origExp.bullets) !== JSON.stringify(optExp.bullets)) {
        changes.bulletPointsChanged++;
      }
    });

    return changes;
  }
}