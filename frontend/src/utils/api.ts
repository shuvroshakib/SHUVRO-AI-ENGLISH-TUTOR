const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() {
  return localStorage.getItem('shuvro_token');
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('shuvro_token');
    localStorage.removeItem('shuvro_user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || `HTTP ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    register: (email: string, password: string, name?: string) =>
      fetchApi('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) }),
    login: (email: string, password: string) =>
      fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => fetchApi('/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
      fetchApi('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
    deleteAccount: () => fetchApi('/auth/account', { method: 'DELETE' }),
  },
  profile: {
    get: () => fetchApi('/profile'),
    update: (data: any) => fetchApi('/profile', { method: 'PUT', body: JSON.stringify(data) }),
    getSettings: () => fetchApi('/profile/settings'),
    updateSettings: (data: any) => fetchApi('/profile/settings', { method: 'PUT', body: JSON.stringify(data) }),
    getSchedule: () => fetchApi('/profile/schedule'),
    updateSchedule: (data: any) => fetchApi('/profile/schedule', { method: 'PUT', body: JSON.stringify(data) }),
  },
  learning: {
    getMemory: () => fetchApi('/learning/memory'),
    updateMemory: (data: any) => fetchApi('/learning/memory', { method: 'PUT', body: JSON.stringify(data) }),
    getVocabulary: () => fetchApi('/learning/vocabulary'),
    addVocabulary: (data: any) => fetchApi('/learning/vocabulary', { method: 'POST', body: JSON.stringify(data) }),
    updateVocabulary: (id: number, data: any) => fetchApi(`/learning/vocabulary/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getMistakes: () => fetchApi('/learning/mistakes'),
    addMistake: (data: any) => fetchApi('/learning/mistakes', { method: 'POST', body: JSON.stringify(data) }),
    getGoals: () => fetchApi('/learning/goals'),
    addGoal: (data: any) => fetchApi('/learning/goals', { method: 'POST', body: JSON.stringify(data) }),
    updateGoal: (id: number, data: any) => fetchApi(`/learning/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getProgress: () => fetchApi('/learning/progress'),
    updateProgress: (data: any) => fetchApi('/learning/progress', { method: 'PUT', body: JSON.stringify(data) }),
    addLevelHistory: (data: any) => fetchApi('/learning/level-history', { method: 'POST', body: JSON.stringify(data) }),
  },
  sessions: {
    getAll: () => fetchApi('/sessions'),
    get: (sessionId: string) => fetchApi(`/sessions/${sessionId}`),
    create: (data: any) => fetchApi('/sessions', { method: 'POST', body: JSON.stringify(data) }),
    update: (sessionId: string, data: any) => fetchApi(`/sessions/${sessionId}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (sessionId: string) => fetchApi(`/sessions/${sessionId}`, { method: 'DELETE' }),
  },
  gemini: {
    chat: (data: any) => fetchApi('/gemini/chat', { method: 'POST', body: JSON.stringify(data) }),
    placement: (data: any) => fetchApi('/gemini/placement', { method: 'POST', body: JSON.stringify(data) }),
    summary: (data: any) => fetchApi('/gemini/summary', { method: 'POST', body: JSON.stringify(data) }),
    recommendation: (data: any) => fetchApi('/gemini/recommendation', { method: 'POST', body: JSON.stringify(data) }),
    health: () => fetchApi('/gemini/health'),
  },
};
