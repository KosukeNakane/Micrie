import { addDoc, collection } from 'firebase/firestore';

import { db } from '@/lib/firebase';

import { restCommit } from './restCommit';

export async function saveProject(uid: string, name: string) {
  const colPath = `users/${uid}/projects`;
  const now = new Date();
  try {
    await addDoc(collection(db, colPath), {
      uid,
      name,
      createdAt: now,
      updatedAt: now,
    });
  } catch (e) {
    // SDK 経路が不安定/失敗した場合のフォールバック
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID!;
    // 生成IDを安定させるため docId を付与
    const docId = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
    await restCommit({
      projectId,
      collection: colPath,
      docId,
      fields: {
        uid,
        name,
        createdAt: now,
        updatedAt: now,
      },
    });
  }
}
