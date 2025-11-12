import { API_BASE } from "./https";

export async function getMe(signal) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    method: "GET",
    credentials: "include",
    signal,
  });
  if (!res.ok) throw new Error(`GET /auth/me ${res.status}`);
  return res.json();
}
