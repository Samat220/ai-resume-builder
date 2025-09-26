import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { ResumeData, JobAnalysisResponse, EnhancedJobAnalysisResponse, DynamicResumeRequest } from '@/lib/types';
import { DynamicResumeBuilder } from '@/lib/dynamicResumeBuilder';
import { BulletPointOptimizer } from '@/lib/bulletPointOptimizer';
import { initialBulletPointPool } from '@/lib/initialData';

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, maxRequests = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}

function validateInput(data: unknown): data is {
  resumeData: ResumeData;
  analysis?: JobAnalysisResponse;
  enhancedAnalysis?: EnhancedJobAnalysisResponse;
  isOptimized?: boolean
} {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.resumeData === 'object' &&
    obj.resumeData !== null
  );
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';

    // Apply rate limiting (5 PDFs per minute)
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many PDF generation requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();

    if (!validateInput(body)) {
      return NextResponse.json(
        { error: 'Invalid resume data provided' },
        { status: 400 }
      );
    }

    const { resumeData, analysis, enhancedAnalysis, isOptimized } = body;

    let optimizedResumeData: ResumeData;

    // Use new dynamic system if enhanced analysis is available
    if (enhancedAnalysis && isOptimized) {
      console.log('Using dynamic resume builder with AI rankings');
      const dynamicRequest: DynamicResumeRequest = {
        originalResume: resumeData,
        rankedContent: enhancedAnalysis,
        bulletPool: initialBulletPointPool,
        maxJobs: 2,
        minBulletsPerJob: 3
      };

      const optimizedContent = DynamicResumeBuilder.buildOptimizedResume(dynamicRequest);
      optimizedResumeData = optimizedContent.resumeData;

      console.log(`Dynamic optimization: ${optimizedContent.optimizationDetails.totalBulletsAdded} bullets, ${optimizedContent.pageSpaceUsed.usedLines}/${optimizedContent.pageSpaceUsed.totalAvailableLines} lines used`);
    } else {
      // Fallback to old system for backward compatibility
      console.log('Using legacy bullet point optimizer');
      optimizedResumeData = BulletPointOptimizer.optimizeBulletsForSinglePage(
        resumeData,
        initialBulletPointPool
      );
    }

    // Generate HTML for the resume
    const html = generateResumeHTML(optimizedResumeData, analysis, isOptimized);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();

    // Set the HTML content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 10000
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.3in',
        right: '0.5in',
        bottom: '0.3in',
        left: '0.5in',
      },
      displayHeaderFooter: false,
    });

    await browser.close();

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = isOptimized
      ? `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume_AI_Optimized_${timestamp}.pdf`
      : `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume_${timestamp}.pdf`;

    // Return PDF as response
    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

function generateResumeHTML(resumeData: ResumeData, analysis?: JobAnalysisResponse, isOptimized?: boolean): string {
  const { personalInfo, experience, projects, skills, education } = resumeData;

  const getHighlightedSkills = () => {
    if (!analysis || !isOptimized) {
      return [
        ...skills.programmingLanguages,
        ...skills.frameworksAndLibraries,
        ...skills.softwareAndTools,
        ...skills.cloudAndDevOps,
      ];
    }
    return analysis.relevantSkills;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - ${personalInfo.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      line-height: 1.3;
      color: #000000;
      background: white;
      font-size: 10.5pt;
    }

    .resume-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0;
      background: white;
      min-height: 11in;
    }

    .header {
      text-align: center;
      margin-bottom: 8px;
      padding-bottom: 0px;
    }

    .name {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 3px;
      color: #000000;
    }

    .title {
      font-size: 11pt;
      color: #333333;
      margin-bottom: 6px;
    }

    .contact-info {
      font-size: 9.5pt;
      color: #333333;
    }

    .contact-info a {
      color: #333333;
      text-decoration: none;
    }

    .section {
      margin-bottom: 12px;
    }

    .section-title {
      font-size: 11pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 1px;
      margin-bottom: 8px;
      text-align: center;
    }

    .experience-item, .project-item, .education-item {
      margin-bottom: 4px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .organization, .project-name, .degree {
      font-size: 10.5pt;
      font-weight: bold;
    }

    .dates {
      font-size: 9.5pt;
      color: #333333;
    }

    .position, .institution {
      font-size: 10.5pt;
      font-style: italic;
      margin-bottom: 2px;
      color: #333333;
    }

    .technologies {
      font-size: 9.5pt;
      color: #666666;
      font-style: italic;
      margin-bottom: 2px;
    }

    .bullet-list {
      list-style: disc;
      margin-left: 16px;
    }

    .bullet-list li {
      font-size: 9.5pt;
      margin-bottom: 1px;
      line-height: 1.25;
    }

    .skills-grid {
      font-size: 9.5pt;
    }

    .skills-category {
      margin-bottom: 2px;
    }

    .skills-category strong {
      font-weight: bold;
    }


    .page-break {
      page-break-after: always;
    }

    @media print {
      .resume-container {
        padding: 0;
      }

      .section {
        break-inside: avoid;
      }

      .experience-item, .project-item {
        break-inside: avoid;
        margin-bottom: 6px;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <header class="header">
      <h1 class="name">${personalInfo.name}</h1>
      <p class="title">${personalInfo.title}</p>
      <div class="contact-info">
        ${personalInfo.email}
        ${personalInfo.phone ? ` • ${personalInfo.phone}` : ''}
        ${personalInfo.linkedin ? ` • ${personalInfo.linkedin}` : ''}
        ${personalInfo.github ? ` • ${personalInfo.github}` : ''}
        ${personalInfo.portfolio ? ` • ${personalInfo.portfolio}` : ''}
      </div>
    </header>

    <!-- Experience Section -->
    ${experience.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Work Experience</h2>
      ${experience.map(exp => `
        <div class="experience-item">
          <div class="item-header">
            <div class="organization">${exp.organization}, ${exp.position}</div>
            <div class="dates">${exp.dates}</div>
          </div>
          <ul class="bullet-list">
            ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Projects Section -->
    ${projects.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Projects</h2>
      ${projects.map(project => `
        <div class="project-item">
          <div class="project-name">${project.name}</div>
          ${project.technologies ? `<div class="technologies">Technologies: ${project.technologies}</div>` : ''}
          <ul class="bullet-list">
            ${project.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </section>
    ` : ''}

    <!-- Skills Section -->
    <section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">
        ${skills.programmingLanguages.length > 0 ? `
          <div class="skills-category">
            <strong>● Programming Languages:</strong> ${skills.programmingLanguages.join(', ')}
          </div>
        ` : ''}
        ${skills.machineLearning.length > 0 ? `
          <div class="skills-category">
            <strong>● Machine Learning & Data:</strong> ${skills.machineLearning.join(', ')}
          </div>
        ` : ''}
        ${skills.softwareAndTools.length > 0 ? `
          <div class="skills-category">
            <strong>● Software & Tools:</strong> ${skills.softwareAndTools.join(', ')}
          </div>
        ` : ''}
        ${skills.cloudAndDevOps.length > 0 ? `
          <div class="skills-category">
            <strong>● Cloud & DevOps:</strong> ${skills.cloudAndDevOps.join(', ')}
          </div>
        ` : ''}
        ${skills.frameworksAndLibraries.length > 0 ? `
          <div class="skills-category">
            <strong>● Frameworks & Libraries:</strong> ${skills.frameworksAndLibraries.join(', ')}
          </div>
        ` : ''}
      </div>
    </section>

    <!-- Education Section -->
    ${education.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${education.map(edu => `
        <div class="education-item">
          <div class="item-header">
            <div class="degree">${edu.degree}</div>
            <div class="dates">${edu.graduationDate}</div>
          </div>
          <div class="institution">${edu.institution}</div>
          ${edu.courses && edu.courses.length > 0 ? `
            <div class="technologies">Relevant Courses: ${edu.courses.join(', ')}</div>
          ` : ''}
          ${edu.bullets && edu.bullets.length > 0 ? `
            <ul class="bullet-list">
              ${edu.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </section>
    ` : ''}
  </div>
</body>
</html>
  `;
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}