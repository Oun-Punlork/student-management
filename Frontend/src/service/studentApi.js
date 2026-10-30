import { apiUrl, getAuthorizationHeaders } from './authService.js';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = { message: 'Failed to parse server response.' };
    }
  } else {
    data = { message: response.statusText || 'Unexpected server response.' };
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const fetchStudentsApi = async () => {
  const response = await fetch(apiUrl('/api/students'), {
    headers: getAuthorizationHeaders(),
  });
  return handleResponse(response);
};

export const createStudentApi = async (payload) => {
  const response = await fetch(apiUrl('/api/students'), {
    method: 'POST',
    headers: { ...getAuthorizationHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateStudentApi = async (id, payload) => {
  const response = await fetch(apiUrl(`/api/students/${id}`), {
    method: 'PUT',
    headers: { ...getAuthorizationHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteStudentApi = async (id) => {
  const response = await fetch(apiUrl(`/api/students/${id}`), {
    method: 'DELETE',
    headers: getAuthorizationHeaders(),
  });
  return handleResponse(response);
};