const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('qr_tracker_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => fetchApi('/auth/me'),

  // QR Codes
  getQRCodes: () => fetchApi('/qrcodes'),
  createQRCode: (body) => fetchApi('/qrcodes', { method: 'POST', body: JSON.stringify(body) }),
  getQRCode: (id) => fetchApi(`/qrcodes/${id}`),
  updateQRCode: (id, body) => fetchApi(`/qrcodes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  toggleQRCode: (id) => fetchApi(`/qrcodes/${id}/toggle`, { method: 'PATCH' }),
  deleteQRCode: (id) => fetchApi(`/qrcodes/${id}`, { method: 'DELETE' }),

  // Analytics
  getQRAnalytics: (id) => fetchApi(`/qrcodes/${id}/analytics`),
  getAggregatedOverview: () => fetchApi('/analytics/overview')
};
