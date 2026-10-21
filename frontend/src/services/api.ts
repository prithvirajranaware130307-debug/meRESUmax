import { User, Resume, Analysis, Job, RoadmapTask, JobApplication, ApplicationStats } from '../types';

let rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
if (rawApiUrl && !rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://') && !rawApiUrl.startsWith('/')) {
  rawApiUrl = `https://${rawApiUrl}`;
}
const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : (rawApiUrl === '' ? '/api' : `${rawApiUrl}/api`);

function getAuthHeaders(isFormData: boolean = false): HeadersInit {
  const token = localStorage.getItem('meresumax_token');
  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; target_role?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    return result;
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch current user');
    return result;
  },

  // Resumes
  async uploadResume(file: File): Promise<{ message: string; resume: Resume }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Upload failed');
    return result;
  },

  async getResumes(): Promise<{ resumes: Resume[] }> {
    const res = await fetch(`${API_BASE}/resumes`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch resumes');
    return result;
  },

  async deleteResume(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete resume');
    return result;
  },

  // Analyses
  async createAnalysis(data: { resume_id: number; target_role: string; job_description?: string }): Promise<{ analysis: Analysis }> {
    const res = await fetch(`${API_BASE}/analyses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to generate analysis');
    return result;
  },

  async getAnalyses(): Promise<{ analyses: Analysis[] }> {
    const res = await fetch(`${API_BASE}/analyses`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch analyses');
    return result;
  },

  async getAnalysis(id: number): Promise<{ analysis: Analysis }> {
    const res = await fetch(`${API_BASE}/analyses/${id}`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch analysis details');
    return result;
  },

  async deleteAnalysis(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/analyses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete analysis');
    return result;
  },

  getReportDownloadUrl(analysisId: number): string {
    const token = localStorage.getItem('meresumax_token');
    return `${API_BASE}/analyses/${analysisId}/report${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  // Jobs
  async getJobs(params?: { query?: string; location?: string; page?: number; type?: string }): Promise<{ jobs: Job[]; total: number; is_live: boolean; provider: string; message?: string }> {
    const query = new URLSearchParams();
    if (params?.query) query.set('query', params.query);
    if (params?.location) query.set('location', params.location);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.type) query.set('type', params.type);

    const res = await fetch(`${API_BASE}/jobs?${query.toString()}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load jobs');
    return result;
  },

  async getRecommendations(): Promise<{ jobs: Job[] }> {
    const res = await fetch(`${API_BASE}/jobs/recommendations`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load job recommendations');
    return result;
  },

  async saveJob(jobId: number, jobPayload?: Partial<Job>): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobPayload || {})
    });
    return res.json();
  },

  async unsaveJob(jobId: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/save`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getSavedJobs(): Promise<{ saved_jobs: Array<{ id: number; job: Job; saved_at: string }> }> {
    const res = await fetch(`${API_BASE}/jobs/saved`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch saved jobs');
    return result;
  },

  // Roadmap
  async getRoadmap(): Promise<{ tasks: RoadmapTask[] }> {
    const res = await fetch(`${API_BASE}/roadmap`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch roadmap tasks');
    return result;
  },

  async addRoadmapTask(data: Partial<RoadmapTask>): Promise<{ task: RoadmapTask }> {
    const res = await fetch(`${API_BASE}/roadmap`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to add roadmap task');
    return result;
  },

  async updateRoadmapTask(id: number, data: Partial<RoadmapTask>): Promise<{ task: RoadmapTask }> {
    const res = await fetch(`${API_BASE}/roadmap/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update task');
    return result;
  },

  async deleteRoadmapTask(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/roadmap/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Profile
  async getProfile(): Promise<{ profile: User }> {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to load profile');
    return result;
  },

  async updateProfile(data: Partial<User>): Promise<{ profile: User }> {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update profile');
    return result;
  },

  async deleteAccount(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/account`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete account');
    return result;
  },

  // Interview Simulator
  async getInterviewQuestions(data: {
    target_role?: string;
    difficulty?: string;
    skills?: string[];
    resume_summary?: string;
  }): Promise<{ target_role: string; difficulty: string; questions: import('../types').InterviewQuestion[] }> {
    const res = await fetch(`${API_BASE}/interview/questions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch interview questions');
    return result;
  },

  async evaluateInterviewAnswer(data: {
    question: string;
    category: string;
    candidate_answer: string;
    target_role?: string;
    difficulty?: string;
  }): Promise<import('../types').InterviewEvaluation> {
    const res = await fetch(`${API_BASE}/interview/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to evaluate interview response');
    return result;
  },

  // Career Tools
  async generateCoverLetter(data: {
    candidate_name?: string;
    target_role?: string;
    company_name?: string;
    job_description?: string;
    resume_summary?: string;
    skills?: string[];
    tone?: string;
  }): Promise<import('../types').CoverLetterResult> {
    const res = await fetch(`${API_BASE}/tools/cover-letter`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to generate cover letter');
    return result;
  },

  async generateLinkedIn(data: {
    candidate_name?: string;
    target_role?: string;
    skills?: string[];
    resume_summary?: string;
  }): Promise<import('../types').LinkedInResult> {
    const res = await fetch(`${API_BASE}/tools/linkedin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to generate LinkedIn profile copy');
    return result;
  },

  // Applications & Kanban Tracker
  async getApplications(params?: { status?: string; priority?: string; search?: string }): Promise<{
    applications: JobApplication[];
    stats: ApplicationStats;
    upcoming_interviews: JobApplication[];
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.search) query.append('search', params.search);

    const res = await fetch(`${API_BASE}/applications?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch applications');
    return result;
  },

  async createApplication(data: Partial<JobApplication>): Promise<{ message: string; application: JobApplication }> {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to track application');
    return result;
  },

  async updateApplication(id: number, data: Partial<JobApplication>): Promise<{ message: string; application: JobApplication }> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update application');
    return result;
  },

  async deleteApplication(id: number): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete application');
    return result;
  },

  async seedSampleApplications(): Promise<{ message: string; seeded: boolean; count?: number }> {
    const res = await fetch(`${API_BASE}/applications/seed-sample`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to seed sample applications');
    return result;
  },

  // Floating AI Assistant
  async sendChatMessage(data: { message: string; target_role?: string; context?: any }): Promise<{
    reply: string;
    provider: string;
    model?: string;
    is_live_ai: boolean;
    disclaimer?: string | null;
  }> {
    const chatBase = import.meta.env.VITE_AI_CHAT_API_URL || `${API_BASE}/assistant/chat`;
    const res = await fetch(chatBase, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send chat message');
    return result;
  },

  // System Health
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
};

