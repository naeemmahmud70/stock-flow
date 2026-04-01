export function authFetch(url: string, opts: RequestInit = {}): Promise<Response> {
  let token: string | null = null;

  try {
    const raw = localStorage.getItem("sf-auth"); 
    if (raw) {
      token = JSON.parse(raw)?.state?.token ?? null;
    }
  } catch {
    // SSR or localStorage unavailable — token will come from cookie instead
  }

  const headers = new Headers(opts.headers ?? {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, { ...opts, headers });
}
