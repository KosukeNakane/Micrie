// [Model] features/model - local.ts
// 役割: ビジネスロジック/状態操作
import type { ProjectData, ProjectDocument } from '@/entities/project';

function sanitizeFileName(name: string): string {
  const trimmed = name.trim() || 'Untitled';
  return trimmed.replace(/[\\/:*?"<>|]/g, '-');
}

export function downloadLocalProject(name: string, data: ProjectData) {
  const now = Date.now();
  const doc: ProjectDocument = {
    meta: {
      id: crypto.randomUUID(),
      name,
      ownerUid: 'local',
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    },
    data,
  };
  const json = JSON.stringify(doc);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(name)}.mip`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function parseLocalProjectFile(file: File): Promise<ProjectDocument> {
  const text = await file.text();
  const obj = JSON.parse(text);
  // 最低限の形だけ検証
  if (!obj || typeof obj !== 'object' || !obj.data) throw new Error('INVALID_PROJECT_FILE');
  return obj as ProjectDocument;
}
