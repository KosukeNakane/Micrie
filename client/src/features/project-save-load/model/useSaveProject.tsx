import { useCallback } from "react";

import { stableStringify } from "@/shared/lib/stableStringify";
import { toaster } from "@/shared/ui/toaster";

import { ensureAuth } from "./auth";
import { createOrUpdateProjectDoc } from "./io";
import { useAssembleProjectData } from "./serialize";
import { useProjectState } from "./store";

type SaveOptions = {
  audioBlob?: Blob | null;
  forceAskName?: boolean;
};

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
      if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
        // ログインモーダルを開いたので処理中断
        return;
      }
      console.error('Auth error:', e);
      toaster.error({ title: 'サインインに失敗しました', description: 'もう一度お試しください。' });
      return;
    }
    const data = assemble();
    if (import.meta.env.DEV) console.log('[save] saveAs: got uid & assembled data', { uid, data });
    const projectId: string | null = null;
    // Storage アップロードを一時停止: audioBlob があっても無視し、Firestore のみ保存
    try {
      const effectiveName = (name ?? '').trim() || 'Untitled';
      if (import.meta.env.DEV) console.log('[save] saveAs: writing project doc…', { projectId, name: effectiveName });
      const id = await createOrUpdateProjectDoc(uid, projectId, effectiveName, data);
      project.setProject(id, effectiveName);
      project.setLastSavedHash(stableStringify(data as any));
      if (import.meta.env.DEV) console.log('[save] saveAs: done', { id, elapsedMs: Math.round(performance.now() - t0) });
      toaster.success({ title: '保存しました' });
    } catch (e) {
      console.error('Save error:', e);
      toaster.error({ title: '保存に失敗しました', description: 'ネットワークと権限を確認してください。' });
    }
  }, [assemble, project]);

  const save = useCallback(async ({ audioBlob, forceAskName }: SaveOptions = {}) => {
    const t0 = performance.now();
    if (import.meta.env.DEV) console.log('[save] save: start', { forceAskName, hasAudio: !!audioBlob });
    let uid: string;
    try {
      uid = await ensureAuth();
    } catch (e: any) {
      if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
        return;
      }
      console.error('Auth error:', e);
      toaster.error({ title: 'サインインに失敗しました', description: 'もう一度お試しください。' });
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
      const effectiveName = (project.currentProjectName ?? "").trim() || "Untitled";
      if (import.meta.env.DEV) console.log('[save] save: writing project doc…', { id: project.currentProjectId, name: effectiveName });
      const id = await createOrUpdateProjectDoc(uid, project.currentProjectId, effectiveName, data);
      project.setProject(id, effectiveName);
      project.setLastSavedHash(stableStringify(data as any));
      if (import.meta.env.DEV) console.log('[save] save: done', { id, elapsedMs: Math.round(performance.now() - t0) });
      toaster.success({ title: '保存しました' });
    } catch (e) {
      console.error('Save error:', e);
      toaster.error({ title: '保存に失敗しました', description: 'ネットワークと権限を確認してください。' });
    }
  }, [assemble, project]);

  return { save, saveAs };
}
