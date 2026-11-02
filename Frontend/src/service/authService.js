const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export function apiUrl(path) {
  if (import.meta.env.PROD && !API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured for this production deployment.');
  }

  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(url, options = {}) {
  try {
    const response = await fetch(apiUrl(url), {
      credentials: 'include',
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: 'The server returned an unexpected response.' };

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      const error = new Error(data.message || 'Request failed.');
      error.status = response.status;
      error.code = data.code;
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error('Unable to reach the server. Please check your connection and try again.');
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }

    throw error;
  }
}

export function registerUser(payload) {
  return request('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return request('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function verifyEmail(token) {
  return request('/api/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}

export function resendVerificationEmail(email) {
  return request('/api/verify-email/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export function logoutUser() {
  const token = localStorage.getItem('token');
  if (!token) return Promise.resolve();

  return request('/api/logout', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
  });
}

export function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    const error = new Error('Your session has expired. Please sign in again.');
    error.status = 401;
    return Promise.reject(error);
  }

  return request('/api/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function uploadProfileImage(file) {
  const token = localStorage.getItem('token');
  if (!token) {
    const error = new Error('Your session has expired. Please sign in again.');
    error.status = 401;
    return Promise.reject(error);
  }

  return request('/api/me/profile-image', {
    method: 'PUT',
    headers: {
      Authorization: `******`,
      'Content-Type': file.type,
    },
    body: file,
  });
}

export function getAuthorizationHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
