import { SUBJECT_CODES } from '../constants/subjects';
import { apiUrl, getAuthorizationHeaders } from './authService.js';
export { SUBJECT_CODES };

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = { message: 'Failed to parse response from server.' };
    }
  } else {
    data = { message: response.statusText || 'Unexpected server response.' };
  }

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    error.incompleteStudents = data.incompleteStudents || [];
    throw error;
  }

  return data;
}

export const fetchScores = async () => {
  const response = await fetch(apiUrl('/api/scores'), {
    headers: getAuthorizationHeaders(),
  });
  return handleResponse(response);
};

export const updateScore = async (payload) => {
  const response = await fetch(apiUrl('/api/scores'), {
    method: 'POST',
    headers: { ...getAuthorizationHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const publishFinalResults = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(apiUrl('/api/information/publish-final-results'), {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handleResponse(response);
};
