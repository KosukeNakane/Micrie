import { getFirebaseAuth } from "@/shared/api/firebase";
import { getApp } from 'firebase/app';

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { bytesValue: string }
  | { referenceValue: string }
  | { geoPointValue: { latitude: number; longitude: number } }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

function encodeValue(v: any): FirestoreValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    // Firestore REST では整数/浮動小数の区別が必要だが、汎用に double とする
    return { doubleValue: v };
  }
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  if (typeof v === "object") {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, val] of Object.entries(v)) fields[k] = encodeValue(val);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function encodeDocumentFields(obj: Record<string, any>): Record<string, FirestoreValue> {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'undefined') continue; // skip undefined
    fields[k] = encodeValue(v);
  }
  return fields;
}

async function authHeader(): Promise<Record<string, string>> {
  const auth = await getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("AUTH_REQUIRED");
  const idToken = await user.getIdToken(true);
  return {
    Authorization: `Bearer ${idToken}`,
    "x-goog-user-project": projectId,
  };
}

// Prefer app's configured projectId to avoid env mismatch; fallback to env
let appProjectId = '';
try { appProjectId = String(getApp().options.projectId || '').trim(); } catch {}
const envProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || "").trim();
const projectId = (appProjectId || envProjectId);
if (import.meta.env.DEV) {
  const used = projectId;
  const appId = appProjectId || '(none)';
  const envId = envProjectId || '(none)';
  // eslint-disable-next-line no-console
  console.log('[rest] projectId:', { used, appId, envId, mismatch: appId && envId && appId !== envId });
}
const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit & { timeoutMs?: number }) {
  const timeoutMs = init?.timeoutMs ?? 10000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const { signal, timeoutMs: _omit, ...rest } = init || {} as any;
  return fetch(input, { ...rest, signal: controller.signal }).finally(() => clearTimeout(id));
}

export async function restCreateOrUpdateProject(
  uid: string,
  projectIdOrNull: string | null,
  name: string,
  data: any
): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };
  const docPathBase = `${base}/users/${encodeURIComponent(uid)}/projects`;
  const now = Date.now();
  const meta: Record<string, any> = {
    id: projectIdOrNull || undefined,
    name,
    ownerUid: uid,
    updatedAt: now,
    schemaVersion: 1,
  };
  if (!projectIdOrNull) meta.createdAt = now;
  const payload = {
    fields: encodeDocumentFields({ meta, data }),
  } as any;

  if (!projectIdOrNull) {
    // Create new with explicit documentId to avoid 404s on some REST paths
    const newId = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
    const url = `${docPathBase}?documentId=${encodeURIComponent(newId)}`;
    if (import.meta.env.DEV) console.log('[rest] create start', { url });
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      timeoutMs: 10000,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`REST_CREATE_FAILED_${res.status}: ${text}`);
    }
    return newId;
  } else {
    // Upsert specific ID via PATCH (creates if absent); allowMissing is not supported by Firestore REST
    const url = `${docPathBase}/${encodeURIComponent(projectIdOrNull)}`;
    if (import.meta.env.DEV) console.log('[rest] upsert start', { url });
    const res = await fetchWithTimeout(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
      timeoutMs: 10000,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`REST_PATCH_FAILED_${res.status}: ${text}`);
    }
    return projectIdOrNull;
  }
}

export async function restUpsertDoc(docPath: string, fields: Record<string, any>) {
  // Always attach ID token + x-goog-user-project
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader()),
  };

  const encodedFields = encodeDocumentFields(fields);

  // First, try POST create with explicit documentId
  const lastSlash = docPath.lastIndexOf('/');
  if (lastSlash <= 0 || lastSlash === docPath.length - 1) {
    throw new Error(`REST_UPSERT_DOC_FAILED_0: invalid docPath '${docPath}'`);
  }
  const collectionPath = docPath.slice(0, lastSlash);
  const documentId = docPath.slice(lastSlash + 1);
  const postUrl = `${base}/${collectionPath}?documentId=${encodeURIComponent(documentId)}`;
  if (import.meta.env.DEV) console.log('[rest] upsert doc (POST create)', { postUrl });
  let res = await fetchWithTimeout(postUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({ fields: encodedFields }),
    timeoutMs: 10000,
  });
  if (res.ok) return;

  // Fallback to PATCH update (e.g., when document already exists or POST blocked)
  const patchUrl = `${base}/${docPath}`;
  if (import.meta.env.DEV) console.warn('[rest] upsert doc (POST) failed, fallback to PATCH', { status: res.status });
  res = await fetchWithTimeout(patchUrl, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: encodedFields }),
    timeoutMs: 10000,
  });
  if (!res.ok) {
    const t2 = await res.text().catch(() => '');
    throw new Error(`REST_UPSERT_DOC_FAILED_${res.status}: ${t2}`);
  }
}

export async function restListUserProjects(uid: string) {
  const headers = await authHeader();
  const url = `${base}/users/${encodeURIComponent(uid)}/projects`;
  if (import.meta.env.DEV) console.log('[rest] list start', { url });
  const res = await fetchWithTimeout(url, { headers, timeoutMs: 10000 });
  if (!res.ok) throw new Error(`REST_LIST_FAILED_${res.status}`);
  const json = await res.json();
  // json.documents?: array
  const docs = (json.documents || []) as any[];
  return docs.map((d) => ({
    name: d.name as string,
    id: String((d.name as string).split('/').pop()),
    fields: d.fields as Record<string, any> | undefined,
    updateTime: d.updateTime as string | undefined,
    createTime: d.createTime as string | undefined,
  }));
}

export async function restGetUserProject(uid: string, docId: string) {
  const headers = await authHeader();
  const url = `${base}/users/${encodeURIComponent(uid)}/projects/${encodeURIComponent(docId)}`;
  if (import.meta.env.DEV) console.log('[rest] get start', { url });
  const res = await fetchWithTimeout(url, { headers, timeoutMs: 10000 });
  if (!res.ok) throw new Error(`REST_GET_FAILED_${res.status}`);
  return res.json();
}

export async function restDeleteUserProject(uid: string, docId: string): Promise<void> {
  const headers = await authHeader();
  const url = `${base}/users/${encodeURIComponent(uid)}/projects/${encodeURIComponent(docId)}`;
  if (import.meta.env.DEV) console.log('[rest] delete start', { url });
  const res = await fetchWithTimeout(url, { method: 'DELETE', headers, timeoutMs: 10000 });
  if (!res.ok) throw new Error(`REST_DELETE_FAILED_${res.status}`);
}
