// src/lib/apiClient.ts
const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const endpoints = {
    pitch: new URL('/pitch', baseUrl).toString(),
    analyze: new URL('/analyze', baseUrl).toString(),
    predict: new URL('/predict', baseUrl).toString(),
};

export async function apiFetch(endpoint: keyof typeof endpoints, options?: RequestInit) {
    const res = await fetch(endpoints[endpoint], options);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
}