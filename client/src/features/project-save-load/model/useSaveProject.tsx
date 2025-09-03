import { useCallback } from "react";
import { ensureAuth } from "./auth";
import { useProjectState } from "./store";
import { useAssembleProjectData } from "./serialize";
import { createOrUpdateProjectDoc } from "./io";

type SaveOptions = {
  audioBlob?: Blob | null;
  forceAskName?: boolean;
};

function sanitizeProjectName(name: string): string {
  let trimmed = (name ?? '').trim() || 'Untitled';
  // Remove leading "Micrie" with optional space/hyphen/underscore
  trimmed = trimmed.replace(/^Micrie[\s_-]*/i, '');
  return trimmed;
}

export function useSaveProject() {
  const assemble = useAssembleProjectData();
  const project = useProjectState();

  const saveAs = useCallback(async (name: string, audioBlob?: Blob | null) => {
    const t0 = performance.now();
    if (import.meta.env.DEV) console.log('[save] saveAs: start', { name, hasAudio: !!audioBlob });
    let uid: string;
    try {
      uid = await ensureAuth();
    } catch (e: any) {
      if (String(e?.message) === 'REDIRECTING_FOR_AUTH') {
        try { window?.alert?.('Googleにリダイレクトしてサインインします…'); } catch {}
        return; // リダイレクトに移行
      }
      console.error('Auth error:', e);
      try { window?.alert?.('サインインに失敗しました。もう一度お試しください。'); } catch {}
      return;
    }
    const data = assemble();
    if (import.meta.env.DEV) console.log('[save] saveAs: got uid & assembled data', { uid, data });
    let projectId: string | null = null;
    // Storage アップロードを一時停止: audioBlob があっても無視し、Firestore のみ保存
    try {
      const cleanName = sanitizeProjectName(name);
      if (import.meta.env.DEV) console.log('[save] saveAs: writing project doc…', { projectId, name: cleanName });
      const id = await createOrUpdateProjectDoc(uid, projectId, cleanName, data);
      project.setProject(id, cleanName);
      if (import.meta.env.DEV) console.log('[save] saveAs: done', { id, elapsedMs: Math.round(performance.now() - t0) });
      try { window?.alert?.("Project saved"); } catch {}
    } catch (e) {
      console.error('Save error:', e);
      try { window?.alert?.('保存に失敗しました。ネットワークと権限を確認してください。'); } catch {}
    }
  }, [assemble, project]);

  const save = useCallback(async ({ audioBlob, forceAskName }: SaveOptions = {}) => {
    const t0 = performance.now();
    if (import.meta.env.DEV) console.log('[save] save: start', { forceAskName, hasAudio: !!audioBlob });
    let uid: string;
    try {
      uid = await ensureAuth();
    } catch (e: any) {
      if (String(e?.message) === 'REDIRECTING_FOR_AUTH') {
        try { window?.alert?.('Googleにリダイレクトしてサインインします…'); } catch {}
        return; // リダイレクトに移行
      }
      console.error('Auth error:', e);
      try { window?.alert?.('サインインに失敗しました。もう一度お試しください。'); } catch {}
      return;
    }
    const data = assemble();
    if (import.meta.env.DEV) console.log('[save] save: got uid & assembled data', { uid, data });

    // 既存プロジェクトがなければ名前入力が必要
    if (!project.currentProjectId || forceAskName) {
      if (import.meta.env.DEV) console.warn('[save] save: NAME_REQUIRED');
      throw new Error("NAME_REQUIRED");
    }

    // Storage アップロードを一時停止: audioBlob があっても無視し、Firestore のみ保存
    try {
      const effectiveName = project.currentProjectName ?? "Untitled";
      const cleanName = sanitizeProjectName(effectiveName);
      if (import.meta.env.DEV) console.log('[save] save: writing project doc…', { id: project.currentProjectId, name: cleanName });
      const id = await createOrUpdateProjectDoc(uid, project.currentProjectId, cleanName, data);
      project.setProject(id, cleanName);
      if (import.meta.env.DEV) console.log('[save] save: done', { id, elapsedMs: Math.round(performance.now() - t0) });
      try { window?.alert?.("Project saved"); } catch {}
    } catch (e) {
      console.error('Save error:', e);
      try { window?.alert?.('保存に失敗しました。ネットワークと権限を確認してください。'); } catch {}
    }
  }, [assemble, project]);

  return { save, saveAs };
}
