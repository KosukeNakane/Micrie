// src/lib/apiClient.ts
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const endpoints = {
    pitch: new URL('pitch', baseUrl).toString(),
    analyze: new URL('analyze', baseUrl).toString(),
    predict: new URL('predict', baseUrl).toString(),
};

export async function apiFetch(endpoint: keyof typeof endpoints, options?: RequestInit) {
    const url = endpoints[endpoint];
    const res = await fetch(url, options);
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('API error', { endpoint, url, status: res.status, body: text.slice(0, 500) });
        throw new Error(`API error ${res.status} for ${endpoint}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res.text();
}