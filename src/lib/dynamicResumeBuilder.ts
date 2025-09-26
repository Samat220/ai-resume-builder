import {
  ResumeData,
  Experience,
  Project,
  Skills,
  BulletPointPool,
  EnhancedJobAnalysisResponse,
  DynamicResumeRequest,
  OptimizedResumeContent,
  PageSpaceEstimate,
  RankedBullet,
  RankedSkill
} from './types';

export class DynamicResumeBuilder {
  // Page constraints (based on compact PDF layout)
  private static readonly TOTAL_PAGE_LINES = 62; // Estimated lines on one page
  private static readonly STATIC_CONTENT_LINES = 12; // Header + education lines
  private static readonly PROJECT_HEADER_LINES = 2; // Project title + tech
  private static readonly JOB_HEADER_LINES = 2; // Company + position
  private static readonly SKILLS_SECTION_LINES = 8; // Skills section
  private static readonly SECTION_HEADER_LINES = 1; // Each section title
  private static readonly MAX_BULLETS_PER_JOB = 6; // Maximum bullets per job for balance

  /**
   * Builds an optimized resume using AI rankings and dynamic page filling
   */
  static buildOptimizedResume(request: DynamicResumeRequest): OptimizedResumeContent {
    const { originalResume, rankedContent, bulletPool } = request;
    const maxJobs = request.maxJobs || 2;
    const minBulletsPerJob = request.minBulletsPerJob || 3;

    // Step 1: Initialize with static content
    let optimizedResume: ResumeData = {
      personalInfo: originalResume.personalInfo,
      education: originalResume.education,
      experience: [],
      projects: [],
      skills: {} as Skills
    };

    let usedLines = this.STATIC_CONTENT_LINES + this.SKILLS_SECTION_LINES;
    let usedBullets: string[] = [];

    // Step 2: Add most relevant project
    const selectedProject = this.selectBestProject(originalResume.projects, rankedContent);
    if (selectedProject) {
      optimizedResume.projects = [selectedProject];
      usedLines += this.PROJECT_HEADER_LINES + this.SECTION_HEADER_LINES;
      usedLines += selectedProject.bullets.length; // Project bullets
    }

    // Step 3: Add jobs with minimum bullets
    const jobsToInclude = originalResume.experience.slice(0, maxJobs);
    usedLines += this.SECTION_HEADER_LINES; // Experience section header

    for (const job of jobsToInclude) {
      // Find ranked bullets for this job
      const jobBullets = this.getRankedBulletsForJob(job, rankedContent.rankedBullets, bulletPool);

      // Add minimum bullets
      const minBullets = jobBullets.slice(0, minBulletsPerJob);
      const optimizedJob: Experience = {
        ...job,
        bullets: minBullets.map(b => b.content)
      };

      optimizedResume.experience.push(optimizedJob);
      usedBullets.push(...minBullets.map(b => b.bulletId));

      usedLines += this.JOB_HEADER_LINES + minBulletsPerJob;
    }

    // Step 4: Fill remaining space with bullets, respecting per-job limits
    const remainingLines = this.TOTAL_PAGE_LINES - usedLines;

    if (remainingLines > 0) {
      let bulletsAdded = 0;

      // First, try to add bullets to most recent job (up to 6 total)
      const mostRecentJob = optimizedResume.experience[0];
      if (mostRecentJob && mostRecentJob.bullets.length < this.MAX_BULLETS_PER_JOB) {
        const jobBullets = this.getRankedBulletsForJob(
          jobsToInclude[0],
          rankedContent.rankedBullets,
          bulletPool
        );

        const maxAdditionalForFirstJob = this.MAX_BULLETS_PER_JOB - mostRecentJob.bullets.length;
        for (let i = minBulletsPerJob; i < jobBullets.length && bulletsAdded < Math.min(remainingLines, maxAdditionalForFirstJob); i++) {
          const bullet = jobBullets[i];
          if (!usedBullets.includes(bullet.bulletId)) {
            mostRecentJob.bullets.push(bullet.content);
            usedBullets.push(bullet.bulletId);
            bulletsAdded++;
          }
        }
      }

      // If still have space and a second job exists, add bullets to it
      const secondJob = optimizedResume.experience[1];
      if (secondJob && bulletsAdded < remainingLines && secondJob.bullets.length < this.MAX_BULLETS_PER_JOB) {
        const jobBullets = this.getRankedBulletsForJob(
          jobsToInclude[1],
          rankedContent.rankedBullets,
          bulletPool
        );

        const maxAdditionalForSecondJob = this.MAX_BULLETS_PER_JOB - secondJob.bullets.length;
        const remainingSpace = remainingLines - bulletsAdded;

        for (let i = minBulletsPerJob; i < jobBullets.length && bulletsAdded < remainingLines && (secondJob.bullets.length < this.MAX_BULLETS_PER_JOB); i++) {
          const bullet = jobBullets[i];
          if (!usedBullets.includes(bullet.bulletId)) {
            secondJob.bullets.push(bullet.content);
            usedBullets.push(bullet.bulletId);
            bulletsAdded++;
          }
        }
      }

      usedLines += bulletsAdded;
    }

    // Step 5: Order skills by relevance
    optimizedResume.skills = this.buildRankedSkills(originalResume.skills, rankedContent.rankedSkills);

    // Step 6: Calculate final page space usage
    const pageSpaceUsed: PageSpaceEstimate = {
      totalAvailableLines: this.TOTAL_PAGE_LINES,
      usedLines,
      remainingLines: this.TOTAL_PAGE_LINES - usedLines,
      canFitMoreContent: (this.TOTAL_PAGE_LINES - usedLines) > 2
    };

    return {
      resumeData: optimizedResume,
      usedBullets,
      selectedProjectId: selectedProject?.id,
      pageSpaceUsed,
      optimizationDetails: {
        totalBulletsAdded: usedBullets.length,
        skillsReordered: true,
        projectSelected: !!selectedProject,
        jobsPrioritized: true
      }
    };
  }

  /**
   * Selects the most relevant project based on AI rankings
   */
  private static selectBestProject(
    projects: Project[],
    rankedContent: EnhancedJobAnalysisResponse
  ): Project | null {
    if (projects.length === 0) return null;

    // For now, rank projects by how many of their skills match job requirements
    const projectScores = projects.map(project => {
      const techSkills = project.technologies?.split(/[,\s]+/) || [];
      const skillMatches = techSkills.filter(skill =>
        [...rankedContent.analysis.requiredSkills, ...rankedContent.analysis.preferredSkills]
          .some(reqSkill =>
            skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
            reqSkill.toLowerCase().includes(skill.toLowerCase())
          )
      ).length;

      return { project, score: skillMatches };
    });

    const bestProject = projectScores.sort((a, b) => b.score - a.score)[0];
    return bestProject.project;
  }

  /**
   * Gets ranked bullets for a specific job
   */
  private static getRankedBulletsForJob(
    job: Experience,
    rankedBullets: RankedBullet[],
    bulletPool: BulletPointPool[]
  ): Array<{bulletId: string, content: string, relevanceScore: number}> {
    // Combine original bullets with bullet pool bullets for this job
    const allBullets: Array<{bulletId: string, content: string, relevanceScore: number}> = [];

    // Add original job bullets with AI rankings
    job.bullets.forEach((bullet, index) => {
      const ranking = rankedBullets.find(rb => rb.bulletId === `${job.id}-${index}`);
      allBullets.push({
        bulletId: `${job.id}-${index}`,
        content: bullet,
        relevanceScore: ranking?.relevanceScore || 50 // Default score if not ranked
      });
    });

    // Add bullet pool bullets for this job
    bulletPool
      .filter(bp => bp.experienceId === job.id.toString())
      .forEach(bp => {
        const ranking = rankedBullets.find(rb => rb.bulletId === bp.id);
        allBullets.push({
          bulletId: bp.id,
          content: bp.content,
          relevanceScore: ranking?.relevanceScore || 30 // Lower default for pool bullets
        });
      });

    // Sort by relevance score (highest first)
    return allBullets.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Builds skills section ordered by AI relevance rankings
   */
  private static buildRankedSkills(
    originalSkills: Skills,
    rankedSkills: any
  ): Skills {
    // Map AI ranked skills back to original categories
    const programmingLanguages = this.reorderSkillsByRanking(
      originalSkills.programmingLanguages,
      rankedSkills.programmingLanguages || []
    );

    const frameworksAndLibraries = this.reorderSkillsByRanking(
      originalSkills.frameworksAndLibraries,
      rankedSkills.frameworks || []
    );

    const softwareAndTools = this.reorderSkillsByRanking(
      originalSkills.softwareAndTools,
      rankedSkills.tools || []
    );

    const cloudAndDevOps = this.reorderSkillsByRanking(
      originalSkills.cloudAndDevOps,
      rankedSkills.others || []
    );

    const machineLearning = this.reorderSkillsByRanking(
      originalSkills.machineLearning,
      rankedSkills.others || []
    );

    return {
      programmingLanguages,
      frameworksAndLibraries,
      softwareAndTools,
      cloudAndDevOps,
      machineLearning,
      softSkills: originalSkills.softSkills // Keep soft skills as-is
    };
  }

  /**
   * Reorders skills within a category by AI relevance ranking
   */
  private static reorderSkillsByRanking(
    originalSkills: string[],
    rankedSkills: RankedSkill[]
  ): string[] {
    const skillRankMap = new Map(rankedSkills.map(rs => [rs.skill.toLowerCase(), rs.relevanceScore]));

    return originalSkills
      .map(skill => ({
        skill,
        score: skillRankMap.get(skill.toLowerCase()) || 0
      }))
      .sort((a, b) => b.score - a.score)
      .map(item => item.skill);
  }

  /**
   * Estimates remaining page space for additional content
   */
  static estimateRemainingSpace(resumeData: ResumeData): number {
    let usedLines = this.STATIC_CONTENT_LINES + this.SKILLS_SECTION_LINES;

    // Count experience lines
    if (resumeData.experience.length > 0) {
      usedLines += this.SECTION_HEADER_LINES;
      resumeData.experience.forEach(exp => {
        usedLines += this.JOB_HEADER_LINES + exp.bullets.length;
      });
    }

    // Count project lines
    if (resumeData.projects.length > 0) {
      usedLines += this.SECTION_HEADER_LINES;
      resumeData.projects.forEach(project => {
        usedLines += this.PROJECT_HEADER_LINES + project.bullets.length;
      });
    }

    return Math.max(0, this.TOTAL_PAGE_LINES - usedLines);
  }
}