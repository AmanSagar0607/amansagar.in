import { Project, Technology } from "@/types/project";

const technologies: Record<string, Technology> = {
  nextjs: { name: 'Next.js', category: 'frontend', icon: 'nextjs' },
  react: { name: 'React', category: 'frontend', icon: 'react' },
  typescript: { name: 'TypeScript', category: 'frontend', icon: 'typescript' },
  tailwind: { name: 'Tailwind CSS', category: 'frontend', icon: 'tailwind' },
  nodejs: { name: 'Node.js', category: 'backend', icon: 'nodejs' },
  mongodb: { name: 'MongoDB', category: 'database', icon: 'mongodb' },
  vercel: { name: 'Vercel', category: 'devops', icon: 'vercel' },
  figma: { name: 'Figma', category: 'design', icon: 'figma' },
  xd: { name: 'Adobe XD', category: 'design', icon: 'xd' },
  github: { name: 'GitHub', category: 'devops', icon: 'github' },
  vscode: { name: 'VS Code', category: 'devops', icon: 'vscode' },
  git: { name: 'Git', category: 'devops', icon: 'git' },
  githubActions: { name: 'GitHub Actions', category: 'devops', icon: 'github-actions' },
};

export const projects: Project[] = [
  {
    title: "Sell Better",
    description: "A marketplace for creators to easily sell and showcase digital products, with zero risk and full support",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750500530/Aman-Portfolio/yman8aa31r6dirfvnlww.png",
    link: "https://sell-better.vercel.app",
    githubUrl: "https://github.com/AmanSagar0607/SellBetter",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "A comprehensive marketplace platform that enables creators to showcase and sell their digital products with built-in payment processing and user management.",
    features: [
      "User authentication and authorization",
      "Product listing and management",
      "Shopping cart and checkout",
      "Payment processing integration",
      "User dashboard"
    ],
    challenges: [
      "Implementing secure payment processing",
      "Optimizing for high-resolution product images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Payment gateway integration",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://sell-better.vercel.app"
    },
    date: "2023-01-15"
  },
  {
    title: "Mansio Property",
    description: "Your Key to Luxury Living, Discover exceptional properties curated for the discerning individual.",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750500535/Aman-Portfolio/vwjvmduoxecchdui9m3j.png",
    link: "https://property-feed.vercel.app",
    githubUrl: "https://github.com/AmanSagar0607/property-feed",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "A real estate platform that showcases luxury properties with advanced search and filtering capabilities.",
    features: [
      "Property listing and management",
      "Advanced search and filtering",
      "User authentication and authorization",
      "Favorites and saved searches"
    ],
    challenges: [
      "Implementing efficient search and filtering",
      "Optimizing for high-resolution property images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Optimization techniques for large datasets",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://property-feed.vercel.app"
    },
    date: "2023-02-15"
  },
  {
    title: "Proviz School AI",
    description: "Proviz School AI: Empowering the next generation of AI innovators through world-class education and mentorship.",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750500535/Aman-Portfolio/d3s3j3dkfoflv3c7jjoe.png",
    link: "https://proviz-school-ai.vercel.app/",
    githubUrl: "https://github.com/AmanSagar0607/ProvizSchoolAi",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "An AI education platform that provides interactive courses, mentorship, and project-based learning.",
    features: [
      "Course listing and management",
      "Mentorship and community features",
      "Project-based learning and feedback",
      "User authentication and authorization"
    ],
    challenges: [
      "Implementing interactive course content",
      "Optimizing for high-resolution course images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Optimization techniques for large datasets",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://proviz-school-ai.vercel.app/"
    },
    date: "2023-03-15"
  },
  {
    title: "WEHR Dashboard",
    description: "WEHR Dashboard: A dashboard for managing WEHR employees.",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750500529/Aman-Portfolio/kgzyofir2ceavwmjkoas.png",
    link: "https://hr-dashbaord.vercel.app/",
    githubUrl: "https://github.com/AmanSagar0607/HR-Dashbaord",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "A dashboard for managing WEHR employees, including attendance tracking, leave management, and performance monitoring.",
    features: [
      "Attendance tracking and management",
      "Leave management and approval",
      "Performance monitoring and feedback",
      "User authentication and authorization"
    ],
    challenges: [
      "Implementing attendance tracking and leave management",
      "Optimizing for high-resolution dashboard images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Optimization techniques for large datasets",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://hr-dashbaord.vercel.app/"
    },
    date: "2023-04-15"
  },
  {
    title: "Tool Hunt",
    description: "Elevate Your Projects with the Best Tools for Designers & Developers.",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750500526/Aman-Portfolio/d7pcw8dxrt3x9mnbjqnk.png",
    link: "https://toolhunt.vercel.app",
    githubUrl: "https://github.com/AmanSagar0607/ToolHunt",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "A platform for discovering and reviewing tools for designers and developers.",
    features: [
      "Tool listing and management",
      "Review and rating system",
      "User authentication and authorization",
      "Favorites and saved tools"
    ],
    challenges: [
      "Implementing efficient search and filtering",
      "Optimizing for high-resolution tool images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Optimization techniques for large datasets",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://toolhunt.vercel.app"
    },
    date: "2023-05-15"
  },
  {
    title: "WhatBytes Dashboard",
    description: "A dashboard for WhatBytes.",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750500590/Aman-Portfolio/mudrtwqwxuyplwffdo5n.png",
    link: "https://what-bytes-nine.vercel.app",
    githubUrl: "https://github.com/AmanSagar0607/WhatBytes",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "A dashboard for managing WhatBytes data, including analytics and performance monitoring.",
    features: [
      "Analytics and performance monitoring",
      "Data visualization and reporting",
      "User authentication and authorization",
      "Favorites and saved reports"
    ],
    challenges: [
      "Implementing data visualization and reporting",
      "Optimizing for high-resolution dashboard images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Optimization techniques for large datasets",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://what-bytes-nine.vercel.app"
    },
    date: "2023-06-15"
  },
  {
    title: "Fig Pro",
    description: "Real-time Figma Clone: A collaborative design tool with real-time design features to deliver highly dynamic user experiences.",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750501264/Aman-Portfolio/o4cmn1nbiepu15h3ke3h.png",
    link: "https://fig-pro-rho.vercel.app",
    githubUrl: "https://github.com/AmanSagar0607/FigPro",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "A real-time collaborative design tool with features like live commenting, @mentions, and real-time design updates.",
    features: [
      "Real-time collaborative design",
      "Live commenting and @mentions",
      "Real-time design updates",
      "User authentication and authorization"
    ],
    challenges: [
      "Implementing real-time collaborative design",
      "Optimizing for high-resolution design images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Optimization techniques for large datasets",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://fig-pro-rho.vercel.app"
    },
    date: "2023-07-15"
  },
  {
    title: "IPhone X",
    description: "Apple iphone Clone: A dynamic replica of Apple's iPhone 15 Pro, showcasing various models in different colors and shapes.",
    src: "https://res.cloudinary.com/dl7zgwx4o/image/upload/v1750501264/Aman-Portfolio/yislvzcmljtukl6iobcd.png",
    link: "https://i-phone-x.vercel.app/",
    githubUrl: "https://github.com/AmanSagar0607/iPhone-X",
    technologies: [
      technologies.nextjs,
      technologies.typescript,
      technologies.tailwind,
      technologies.nodejs,
      technologies.mongodb,
      technologies.figma
    ],
    overview: "A dynamic replica of Apple's iPhone 15 Pro, showcasing various models in different colors and shapes.",
    features: [
      "Dynamic product showcase",
      "Color and shape variations",
      "User authentication and authorization",
      "Favorites and saved products"
    ],
    challenges: [
      "Implementing dynamic product showcase",
      "Optimizing for high-resolution product images",
      "Ensuring smooth user experience across devices"
    ],
    learnings: [
      "Advanced state management with React Context",
      "Optimization techniques for large datasets",
      "Performance optimization techniques"
    ],
    designTools: [technologies.figma, technologies.xd],
    developmentTools: [technologies.vscode, technologies.git, technologies.githubActions],
    deployment: {
      platform: "Vercel",
      url: "https://i-phone-x.vercel.app/"
    },
    date: "2023-08-15"
  },
];

// Add slugs and process to all projects
export const enhancedProjects = projects.map(project => ({
  ...project,
  slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  process: [
    "Understanding requirements and planning",
    "Designing the user interface",
    "Implementing core features",
    "Testing and debugging",
    "Deployment and maintenance"
  ]
}));