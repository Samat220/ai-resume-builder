import { ResumeData, BulletPointPool } from './types';
import { generateId } from './utils';

// Your pre-configured resume data
export const initialResumeData: ResumeData = {
  personalInfo: {
    name: "Ramazan Samat",
    title: "Software Developer",
    email: "samatramazan@gmail.com",
    linkedin: "linkedin.com/in/samatr",
    github: "GitHub/Samat220",
    portfolio: "ramazansamat.dev",
    phone: "",
    location: ""
  },
  experience: [
    {
      id: 1,
      organization: "Movableink",
      position: "Software Developer",
      dates: "Jan 2024 – Present",
      bullets: [
        "Integrated a custom rate limiter at the SDK level for Oracle, reducing API request bursts and preventing over-limit errors by 30%, enhancing system reliability and performance through a token bucket algorithm.",
        "Retired fragile legacy name references across a Django app by rolling out multi-phase schema updates, rewriting service logic, and updating the React front end to utilize ID-based fields, strengthening data integrity.",
        "Leveraged AI coding tools (Claude Code, Copilot) to automate test-driven development workflows, accelerating feature delivery and reducing manual test overhead.",
        "Developed and maintained gRPC-based services for internal microservice communication, enabling high-throughput, low-latency data exchange across distributed systems.",
        "Implemented a GitHub Actions workflow to automatically detect and flag major dependency version bumps, reducing production risk by alerting developers early in the CI/CD pipeline."
      ]
    },
    {
      id: 2,
      organization: "Lucky Financial",
      position: "Software Engineer",
      dates: "Dec 2022 – Oct 2023",
      bullets: [
        "Led design reviews with peers and stakeholders to decide amongst available technologies to implement RESTful API help section category feature.",
        "Designed, developed, and maintained web applications, SDKs, and integrations with IDEs and tools like Docker, Jira, and postman to deliver high-quality software solutions in an agile environment.",
        "Engineered a robust Postgresql database system to effectively store credentials and addresses of over 10 million users, enhancing the system's data management capabilities."
      ]
    }
  ],
  projects: [
    {
      id: 1,
      name: "Media Picker",
      technologies: "Python, FastAPI, Uvicorn, Jinja2, Tailwind CSS, JavaScript, HTML/CSS",
      bullets: [
        "Designed and implemented a full-stack media management app allowing users to add, edit, and organize video games, movies, and TV series into categorized lists with filtering, tagging, and archiving features.",
        "Built a RESTful API with FastAPI to handle CRUD operations, tag filtering, and randomized selection logic.",
        "Integrated a spinning wheel animation (JavaScript/Canvas) to visually randomize game/movie selection, improving user engagement",
        "Applied CORS middleware and modularized routes for scalability and future integrations"
      ]
    }
  ],
  skills: {
    programmingLanguages: ["Python", "JavaScript", "Java", "R", "TypeScript", "Go", "Swift"],
    machineLearning: ["PyTorch", "TensorFlow", "Scikit-learn", "Pandas", "NumPy"],
    softwareAndTools: ["FastAPI", "Flask", "REST APIs", "SQL", "Docker", "Git", "Linux", "Postman", "Jira"],
    cloudAndDevOps: ["gRPC", "GCP", "CI/CD Pipelines", "AWS", "Kubernetes"],
    frameworksAndLibraries: ["Django", "Mongoose", "EJS", "React", "Bootstrap", "BigQuery"],
    softSkills: ["Leadership", "Communication", "Problem Solving", "Team Collaboration", "Project Management"]
  },
  education: [
    {
      id: 1,
      degree: "MS Software Development",
      institution: "Boston University",
      graduationDate: "Sep 2020",
      courses: [
        "Python for Data Science",
        "Agile Software Development",
        "Advanced Java Development",
        "Databases"
      ],
      bullets: [
        "Coded a TensorFlow machine learning algorithm with Python to analyze car insurance rates based on the model."
      ]
    }
  ]
};

// Extended bullet point pool for AI selection
export const initialBulletPointPool: BulletPointPool[] = [
  // Technical Achievements
  {
    id: generateId(),
    category: 'technical',
    content: "Integrated a custom rate limiter at the SDK level for Oracle, reducing API request bursts and preventing over-limit errors by 30%, enhancing system reliability and performance through a token bucket algorithm.",
    skills: ["Python", "Oracle", "SDK", "API", "Performance Optimization", "System Design"],
    impact: "30% reduction in API errors",
    experienceId: "1"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Retired fragile legacy name references across a Django app by rolling out multi-phase schema updates, rewriting service logic, and updating the React front end to utilize ID-based fields, strengthening data integrity.",
    skills: ["Django", "React", "Database Migration", "Schema Design", "Full Stack"],
    impact: "Improved data integrity",
    experienceId: "1"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Engineered a robust Postgresql database system to effectively store credentials and addresses of over 10 million users, enhancing the system's data management capabilities.",
    skills: ["PostgreSQL", "Database Design", "Scalability", "Data Management", "Backend"],
    impact: "10M+ user data management",
    experienceId: "2"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Built a RESTful API with FastAPI to handle CRUD operations, tag filtering, and randomized selection logic.",
    skills: ["FastAPI", "REST API", "Python", "Backend Development", "API Design"],
    impact: "Complete API implementation",
    experienceId: "media-picker"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Designed and implemented a full-stack media management app allowing users to add, edit, and organize video games, movies, and TV series into categorized lists with filtering, tagging, and archiving features.",
    skills: ["Full Stack", "Python", "JavaScript", "Web Development", "UI/UX"],
    impact: "Complete application development",
    experienceId: "media-picker"
  },

  // Leadership & Collaboration
  {
    id: generateId(),
    category: 'leadership',
    content: "Led design reviews with peers and stakeholders to decide amongst available technologies to implement RESTful API help section category feature.",
    skills: ["Leadership", "Design Reviews", "Stakeholder Management", "Technical Decision Making"],
    impact: "Improved technical decision process",
    experienceId: "2"
  },
  {
    id: generateId(),
    category: 'leadership',
    content: "Collaborated with cross-functional teams to deliver high-quality software solutions in an agile environment using Docker, Jira, and Postman for streamlined development workflows.",
    skills: ["Team Collaboration", "Agile", "Docker", "Jira", "Cross-functional"],
    impact: "Streamlined development process",
    experienceId: "2"
  },

  // Process Improvement
  {
    id: generateId(),
    category: 'achievement',
    content: "Leveraged AI coding tools (Claude Code, Copilot) to automate test-driven development workflows, accelerating feature delivery and reducing manual test overhead.",
    skills: ["AI Tools", "Test-Driven Development", "Automation", "DevOps"],
    impact: "Accelerated development workflows",
    experienceId: "1"
  },
  {
    id: generateId(),
    category: 'achievement',
    content: "Integrated a spinning wheel animation (JavaScript/Canvas) to visually randomize game/movie selection, improving user engagement and application interactivity.",
    skills: ["JavaScript", "Canvas API", "Frontend", "User Experience", "Animation"],
    impact: "Enhanced user engagement",
    experienceId: "media-picker"
  },

  // Additional Movableink Bullets
  {
    id: generateId(),
    category: 'technical',
    content: "Optimized PostgreSQL database queries and implemented Redis caching strategies, resulting in 40% improvement in API response times and reduced server load.",
    skills: ["PostgreSQL", "Redis", "Database Optimization", "Caching", "Performance"],
    impact: "40% performance improvement",
    experienceId: "1"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Built comprehensive monitoring and alerting systems using Datadog and PagerDuty, providing real-time insights into application performance and system health.",
    skills: ["Monitoring", "Datadog", "PagerDuty", "System Health", "Alerting"],
    impact: "Real-time system monitoring",
    experienceId: "1"
  },

  // Additional Lucky Financial Bullets
  {
    id: generateId(),
    category: 'technical',
    content: "Implemented comprehensive error handling and logging systems across multiple microservices to improve debugging and system monitoring capabilities.",
    skills: ["Error Handling", "Logging", "Microservices", "System Monitoring", "Debugging"],
    impact: "Improved system reliability",
    experienceId: "2"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Optimized database queries and implemented caching strategies, resulting in 40% improvement in application response times.",
    skills: ["Database Optimization", "Caching", "Performance Tuning", "SQL", "Backend"],
    impact: "40% performance improvement"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Developed and maintained CI/CD pipelines using GitHub Actions and AWS services, automating deployment processes and reducing manual intervention by 80%.",
    skills: ["CI/CD", "GitHub Actions", "AWS", "DevOps", "Automation"],
    impact: "80% reduction in manual deployment"
  },
  {
    id: generateId(),
    category: 'technical',
    content: "Built responsive web applications using React and TypeScript with comprehensive test coverage using Jest and React Testing Library.",
    skills: ["React", "TypeScript", "Testing", "Jest", "Frontend Development"],
    impact: "Full test coverage implementation"
  },

  // Soft Skills & Communication
  {
    id: generateId(),
    category: 'soft-skill',
    content: "Mentored junior developers on best practices for code quality, testing, and professional development, contributing to team skill advancement.",
    skills: ["Mentoring", "Code Quality", "Team Development", "Knowledge Sharing"],
    impact: "Team skill development"
  },
  {
    id: generateId(),
    category: 'soft-skill',
    content: "Presented technical solutions to non-technical stakeholders, translating complex requirements into actionable development plans.",
    skills: ["Communication", "Stakeholder Management", "Technical Writing", "Requirements Analysis"],
    impact: "Improved stakeholder communication"
  }
];