# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Type check without building (tsc --noEmit)

# Environment setup
cp .env.example .env.local
# Edit .env.local with your Gemini API key
```

## Architecture Overview

### AI-Powered Resume Optimization Flow
The core architecture centers around AI-driven resume optimization:

1. **Client Input**: Users provide job descriptions and their resume data
2. **Server-Side AI Analysis**: `/api/analyze-job` processes job descriptions using Gemini AI
3. **Bullet Point Selection**: AI selects optimal bullet points from user's experience pool
4. **Resume Generation**: Optimized resume created based on AI recommendations

### Key Architectural Patterns

**Server-Side AI Security Pattern**:
- All Gemini AI calls happen server-side in `/api/analyze-job/route.ts`
- Client-side code in `/lib/api.ts` handles API communication only
- Rate limiting (10 requests/minute per IP) implemented in API routes
- Input validation and sanitization on all AI endpoints

**Data Flow Architecture**:
```
User Input → JobAnalyzer → /api/analyze-job → Gemini AI → JobAnalysisResponse → ResumeBuilder
```

**Type System Design**:
- `BulletPointPool`: Core data structure with category-based bullet points
- `JobAnalysis`: AI-generated analysis of job requirements
- `OptimizedResume`: Final output linking original data to AI optimizations
- All types defined in `/src/lib/types.ts`

### Core Components

**Main Application Flow**:
- `ResumeBuilder.tsx`: Main orchestrator component
- `ProfileEditor.tsx`: User data input
- `JobAnalyzer.tsx`: Job description analysis interface
- `BulletPointManager.tsx`: Bullet point pool management
- `ResumePreview.tsx`: Final resume display

**AI Integration Layer**:
- `/api/analyze-job/route.ts`: Gemini AI integration with security
- `/lib/api.ts`: Client-side API utilities with error handling
- `/lib/bulletPointOptimizer.ts`: Bullet point selection logic

**Data Processing**:
- `/lib/resumeConstructor.ts`: Resume assembly logic
- `/lib/pdfGenerator.ts`: PDF generation using Puppeteer
- `/lib/initialData.ts`: Default data structures

### Security Requirements

**API Key Management**:
- NEVER expose `GEMINI_API_KEY` in client-side code
- All AI processing must happen in server-side API routes
- Environment variables required: `GEMINI_API_KEY`

**Input Validation**:
- Job descriptions limited to 50,000 characters
- All user inputs sanitized before AI processing
- Rate limiting enforced on all AI endpoints

### Development Notes

**TypeScript Configuration**:
- Strict mode enabled with path aliases (`@/*` → `./src/*`)
- All components must be typed using interfaces from `/lib/types.ts`

**Styling**:
- Tailwind CSS for all styling
- Component-based approach with reusable patterns
- Print-optimized CSS for PDF generation

**Next.js 15 App Router**:
- Uses App Router with TypeScript
- API routes in `/app/api/` directory
- Turbopack enabled for faster development builds

### Testing and Quality

**Linting**: ESLint with Next.js and TypeScript rules
**Type Checking**: Run `npm run typecheck` before major changes
**Security Headers**: Configured in `next.config.ts` for API protection

When working on this codebase, always maintain the server-side AI security pattern and ensure all new features follow the established type system in `/lib/types.ts`.