import { apiUrl } from './authService.js';

async function requestUsersApi(path, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Your sign-in session is missing. Please sign in again to manage users.');
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `User API returned a non-JSON response (HTTP ${response.status}). Restart the backend and sign in again.`,
    );
  }
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Your sign-in session has expired. Please sign in again to manage users.');
    }
    if (response.status === 403) {
      throw new Error('Only an administrator can view or manage users.');
    }
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

export const fetchUsersApi = async () => {
  const result = await requestUsersApi('/api/users');
  if (!Array.isArray(result.data)) {
    throw new Error('The server returned an invalid user list.');
  }
  return result.data;
};

export const createUserApi = (payload) =>
  requestUsersApi('/api/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const deleteUserApi = (id) =>
  requestUsersApi(`/api/users/${id}`, {
    method: 'DELETE',
  });

export const updateUserRoleApi = (id, role) =>
  requestUsersApi(`/api/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });

export const updateUserStatusApi = (id, status) =>
  requestUsersApi(`/api/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
