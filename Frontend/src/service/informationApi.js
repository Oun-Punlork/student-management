import { apiUrl } from './authService.js';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : { message: response.statusText || 'Unexpected server response.' };

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return data;
}

function authorizationHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchInformation() {
  const response = await fetch(apiUrl('/api/information'), {
    headers: authorizationHeaders(),
  });
  const result = await handleResponse(response);
  return result.data;
}

export async function uploadScheduleImage(file, slot = 'primary') {
  const endpoint = slot === 'additional'
    ? '/api/information/schedule/additional'
    : '/api/information/schedule';
  const response = await fetch(apiUrl(endpoint), {
    method: 'PUT',
    headers: {
      ...authorizationHeaders(),
      'Content-Type': file.type,
      'X-File-Name': encodeURIComponent(file.name),
    },
    body: file,
  });
  return handleResponse(response);
}
