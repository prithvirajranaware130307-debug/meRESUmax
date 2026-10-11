import { User, Resume, Analysis, Job, RoadmapTask } from '../types';

const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim().replace(/\/+$/, '');
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

  // System Health
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
};
