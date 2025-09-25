# AI-Powered Resume Builder

A modern, secure resume builder that uses AI to intelligently match your experience with job requirements.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Gemini API key

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Type checking
npx tsc --noEmit     # Type check without building
```

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (server-side only)
│   │   └── analyze-job/   # Gemini AI integration
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── forms/            # Form components
│   ├── resume/           # Resume-related components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions and configurations
│   ├── api.ts           # Client-side API utilities
│   ├── types.ts         # TypeScript interfaces
│   └── utils.ts         # Helper functions
└── styles/              # Additional stylesheets
```

## 🔐 Security Guidelines

### API Key Management
- **NEVER** commit `.env.local` to git
- **ALWAYS** use server-side API routes for Gemini AI calls
- **NEVER** expose API keys in client-side code
- Use environment variables for all sensitive configuration

### API Security
- All AI processing happens server-side via `/api/analyze-job`
- Rate limiting implemented (10 requests/minute per IP)
- Input validation and sanitization on all endpoints
- Security headers configured in `next.config.ts`
- Error handling that doesn't leak sensitive information

### Best Practices
- Validate all user inputs client and server-side
- Sanitize data before processing with AI
- Use TypeScript for type safety
- Keep dependencies updated
- Follow principle of least privilege

## 🤖 AI Integration

### Gemini AI Setup
1. Get API key from [Google AI Studio](https://aistudio.google.com/)
2. Add to `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
3. Never expose this key to client-side code

### API Usage
```typescript
import { analyzeJob } from '@/lib/api';

const analysis = await analyzeJob({
  jobDescription: "Software Engineer job posting...",
  userSkills: ["JavaScript", "React", "Node.js"],
  availableBullets: bulletPointPool
});
```

## 📝 Data Models

### Core Types
- `UserProfile` - User's complete profile data
- `ResumeData` - Resume structure with personal info, experience, skills
- `BulletPointPool` - Pool of available bullet points with categories
- `JobAnalysis` - AI analysis results from job descriptions
- `OptimizedResume` - AI-optimized resume for specific job

### Bullet Point Categories
- `technical` - Technical achievements and implementations
- `leadership` - Leadership and management experiences
- `achievement` - Quantifiable accomplishments
- `project` - Project-specific contributions
- `soft-skill` - Communication, collaboration, etc.

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Component-based** approach with reusable UI elements
- **Responsive design** with mobile-first approach
- **Print-optimized** styles for PDF generation
- **ATS-friendly** formatting options

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:coverage
```

## 📦 Dependencies

### Core
- **Next.js 15** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### AI & APIs
- **@google/generative-ai** - Gemini AI SDK

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing

## 🚀 Deployment

### Environment Variables Required
```bash
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_secret_key
```

### Vercel Deployment
1. Connect repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Self-hosted Deployment
```bash
npm run build
npm start
# Or use PM2, Docker, etc.
```

## 🔍 Troubleshooting

### Common Issues

**API Key Not Working:**
- Verify key is set in `.env.local`
- Check Gemini AI quotas and billing
- Ensure API is enabled in Google Cloud Console

**Build Errors:**
- Run `npm run lint` to check for code issues
- Verify all dependencies are installed
- Check TypeScript errors with `npx tsc --noEmit`

**Rate Limiting:**
- Wait 1 minute between requests if hitting limits
- Consider implementing user authentication for higher limits

## 📈 Performance

- **Turbopack** enabled for faster development builds
- **Static generation** where possible
- **API response caching** (planned)
- **Image optimization** with Next.js Image component
- **Bundle analysis** available with `@next/bundle-analyzer`

## 🤝 Contributing

1. Follow existing code style and patterns
2. Add TypeScript types for new features
3. Test AI integrations thoroughly
4. Update documentation for new features
5. Ensure security best practices are followed

## 📄 License

This project is for educational and personal use.