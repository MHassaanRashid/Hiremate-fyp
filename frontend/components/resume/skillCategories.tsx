import {
  Code2, Globe, Server, Database, Cloud, Smartphone, 
  Palette, Brain, Users, Wrench
} from "lucide-react"

export interface SkillCategoryMetadata {
  icon: any
  color: string
  bgColor: string
  description: string
  skills: string[]
}

export const SKILL_CATEGORIES_WITH_METADATA: Record<string, SkillCategoryMetadata> = {
  "Programming Languages": {
    icon: Code2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Core programming and scripting languages",
    skills: [
      "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust",
      "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "MATLAB", "SQL"
    ]
  },
  "Frontend Development": {
    icon: Globe,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "UI frameworks and styling technologies",
    skills: [
      "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "HTML5",
      "CSS3", "Sass", "Less", "Tailwind CSS", "Bootstrap", "Material-UI", "Chakra UI"
    ]
  },
  "Backend Development": {
    icon: Server,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Server-side frameworks and APIs",
    skills: [
      "Node.js", "Express.js", "Django", "Flask", "Spring Boot", "Laravel",
      "Ruby on Rails", "ASP.NET", "FastAPI", "Gin", "Echo"
    ]
  },
  "Databases": {
    icon: Database,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Database management systems",
    skills: [
      "MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "SQLite",
      "Oracle", "SQL Server", "DynamoDB", "Cassandra", "Neo4j"
    ]
  },
  "Cloud & DevOps": {
    icon: Cloud,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    description: "Cloud platforms and deployment tools",
    skills: [
      "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "Jenkins",
      "GitLab CI", "GitHub Actions", "Terraform", "Ansible", "Nginx"
    ]
  },
  "Mobile Development": {
    icon: Smartphone,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    description: "Mobile app development frameworks",
    skills: [
      "React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic", "Cordova"
    ]
  },
  "Design & UI/UX": {
    icon: Palette,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    description: "Design tools and user experience",
    skills: [
      "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "InVision",
      "Principle", "Framer", "Zeplin", "Adobe Creative Suite"
    ]
  },
  "Data Science & AI": {
    icon: Brain,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    description: "Machine learning and data analysis",
    skills: [
      "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Matplotlib",
      "Seaborn", "Jupyter", "Apache Spark", "Hadoop", "Tableau", "Power BI"
    ]
  },
  "Soft Skills": {
    icon: Users,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    description: "Leadership and interpersonal abilities",
    skills: [
      "Leadership", "Team Management", "Project Management", "Communication",
      "Problem Solving", "Critical Thinking", "Agile/Scrum", "Public Speaking",
      "Mentoring", "Strategic Planning", "Negotiation", "Time Management"
    ]
  },
  "Tools & Others": {
    icon: Wrench,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    description: "Development tools and utilities",
    skills: [
      "Git", "GitHub", "GitLab", "VS Code", "IntelliJ IDEA", "Postman",
      "Jira", "Confluence", "Slack", "Linear", "Notion"
    ]
  }
}

// Export backward-compatible object for existing code
export const SKILL_CATEGORIES = Object.entries(SKILL_CATEGORIES_WITH_METADATA).reduce(
  (acc, [category, metadata]) => {
    acc[category] = metadata.skills
    return acc
  },
  {} as Record<string, string[]>
)
