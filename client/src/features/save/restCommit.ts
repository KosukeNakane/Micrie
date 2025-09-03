import { getAuth } from 'firebase/auth';

type Write = {
  update?: {
    name?: string;
    fields: Record<string, any>;
  };
};

export async function restCommit(params: {
  projectId: string;
  collection: string; // e.g. users/{uid}/projects
  docId?: string;
  fields: Record<string, any>;
}) {
  const { projectId, collection, docId, fields } = params;
  const auth = getAuth();
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error('auth/missing-id-token');

  const toValue = (v: any): any => {
    if (v === null) return { nullValue: null };
    if (typeof v === 'string') return { stringValue: v };
    if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (v instanceof Date) return { timestampValue: v.toISOString() };
    if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
    if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, vv]) => [k, toValue(vv)])) } };
    return { stringValue: String(v) };
  };

  const body = {
    writes: [
      {
        update: {
          name: docId ? `projects/${projectId}/databases/(default)/documents/${collection}/${docId}` : undefined,
          fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, toValue(v)])),
        },
      } as Write,
    ],
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`rest/commit ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

