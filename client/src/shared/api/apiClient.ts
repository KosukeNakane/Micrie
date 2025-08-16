// src/shared/api/apiClient.ts
console.log("VITE_API_BASE_URL raw value:", import.meta.env.VITE_API_BASE_URL);
console.log("VITE_API_BASE_URL type:", typeof import.meta.env.VITE_API_BASE_URL);


const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const endpoints = {
    pitch: new URL('pitch', baseUrl).toString(),
    analyze: new URL('analyze', baseUrl).toString(),
    predict: new URL('predict', baseUrl).toString(),
};

console.log("baseUrl value:", baseUrl, "type:", typeof baseUrl);
console.log("endpoints:", endpoints);

export async function apiFetch(endpoint: keyof typeof endpoints, options?: RequestInit) {
    console.log("apiFetch called with:", endpoint, "url:", endpoints[endpoint]);

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

