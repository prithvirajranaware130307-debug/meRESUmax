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

/**
 * Robust fetch wrapper with client-side timeout, connection retry awareness, and error normalization.
 */
async function request<T>(endpoint: string, options: RequestInit = {}, timeoutMs: number = 25000): Promise<T> {
  const url = endpoint.startsWith('http://') || endpoint.startsWith('https://') 
    ? endpoint 
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('The request timed out. The analysis service may be starting up on Render—please wait a few seconds and try again.');
    }
    if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
      throw new Error('The analysis service is starting. Please wait a few seconds and try again.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  let result: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      result = await res.json();
    } catch {
      result = null;
    }
  } else {
    // Non-JSON response, e.g. HTML 502/504 Bad Gateway from Render/Cloudflare cold starts
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error('The analysis service is starting. Please wait a few seconds and try again.');
    }
    if (res.status === 413) {
      throw new Error('File size exceeds the maximum allowed limit of 16 MB.');
    }
    throw new Error(`Server returned status ${res.status}. Please check your connection and try again.`);
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error(result?.error || 'Your session has expired. Please log in again.');
    }
    if (res.status === 413) {
      throw new Error(result?.error || 'File size exceeds maximum allowed limit of 16 MB.');
    }
    if (res.status === 422) {
      throw new Error(result?.error || 'Could not parse document. Please ensure it is a valid, readable PDF or DOCX file.');
    }
    if (res.status >= 500) {
      throw new Error(result?.error || 'The analysis service encountered an unexpected error. Please try again.');
    }
    throw new Error(result?.error || `Request failed with status ${res.status}`);
  }

  return result as T;
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; target_role?: string }): Promise<{ token: string; user: User }> {
    return request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async login(data: { email: string; password: string }): Promise<{ token: string; user: User }> {
    return request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/auth/me', {
      headers: getAuthHeaders()
    }, 12000);
  },

  // Resumes
  async uploadResume(file: File): Promise<{ message: string; resume: Resume }> {
    const formData = new FormData();
    formData.append('file', file);
    return request('/resumes/upload', {
      method: 'POST',
      headers: getAuthHeaders(true),
      body: formData
    }, 35000);
  },

  async getResumes(): Promise<{ resumes: Resume[] }> {
    return request('/resumes', {
      headers: getAuthHeaders()
    });
  },

  async deleteResume(id: number): Promise<{ message: string }> {
    return request(`/resumes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Analyses
  async createAnalysis(data: { resume_id: number; target_role: string; job_description?: string }): Promise<{ analysis: Analysis }> {
    return request('/analyses', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }, 35000);
  },

  async getAnalyses(): Promise<{ analyses: Analysis[] }> {
    return request('/analyses', {
      headers: getAuthHeaders()
    });
  },

  async getAnalysis(id: number): Promise<{ analysis: Analysis }> {
    return request(`/analyses/${id}`, {
      headers: getAuthHeaders()
    }, 15000);
  },

  async deleteAnalysis(id: number): Promise<{ message: string }> {
    return request(`/analyses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
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

    return request(`/jobs?${query.toString()}`);
  },

  async getRecommendations(): Promise<{ jobs: Job[] }> {
    return request('/jobs/recommendations', {
      headers: getAuthHeaders()
    });
  },

  async saveJob(jobId: number, jobPayload?: Partial<Job>): Promise<{ message: string }> {
    return request(`/jobs/${jobId}/save`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobPayload || {})
    });
  },

  async unsaveJob(jobId: number): Promise<{ message: string }> {
    return request(`/jobs/${jobId}/save`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  async getSavedJobs(): Promise<{ saved_jobs: Array<{ id: number; job: Job; saved_at: string }> }> {
    return request('/jobs/saved', {
      headers: getAuthHeaders()
    });
  },

  // Roadmap
  async getRoadmap(): Promise<{ tasks: RoadmapTask[] }> {
    return request('/roadmap', {
      headers: getAuthHeaders()
    });
  },

  async addRoadmapTask(data: Partial<RoadmapTask>): Promise<{ task: RoadmapTask }> {
    return request('/roadmap', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async updateRoadmapTask(id: number, data: Partial<RoadmapTask>): Promise<{ task: RoadmapTask }> {
    return request(`/roadmap/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async deleteRoadmapTask(id: number): Promise<{ message: string }> {
    return request(`/roadmap/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Profile
  async getProfile(): Promise<{ profile: User }> {
    return request('/profile', {
      headers: getAuthHeaders()
    });
  },

  async updateProfile(data: Partial<User>): Promise<{ profile: User }> {
    return request('/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async deleteAccount(): Promise<{ message: string }> {
    return request('/account', {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  // Interview Simulator
  async getInterviewQuestions(data: {
    target_role?: string;
    difficulty?: string;
    skills?: string[];
    resume_summary?: string;
  }): Promise<{ target_role: string; difficulty: string; questions: import('../types').InterviewQuestion[] }> {
    return request('/interview/questions', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }, 15000);
  },

  async evaluateInterviewAnswer(data: {
    question: string;
    category: string;
    candidate_answer: string;
    target_role?: string;
    difficulty?: string;
  }): Promise<import('../types').InterviewEvaluation> {
    return request('/interview/evaluate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }, 15000);
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
    return request('/tools/cover-letter', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }, 20000);
  },

  async generateLinkedIn(data: {
    candidate_name?: string;
    target_role?: string;
    skills?: string[];
    resume_summary?: string;
  }): Promise<import('../types').LinkedInResult> {
    return request('/tools/linkedin', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }, 20000);
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

    return request(`/applications?${query.toString()}`, {
      headers: getAuthHeaders()
    });
  },

  async createApplication(data: Partial<JobApplication>): Promise<{ message: string; application: JobApplication }> {
    return request('/applications', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async updateApplication(id: number, data: Partial<JobApplication>): Promise<{ message: string; application: JobApplication }> {
    return request(`/applications/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
  },

  async deleteApplication(id: number): Promise<{ message: string }> {
    return request(`/applications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
  },

  async seedSampleApplications(): Promise<{ message: string; seeded: boolean; count?: number }> {
    return request('/applications/seed-sample', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  },

  // Floating AI Assistant
  async sendChatMessage(data: { message: string; target_role?: string; context?: any }): Promise<{
    reply: string;
    provider: string;
    model?: string;
    is_live_ai: boolean;
    disclaimer?: string | null;
  }> {
    const chatBase = import.meta.env.VITE_AI_CHAT_API_URL || '/assistant/chat';
    return request(chatBase, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    }, 15000);
  },

  // System Health
  async getHealth(): Promise<any> {
    return request('/health', {}, 10000);
  }
};
