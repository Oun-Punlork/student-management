import { apiUrl, getAuthorizationHeaders } from "./authService.js";

export async function fetchMyScores() {
  const response = await fetch(apiUrl("/api/me/scores"), {
    headers: getAuthorizationHeaders(),
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: response.statusText || "Unexpected server response." };

  if (!response.ok) {
    const error = new Error(data.message || "Failed to retrieve your scores.");
    error.status = response.status;
    throw error;
  }

  if (
    !data?.data?.student ||
    !Array.isArray(data.data.scores) ||
    !("finalResultsPublishedAt" in data.data)
  ) {
    throw new Error("The server returned invalid student score data.");
  }

  return data.data;
}
