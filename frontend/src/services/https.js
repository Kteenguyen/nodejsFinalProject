// frontend/src/services/https.js
export const API_BASE =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.REACT_APP_API_BASE) ||
  "https://localhost:3001/api";

// Helper chung cho mọi service
async function request(method, path, { body, signal, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const text = await res.text().catch(() => "");
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

export const httpGet    = (path, opts) => request("GET",    path, opts);
export const httpPost   = (path, opts) => request("POST",   path, opts);
export const httpPut    = (path, opts) => request("PUT",    path, opts);
export const httpPatch  = (path, opts) => request("PATCH",  path, opts);
export const httpDelete = (path, opts) => request("DELETE", path, opts);
export default API_BASE;