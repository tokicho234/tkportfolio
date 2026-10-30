async function request(url, options = {}) {
  const res = await fetch(url, {
    cache: 'no-store',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || 'Request failed'), { status: res.status });
  return body;
}

export const api = {
  getPortfolio: () => request('/api/portfolio'),
  savePortfolio: (data) => request('/api/portfolio', { method: 'PUT', body: JSON.stringify(data) }),
  session: () => request('/api/admin/login'),
  login: (passcode) => request('/api/admin/login', { method: 'POST', body: JSON.stringify({ passcode }) }),
  logout: () => request('/api/admin/login', { method: 'DELETE' }),
  messages: () => request('/api/admin/messages'),
  deleteMessage: (id) => request(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
  uploadCertImage: async (id, blob) => {
    const res = await fetch(`/api/admin/cert-image?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': blob.type },
      body: blob,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(body.error || 'Upload failed'), { status: res.status });
    return body;
  },
  deleteCertImage: (id) => request(`/api/admin/cert-image?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
  uploadCv: async (file) => {
    const res = await fetch('/api/admin/cv', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/pdf' },
      body: file,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(body.error || 'Upload failed'), { status: res.status });
    return body;
  },
  deleteCv: () => request('/api/admin/cv', { method: 'DELETE' }),
  sendContact: (payload) => request('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
};
