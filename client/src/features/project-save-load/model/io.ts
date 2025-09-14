import { doc, setDoc, serverTimestamp, getDoc, collection, addDoc, Timestamp, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import type { ProjectData, ProjectDocument } from "@/entities/project";
import { getDb, getStorageBucket } from "@/shared/api/firebase";
import { restCreateOrUpdateProject, restListUserProjects, restGetUserProject, restUpsertDoc, restDeleteUserProject } from "@/shared/api/firestoreRest";

export async function uploadAudio(uid: string, projectId: string, audio: Blob): Promise<string> {
  const storage = getStorageBucket();
  const r = ref(storage, `users/${uid}/projects/${projectId}/audio.webm`);
  if (import.meta.env.DEV) console.log('[save] uploadAudio: start', { path: r.fullPath, size: audio.size });
  await uploadBytes(r, audio, { contentType: audio.type || "audio/webm" });
  const url = await getDownloadURL(r);
  if (import.meta.env.DEV) console.log('[save] uploadAudio: done', { url });
  return url;
}

// --- SDK timeout helper ---
const SDK_TIMEOUT_MS = Number((import.meta as any).env?.VITE_FIRESTORE_SDK_TIMEOUT_MS ?? 12000);
const FORCE_REST = String((import.meta as any).env?.VITE_FIRESTORE_FORCE_REST ?? '') === '1';

async function raceWithTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timeoutId: any;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`SDK_TIMEOUT:${label}`)), SDK_TIMEOUT_MS);
  });
  try {
    const result = await Promise.race([promise, timeout]);
    clearTimeout(timeoutId);
    return result as T;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

async function ensureUserDocExists(uid: string): Promise<void> {
  const now = Date.now();
  if (FORCE_REST) {
    await restUpsertDoc(`users/${encodeURIComponent(uid)}`, { uid, createdAt: now, updatedAt: now });
    return;
  }
  try {
    const db = getDb();
    const d = doc(db, `users/${uid}`);
    await raceWithTimeout(setDoc(d, { uid, updatedAt: now }, { merge: true } as any), 'setDoc:user');
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[save] ensureUserDocExists: SDK failed, REST upsert', e);
    await restUpsertDoc(`users/${encodeURIComponent(uid)}`, { uid, updatedAt: now });
  }
}

export async function createOrUpdateProjectDoc(uid: string, projectId: string | null, name: string, data: ProjectData): Promise<string> {
  const db = getDb();
  const now = Date.now();
  const t0 = performance.now();
  if (import.meta.env.DEV) console.log('[save] writeDoc: start', { uid, projectId, name });
  // Ensure parent users/{uid} exists for REST compatibility
  await ensureUserDocExists(uid);
  if (FORCE_REST) {
    if (import.meta.env.DEV) console.log('[save] writeDoc: FORCE_REST enabled');
    const id = await restCreateOrUpdateProject(uid, projectId, name, data);
    if (import.meta.env.DEV) console.log('[save] writeDoc: REST done', { id, elapsedMs: Math.round(performance.now() - t0) });
    return id;
  }
  if (!projectId) {
    const col = collection(db, `users/${uid}/projects`);
    try {
      if (import.meta.env.DEV) console.log('[save] writeDoc: SDK addDoc');
      const docRef = await raceWithTimeout(addDoc(col, {
        meta: {
          name,
          ownerUid: uid,
          createdAt: now,
          updatedAt: now,
          schemaVersion: 1 as const,
        },
        data,
        _sv: serverTimestamp(),
      } as ProjectDocument & { _sv: Timestamp }), 'addDoc');
      if (import.meta.env.DEV) console.log('[save] writeDoc: SDK addDoc done', { id: docRef.id, elapsedMs: Math.round(performance.now() - t0) });
      return docRef.id;
    } catch (e) {
      console.warn('[fs-sdk] addDoc failed, fallback to REST:', e);
      if (import.meta.env.DEV) console.log('[save] writeDoc: REST create (reason:', (e as any)?.message, ')');
      const id = await restCreateOrUpdateProject(uid, null, name, data);
      if (import.meta.env.DEV) console.log('[save] writeDoc: REST create done', { id, elapsedMs: Math.round(performance.now() - t0) });
      return id;
    }
  }
  const d = doc(db, `users/${uid}/projects/${projectId}`);
  try {
    if (import.meta.env.DEV) console.log('[save] writeDoc: SDK getDoc+setDoc');
    const snap = await raceWithTimeout(getDoc(d), 'getDoc');
    if (!snap.exists()) {
      await raceWithTimeout(setDoc(d, {
        meta: {
          id: projectId,
          name,
          ownerUid: uid,
          createdAt: now,
          updatedAt: now,
          schemaVersion: 1 as const,
        },
        data,
        _sv: serverTimestamp(),
      } as ProjectDocument & { _sv: Timestamp }), 'setDoc:create');
    } else {
      await raceWithTimeout(setDoc(d, {
        ...(snap.data() as any),
        meta: { ...((snap.data() as any).meta), name, updatedAt: now },
        data,
        _sv: serverTimestamp(),
      }), 'setDoc:update');
    }
    if (import.meta.env.DEV) console.log('[save] writeDoc: SDK setDoc done', { id: projectId, elapsedMs: Math.round(performance.now() - t0) });
    return projectId;
  } catch (e) {
    console.warn('[fs-sdk] setDoc/getDoc failed, fallback to REST:', e);
    if (import.meta.env.DEV) console.log('[save] writeDoc: REST upsert');
    await restCreateOrUpdateProject(uid, projectId, name, data);
    if (import.meta.env.DEV) console.log('[save] writeDoc: REST upsert done', { id: projectId, elapsedMs: Math.round(performance.now() - t0) });
    return projectId;
  }
}

export async function listProjects(uid: string): Promise<{ id: string; name: string; updatedAt?: number; createdAt?: number }[]> {
  const db = getDb();
  if (FORCE_REST) {
    if (import.meta.env.DEV) console.log('[open] list: FORCE_REST enabled');
    const docs = await restListUserProjects(uid);
    return docs.map((d) => {
      const fields = d.fields || {} as any;
      const meta = (fields.meta?.mapValue?.fields ?? {}) as any;
      const name = meta.name?.stringValue ?? d.id;
      const updatedAt = meta.updatedAt?.doubleValue ?? (meta.updatedAt?.integerValue ? Number(meta.updatedAt.integerValue) : undefined);
      return { id: d.id, name, updatedAt };
    });
  }
  try {
    if (import.meta.env.DEV) console.log('[open] list: SDK getDocs');
    const col = collection(db, `users/${uid}/projects`);
    const snap = await raceWithTimeout(getDocs(col), 'getDocs');
    return snap.docs.map((d) => {
      const data = d.data() as any;
      const name = data?.meta?.name ?? d.id;
      const updatedAt = data?.meta?.updatedAt as number | undefined;
      const createdAt = data?.meta?.createdAt as number | undefined;
      return { id: d.id, name, updatedAt, createdAt };
    });
  } catch (e) {
    console.warn('[fs-sdk] listProjects failed, fallback to REST:', e);
    if (import.meta.env.DEV) console.log('[open] list: REST list');
    const docs = await restListUserProjects(uid);
    return docs.map((d) => {
      const fields = d.fields || {};
      const meta = (fields.meta?.mapValue?.fields ?? {}) as any;
      const name = meta.name?.stringValue ?? d.id;
      const updatedAt = meta.updatedAt?.doubleValue ?? (meta.updatedAt?.integerValue ? Number(meta.updatedAt.integerValue) : undefined);
      const createdAt = meta.createdAt?.doubleValue ?? (meta.createdAt?.integerValue ? Number(meta.createdAt.integerValue) : undefined);
      return { id: d.id, name, updatedAt, createdAt };
    });
  }
}

export async function loadProject(uid: string, projectId: string): Promise<ProjectDocument | null> {
  const db = getDb();
  if (FORCE_REST) {
    if (import.meta.env.DEV) console.log('[open] load: FORCE_REST enabled', { projectId });
    const j = await restGetUserProject(uid, projectId);
    const f = (j.fields || {}) as any;
    const decode = (fv: any): any => {
      if (!fv || typeof fv !== 'object') return fv;
      if ('stringValue' in fv) return fv.stringValue;
      if ('doubleValue' in fv) return fv.doubleValue;
      if ('integerValue' in fv) return Number(fv.integerValue);
      if ('booleanValue' in fv) return !!fv.booleanValue;
      if ('timestampValue' in fv) return fv.timestampValue;
      if ('nullValue' in fv) return null;
      if ('arrayValue' in fv) return (fv.arrayValue.values || []).map(decode);
      if ('mapValue' in fv) {
        const obj: any = {};
        const fields = fv.mapValue.fields || {};
        for (const [k, v] of Object.entries(fields)) obj[k] = decode(v as any);
        return obj;
      }
      return fv;
    };
    const meta = decode(f.meta);
    const data = decode(f.data);
    return { meta, data } as ProjectDocument;
  }
  try {
    if (import.meta.env.DEV) console.log('[open] load: SDK getDoc', { projectId });
    const d = doc(db, `users/${uid}/projects/${projectId}`);
    const snap = await raceWithTimeout(getDoc(d), 'getDoc:load');
    if (!snap.exists()) return null;
    if (import.meta.env.DEV) console.log('[open] load: SDK getDoc done');
    return snap.data() as ProjectDocument;
  } catch (e) {
    console.warn('[fs-sdk] getDoc failed, fallback to REST:', e);
    if (import.meta.env.DEV) console.log('[open] load: REST get', { projectId });
    const j = await restGetUserProject(uid, projectId);
    const f = (j.fields || {}) as any;
    const decode = (fv: any): any => {
      if (!fv || typeof fv !== 'object') return fv;
      if ('stringValue' in fv) return fv.stringValue;
      if ('doubleValue' in fv) return fv.doubleValue;
      if ('integerValue' in fv) return Number(fv.integerValue);
      if ('booleanValue' in fv) return !!fv.booleanValue;
      if ('timestampValue' in fv) return fv.timestampValue;
      if ('nullValue' in fv) return null;
      if ('arrayValue' in fv) return (fv.arrayValue.values || []).map(decode);
      if ('mapValue' in fv) {
        const obj: any = {};
        const fields = fv.mapValue.fields || {};
        for (const [k, v] of Object.entries(fields)) obj[k] = decode(v as any);
        return obj;
      }
      return fv;
    };
    const meta = decode(f.meta);
    const data = decode(f.data);
    if (import.meta.env.DEV) console.log('[open] load: REST get done');
    return { meta, data } as ProjectDocument;
  }
}

export async function deleteProject(uid: string, projectId: string): Promise<void> {
  if (FORCE_REST) {
    await restDeleteUserProject(uid, projectId);
    return;
  }
  try {
    const db = getDb();
    const d = doc(db, `users/${uid}/projects/${projectId}`);
    await deleteDoc(d);
  } catch (e) {
    console.warn('[fs-sdk] delete failed, fallback to REST:', e);
    await restDeleteUserProject(uid, projectId);
  }
}
