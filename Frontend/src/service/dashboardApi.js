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

export const fetchDashboardStatsApi = async () => {
  const response = await fetch(apiUrl('/api/dashboard/stats'), {
    headers: getAuthorizationHeaders(),
  });
  const result = await handleResponse(response);

  if (!result?.data?.stats || !result?.data?.attendanceSummary || !result?.data?.weekly) {
    throw new Error('The server returned invalid dashboard statistics.');
  }

  return result.data;
};
