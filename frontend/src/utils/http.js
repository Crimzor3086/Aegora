// Lightweight HTTP utility for consistent error handling

class ApiError extends Error {
  constructor(message, { status, url, body } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.url = url;
    this.body = body;
  }
}

const DEFAULT_TIMEOUT_MS = 10000;

async function fetchJson(url, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...fetchOptions, signal: controller.signal });
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      let errorBody;
      try {
        errorBody = contentType.includes('application/json') ? await res.json() : await res.text();
      } catch (_) {
        errorBody = null;
      }
      const message = typeof errorBody === 'object' && errorBody?.message
        ? errorBody.message
        : `Request failed with status ${res.status}`;
      throw new ApiError(message, { status: res.status, url, body: errorBody });
    }

    return contentType.includes('application/json') ? await res.json() : await res.text();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out', { status: 408, url });
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(err?.message || 'Network error', { url });
  } finally {
    clearTimeout(timeoutId);
  }
}

export { fetchJson, ApiError };


