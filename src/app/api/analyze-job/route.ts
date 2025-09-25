import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { JobAnalysisRequest, JobAnalysisResponse, JobAnalysis, BulletPointPool } from '@/lib/types';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Simple rate limiting function
function rateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
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

// Input validation function
function validateInput(data: unknown): data is JobAnalysisRequest {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.jobDescription === 'string' &&
    obj.jobDescription.trim().length > 0 &&
    obj.jobDescription.length < 50000 &&
    Array.isArray(obj.userSkills) &&
    Array.isArray(obj.availableBullets)
  );
}

// Sanitize input to prevent injection attacks
function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 50000); // Limit length
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Debug: Log API key status (first and last 4 characters for security)
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key status:', apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : 'NOT_SET');

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';

    // Apply rate limiting
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();

    if (!validateInput(body)) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const { jobDescription, userSkills, availableBullets }: JobAnalysisRequest = body;

    // Sanitize inputs
    const sanitizedDescription = sanitizeInput(jobDescription);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create analysis prompt
    const analysisPrompt = `
Analyze this job description and provide structured analysis:

Job Description:
${sanitizedDescription}

Available User Skills: ${userSkills.join(', ')}

Available Bullet Points:
${availableBullets.map((bullet, idx) =>
  `${idx + 1}. [${bullet.category}] ${bullet.content} (Skills: ${bullet.skills.join(', ')})`
).join('\n')}

Please provide analysis in the following JSON format:
{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "keywords": ["keyword1", "keyword2"],
  "seniority": "entry|junior|mid|senior|lead|principal",
  "industry": "industry name",
  "technicalFocus": ["area1", "area2"],
  "leadershipLevel": "individual|team-lead|manager|director",
  "selectedBulletIds": ["bullet_id1", "bullet_id2"],
  "relevantSkills": ["skill1", "skill2"],
  "matchScore": 85,
  "recommendations": ["recommendation1", "recommendation2"],
  "optimizationSuggestions": ["suggestion1", "suggestion2"]
}

Focus on:
1. Extract key technical skills and requirements
2. Identify seniority level and leadership expectations
3. Select the 5 most relevant bullet points from the available list
4. Calculate match score (0-100) based on skill alignment
5. Provide actionable recommendations for optimization
`;

    // Get AI analysis
    const result = await model.generateContent(analysisPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response from AI
    let analysisData;
    try {
      // Extract JSON from the response (AI might include extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return NextResponse.json(
        { error: 'Failed to analyze job description' },
        { status: 500 }
      );
    }

    // Create structured response
    const jobAnalysis: JobAnalysis = {
      id: `analysis_${Date.now()}`,
      jobTitle: analysisData.jobTitle || 'Unknown Position',
      company: analysisData.company || 'Unknown Company',
      description: sanitizedDescription,
      requiredSkills: analysisData.requiredSkills || [],
      preferredSkills: analysisData.preferredSkills || [],
      keywords: analysisData.keywords || [],
      seniority: analysisData.seniority || 'mid',
      industry: analysisData.industry || 'Technology',
      technicalFocus: analysisData.technicalFocus || [],
      leadershipLevel: analysisData.leadershipLevel || 'individual'
    };

    // Select bullet points based on AI recommendations
    const selectedBullets: BulletPointPool[] = [];
    if (analysisData.selectedBulletIds && Array.isArray(analysisData.selectedBulletIds)) {
      for (const bulletId of analysisData.selectedBulletIds.slice(0, 5)) {
        const bullet = availableBullets.find(b => b.id === bulletId);
        if (bullet) {
          selectedBullets.push({
            ...bullet,
            relevanceScore: analysisData.matchScore || 0
          });
        }
      }
    }

    // If AI didn't select enough bullets, use fallback logic
    if (selectedBullets.length < 3) {
      const fallbackBullets = availableBullets
        .filter(bullet =>
          bullet.skills.some(skill =>
            analysisData.requiredSkills.includes(skill) ||
            analysisData.preferredSkills.includes(skill)
          )
        )
        .slice(0, 5 - selectedBullets.length);

      selectedBullets.push(...fallbackBullets);
    }

    const analysisResponse: JobAnalysisResponse = {
      analysis: jobAnalysis,
      selectedBullets,
      relevantSkills: analysisData.relevantSkills || userSkills.slice(0, 10),
      matchScore: Math.min(Math.max(analysisData.matchScore || 50, 0), 100),
      recommendations: analysisData.recommendations || [],
      optimizationSuggestions: analysisData.optimizationSuggestions || []
    };

    return NextResponse.json(analysisResponse);

  } catch (error) {
    console.error('API Error:', error);

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}