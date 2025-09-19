// [API] shared/api - apiClient.ts
// 役割: 外部API/バックエンド通信ラッパー
// src/shared/api/apiClient.ts
const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
const baseUrl = rawBase ? rawBase.replace(/\/$/, '') : '';

// When baseUrl is empty (dev), use relative paths so that Vite proxy can route them.
export const endpoints = baseUrl
  ? {
      pitch: `${baseUrl}/pitch`,
      analyze: `${baseUrl}/analyze`,
      predict: `${baseUrl}/predict`,
    }
  : {
      pitch: `/pitch`,
      analyze: `/analyze`,
      predict: `/predict`,
    };

export async function apiFetch(endpoint: keyof typeof endpoints, options?: RequestInit) {
    const url = endpoints[endpoint];
    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('API error', { endpoint, url, status: res.status, body: text.slice(0, 500) });
        throw new Error(`API error ${res.status} for ${endpoint}`);
    }
    const ct = (res.headers.get('content-type') || '').toLowerCase();
    const text = await res.text();
    if (ct.includes('application/json') || ct.includes('text/json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
        try {
            return JSON.parse(text);
        } catch (e) {
            // Sanitize non-JSON tokens like NaN/Infinity that some backends may emit
            const sanitized = text
                .replace(/\bNaN\b/g, 'null')
                .replace(/\bInfinity\b/g, 'null')
                .replace(/\b-?inf\b/gi, 'null');
            try { return JSON.parse(sanitized); } catch (e2) {
                console.error('Failed to parse JSON response', { endpoint, url, sample: text.slice(0, 200) });
                throw e2;
            }
        }
    }
    return text;
}
