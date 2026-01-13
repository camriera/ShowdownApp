import { API_CONFIG } from './config';
import { ApiError } from './types';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = API_CONFIG.timeout, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`🌐 API Request: ${fetchOptions.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.headers,
        ...fetchOptions.headers,
      },
    });

    clearTimeout(timeoutId);

    console.log(`📡 API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch {
        if (errorBody) {
          errorMessage = errorBody;
        }
      }

      console.error(`❌ API Error: ${errorMessage}`);
      throw new ApiError(errorMessage, response.status, url);
    }

    const data = await response.json();
    console.log(`✅ API Success: Got data from ${url}`);
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      console.error(`🚫 ApiError: ${error.message}`);
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`⏱️  Timeout: Request to ${url} timed out after ${timeout}ms`);
        throw new ApiError('Request timeout', 408, url);
      }
      console.error(`❌ Fetch Error: ${error.message}`);
      throw new ApiError(error.message, 0, url);
    }

    console.error('❌ Unknown error occurred');
    throw new ApiError('Unknown error occurred', 0, url);
  }
}
