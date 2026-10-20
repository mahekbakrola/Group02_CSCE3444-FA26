// Same-origin JSON requests have bounded waits and readable proxy/network errors.
export async function fetchJson<T>(url: string, options: RequestInit = {}, timeout = 20000): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...options, signal: options.signal ?? AbortSignal.timeout(timeout) });
  } catch (error) {
    if (error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name))
      throw Error("The request timed out. Refresh to check whether it saved before trying again.");
    throw Error("Unable to connect. Check your connection and try again.");
  }
  let data: T & { error?: string };
  try { data = await response.json(); }
  catch { throw Error(`The server returned an unexpected response (${response.status}). Please try again.`); }
  if (!response.ok) throw Error(data.error || `The request failed (${response.status}). Please try again.`);
  return data;
}
