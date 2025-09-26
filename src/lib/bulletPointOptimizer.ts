import { ResumeData, BulletPointPool, Experience } from './types';

interface BulletAllocation {
  experienceId: number;
  bulletCount: number;
  priority: number;
}

export class BulletPointOptimizer {
  /**
   * Optimizes bullet point allocation to fit single page while maximizing content
   * and prioritizing recent experience
   */
  static optimizeBulletsForSinglePage(
    resumeData: ResumeData,
    bulletPool: BulletPointPool[]
  ): ResumeData {
    // Optimized single-page limits to maximize content density
    const MAX_TOTAL_BULLETS = 18; // Experience + Projects + Education combined
    const MIN_BULLETS_PER_JOB = 4;

    // Calculate allocation strategy
    const allocation = this.calculateOptimalAllocation(
      resumeData.experience,
      MAX_TOTAL_BULLETS,
      MIN_BULLETS_PER_JOB
    );

    // Apply allocation to experience
    const optimizedExperience = resumeData.experience.map(exp => {
      const targetCount = allocation.find(a => a.experienceId === exp.id)?.bulletCount || MIN_BULLETS_PER_JOB;
      return this.selectBestBullets(exp, bulletPool, targetCount);
    });

    // Allow more bullets for projects (4 bullets max)
    const optimizedProjects = resumeData.projects.map(project => ({
      ...project,
      bullets: project.bullets.slice(0, 4)
    }));

    return {
      ...resumeData,
      experience: optimizedExperience,
      projects: optimizedProjects
    };
  }

  /**
   * Calculates optimal bullet allocation across jobs
   */
  private static calculateOptimalAllocation(
    experiences: Experience[],
    maxTotalBullets: number,
    minBulletsPerJob: number
  ): BulletAllocation[] {
    const totalJobs = experiences.length;
    const minTotalBullets = totalJobs * minBulletsPerJob;
    const extraBullets = Math.max(0, maxTotalBullets - minTotalBullets);

    // Sort by priority (most recent first)
    const prioritizedJobs = experiences.map((exp, index) => ({
      experienceId: exp.id,
      bulletCount: minBulletsPerJob,
      priority: experiences.length - index, // Higher number = higher priority
      availableBullets: exp.bullets.length
    }));

    // Distribute extra bullets to highest priority jobs first
    let remainingExtra = extraBullets;

    // Sort by priority (highest first) and distribute extra bullets
    prioritizedJobs
      .sort((a, b) => b.priority - a.priority)
      .forEach(job => {
        if (remainingExtra > 0) {
          const maxAdditional = Math.min(
            remainingExtra,
            job.availableBullets - job.bulletCount,
            3 // Cap additional bullets per job at 3 for better density
          );
          job.bulletCount += maxAdditional;
          remainingExtra -= maxAdditional;
        }
      });

    return prioritizedJobs;
  }

  /**
   * Selects the best bullets for a specific experience
   */
  private static selectBestBullets(
    experience: Experience,
    bulletPool: BulletPointPool[],
    targetCount: number
  ): Experience {
    // Get additional bullets from pool for this experience
    const additionalBullets = bulletPool
      .filter(bullet => bullet.experienceId === experience.id.toString())
      .sort((a, b) => {
        // Priority: impact significance, then skill relevance
        const impactScore = (bullet: BulletPointPool) => {
          if (bullet.impact?.includes('%')) return 3;
          if (bullet.impact?.includes('improvement') || bullet.impact?.includes('reduction')) return 2;
          return 1;
        };
        return impactScore(b) - impactScore(a);
      });

    // Combine original bullets with additional ones
    const allAvailableBullets = [
      ...experience.bullets,
      ...additionalBullets.map(b => b.content)
    ];

    // Select top bullets up to target count
    const selectedBullets = allAvailableBullets.slice(0, targetCount);

    return {
      ...experience,
      bullets: selectedBullets
    };
  }

  /**
   * Estimates if content will fit on single page (conservative)
   */
  static estimatePageFit(resumeData: ResumeData): boolean {
    const totalBullets = resumeData.experience.reduce((sum, exp) => sum + exp.bullets.length, 0) +
                        resumeData.projects.reduce((sum, proj) => sum + proj.bullets.length, 0) +
                        (resumeData.education[0]?.bullets?.length || 0);

    // Optimized estimate: 18 bullets max for single page with compact layout
    return totalBullets <= 18;
  }
}