export interface User {
  id: number;
  email: string;
  name: string;
  education?: string;
  degree?: string;
  graduation_year?: string;
  target_role: string;
  preferred_location?: string;
  career_interests?: string;
  created_at?: string;
  resume_count?: number;
  analysis_count?: number;
}

export interface Resume {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: string;
  upload_date: string;
  parsed_data: {
    word_count: number;
    sections: Record<string, string>;
    contact_info?: {
      email?: string;
      phone?: string;
      linkedin?: string;
      github?: string;
    };
    measurable_impact?: string[];
    skills: string[];
    skills_by_category: Record<string, string[]>;
    total_skills_count: number;
  };
}

export interface CategoryScore {
  score: number;
  max: number;
  percentage: number;
  title: string;
}

export interface BetterBulletExample {
  weak: string;
  better: string;
  rationale: string;
}

export interface HighPriorityFix {
  issue: string;
  action: string;
  priority: string;
}

export interface AIProjectRewrite {
  original_theme: string;
  suggested_rewrite: string;
  rationale: string;
}

export interface AIFeedback {
  executive_summary?: string;
  summary_rewrite?: string;
  key_insights?: string[];
  high_priority_fixes?: HighPriorityFix[];
  better_bullet_examples?: BetterBulletExample[];
  project_bullet_improvements?: AIProjectRewrite[];
  missing_skills?: string[];
  ats_keywords?: string[];
  next_steps?: string[];
  interview_prep_tips?: string[];
  roadmap_milestones?: Array<{
    title: string;
    description: string;
    priority: string;
    category: string;
  }>;
  provider?: string;
  model?: string;
  is_live_ai?: boolean;
  provider_status?: string;
}

export interface Analysis {
  id: number;
  user_id: number;
  resume_id: number;
  resume_filename: string;
  target_role: string;
  quality_score: number;
  job_match_score: number;
  category_scores: Record<string, CategoryScore>;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  matched_skills: string[];
  missing_skills: string[];
  ai_feedback: AIFeedback;
  created_at: string;
  roadmap_task_count: number;
}

export interface Job {
  id?: number;
  external_id: string;
  provider: string;
  title: string;
  company: string;
  location: string;
  description: string;
  required_skills: string[];
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  job_type: string;
  experience_level?: string;
  url: string;
  is_demo: boolean;
  posted_at?: string;
  computed_match_score?: number;
}

export interface RoadmapTask {
  id: number;
  user_id: number;
  analysis_id?: number | null;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  resources: string[];
  is_completed: boolean;
  target_date?: string;
  created_at?: string;
  completed_at?: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  tips: string;
}

export interface InterviewEvaluation {
  overall_score: number;
  star_score: number;
  technical_depth: number;
  clarity_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  suggested_exemplar_answer: string;
  feedback_summary: string;
}

export interface CoverLetterResult {
  cover_letter: string;
  subject_line: string;
  key_highlights: string[];
  match_notes: string;
}

export interface LinkedInResult {
  headlines: string[];
  about_section: string;
  core_competencies: string[];
  featured_post_prompt?: string;
}

export interface ResumeBuilderData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  summary: string;
  skills: string[];
  experience: Array<{
    id: string;
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    year: string;
    gpa?: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    technologies: string;
    description: string;
    bullets: string[];
  }>;
}
