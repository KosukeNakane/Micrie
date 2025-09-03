// Micrie アプリのルートコンポーネント。
// 各種コンテキストプロバイダーで状態を共有しつつ、AppContentを表示する。
/** @jsxImportSource @emotion/react */
import { createSystem, defineConfig, defaultConfig, ChakraProvider } from "@chakra-ui/react";
import { ToasterHost } from "@/shared/ui/toaster";
import { css } from '@emotion/react';

import AudioUnlockGate from "@/features/audio-unlock/ui/AudioUnlockGate";
import { Providers } from '@app/providers/Providers';
import { AppRouter } from '@app/routes/AppRouter';
import { Sidebar } from '@widgets/sidebar';
import { SaveProjectModal, useSaveProject } from "@/features/project-save-load";
import { OpenProjectModal } from "@/features/project-save-load/ui/OpenProjectModal";
import { ensureAuth } from "@/features/project-save-load/model/auth";
import { listProjects, loadProject } from "@/features/project-save-load/model/io";
import { downloadLocalProject } from "@/features/project-save-load/model/local";
import { useAssembleProjectData } from "@/features/project-save-load/model/serialize";
import { useTempo } from "@/entities/tempo/model/TempoContext";
import { useEffects } from "@/entities/effects/model/EffectsContext";
import { useEffectsUiStore } from "@/features/effects";
import { useChannelsStore } from "@/entities/audio/model/useChannelsStore";
import { useSegment } from "@/entities/segment/model/SegmentContext";
import { useState } from "react";
import { openLoginModal } from "@/features/auth/model/uiStore";
import { LoginRequiredModal } from "@/shared/ui/LoginRequiredModal";
import { useProjectState } from "@/features/project-save-load/model/store";
import { ProjectTitleBar } from "@/shared/ui/ProjectTitleBar";
import { ConfirmUnsavedChangesModal } from "@/shared/ui/ConfirmUnsavedChangesModal";
import { stableStringify } from "@/shared/lib/stableStringify";
import { useVolume } from "@/entities/volume/model/VolumeContext";
import { useScaleMode } from "@/entities/scale-mode/model/ScaleModeContext";
import { useChordPattern } from "@/entities/pattern/model/ChordPatternContext";
import { useDrumPattern } from "@/entities/pattern/model/DrumPatternContext";
import { getInitialProjectData } from "@/features/project-save-load/model/initial";

const config = defineConfig({
  globalCss: {
    "html, body": {
      bg: "gray.100",
      color: "gray.800",
    },
  },
});
const system = createSystem(defaultConfig, config);

export const App = () => {
  const AppInner = () => {
    const { save, saveAs } = useSaveProject();
    const [saveModalOpen, setSaveModalOpen] = useState<null | { mode: 'new' | 'as' }>(null);
    const [openModal, setOpenModal] = useState(false);
    const [confirmUnsavedOpen, setConfirmUnsavedOpen] = useState(false);
    const [openAfterSave, setOpenAfterSave] = useState(false);
    const [newAfterSave, setNewAfterSave] = useState(false);
    const [confirmForNew, setConfirmForNew] = useState(false);
    const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
    const { setTempo } = useTempo();
    const { setMany: setEffects, reset: resetEffects } = useEffects();
    const setHold = useEffectsUiStore((s) => s.setHold);
    const setHoldFor = useEffectsUiStore((s) => s.setHoldFor);
    const setMuted = useChannelsStore((s) => s.setMuted);
    const { setContextAudioBuffer } = useSegment();
    const assemble = useAssembleProjectData();
    const project = useProjectState();
    const { setVolume } = useVolume();
    const { setScaleMode } = useScaleMode();
    const { setChordPattern } = useChordPattern();
    const { setDrumPattern } = useDrumPattern();

    const handleSaveProject = async () => {
      try {
        await save(); // 既存IDがあれば上書き保存、無ければ NAME_REQUIRED を投げる
      } catch (e: any) {
        if (String(e?.message) === 'NAME_REQUIRED') {
          // 新規（IDなし）の場合は名前を付けて保存モーダルを開く
          setSaveModalOpen({ mode: 'as' });
          return;
        }
        if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
          setLoginRequiredOpen(true);
          return;
        }
        throw e;
      }
    };

    const handleSaveProjectAs = async () => {
      try {
        await ensureAuth();
      } catch (e: any) {
        if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
          setLoginRequiredOpen(true);
          return;
        }
        throw e;
      }
      setSaveModalOpen({ mode: 'as' });
    };

    const handleOpenProject = async () => {
      if (import.meta.env.DEV) console.log('[open] UI: open modal');
      try {
        await ensureAuth();
      } catch (e: any) {
        if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
          setLoginRequiredOpen(true);
          return;
        }
        throw e;
      }
      // 未保存変更チェック: 一度も保存していない場合（lastHashがnull）も確認を出す
      try {
        const currentHash = stableStringify(assemble() as any);
        const lastHash = useProjectState.getState().lastSavedHash;
        const initialHash = stableStringify(getInitialProjectData() as any);
        const needConfirm = lastHash ? (currentHash !== lastHash) : (currentHash !== initialHash);
        if (needConfirm) {
          setConfirmForNew(false);
          setConfirmUnsavedOpen(true);
          return;
        }
      } catch {}
      setOpenModal(true);
    };

    const resetToInitialProject = () => {
      project.clear();
      project.setProject(null, 'Untitled');
      project.setLastSavedHash(null);
      try { setTempo(90); } catch {}
      try { setVolume(100); } catch {}
      try { resetEffects(); } catch {}
      try { setScaleMode('major' as any); } catch {}
      try { setChordPattern('pattern1' as any); } catch {}
      try { setDrumPattern('basic' as any); } catch {}
      try { setHold(false); } catch {}
      try { setMuted('melody', false); setMuted('chord', false); setMuted('drum', false); } catch {}
    };

    const handleNewProject = () => {
      // Confirm only when there are changes (ignore untouched initial state)
      try {
        const currentHash = stableStringify(assemble() as any);
        const lastHash = useProjectState.getState().lastSavedHash;
        const initialHash = stableStringify(getInitialProjectData() as any);
        const needConfirm = lastHash ? (currentHash !== lastHash) : (currentHash !== initialHash);
        if (needConfirm) {
          setConfirmForNew(true);
          setConfirmUnsavedOpen(true);
          return;
        }
      } catch {}
      // No changes -> reset immediately
      resetToInitialProject();
    };

    const fetchProjectItems = async () => {
      const t0 = performance.now();
      if (import.meta.env.DEV) console.log('[open] list: start');
      let uid: string;
      try {
        uid = await ensureAuth();
      } catch (e: any) {
        if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
          setLoginRequiredOpen(true);
          return [] as any[];
        }
        throw e;
      }
      const items = await listProjects(uid);
      if (import.meta.env.DEV) console.log('[open] list: done', { count: items.length, elapsedMs: Math.round(performance.now() - t0) });
      return items;
    };

    const onSelectProject = async (id: string) => {
      const t0 = performance.now();
      if (import.meta.env.DEV) console.log('[open] load: start', { id });
      try {
        let uid: string;
        try {
          uid = await ensureAuth();
        } catch (e: any) {
          if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
            setLoginRequiredOpen(true);
            return;
          }
          throw e;
        }
        const doc = await loadProject(uid, id);
        if (!doc) return;
        // プロジェクト名とIDをステートに反映
        try {
          const name = (doc as any)?.meta?.name ?? id;
          project.setProject(id, String(name));
          try { project.setLastSavedHash(stableStringify((doc as any).data)); } catch {}
        } catch {}
        const d = doc.data;
        if (typeof d.tempo === 'number') setTempo(d.tempo);
        if (d.chordPattern) setChordPattern(d.chordPattern as any);
        if (d.drumPattern) setDrumPattern(d.drumPattern as any);
        if (d.effects) setEffects(d.effects as any);
        if (d.effectsHold) {
          setHold(!!d.effectsHold.holdAll);
          const by = d.effectsHold.holdByKey || {};
          for (const [k, v] of Object.entries(by)) setHoldFor(k as any, !!v);
        }
        if (d.channelsMuted) {
          setMuted('melody', !!d.channelsMuted.melody);
          setMuted('chord', !!d.channelsMuted.chord);
          setMuted('drum', !!d.channelsMuted.drum);
        }
        if (d.audio?.audioUrl) {
          try {
            if (import.meta.env.DEV) console.log('[open] audio: fetching', { url: d.audio.audioUrl });
            const res = await fetch(d.audio.audioUrl);
            const ab = await res.arrayBuffer();
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const buf = await ctx.decodeAudioData(ab);
            setContextAudioBuffer('melody', buf);
            if (import.meta.env.DEV) console.log('[open] audio: decoded & set');
          } catch (e) {
            console.warn('Audio load failed:', e);
          }
        }
        if (import.meta.env.DEV) console.log('[open] load: done', { elapsedMs: Math.round(performance.now() - t0) });
      } finally {
        setOpenModal(false);
      }
    };

    return (
      <>
        {/* 左側の固定サイドバー（Chakra/Providers コンテキスト内） */}
        <Sidebar
          onNewProject={handleNewProject}
          onOpenProject={handleOpenProject}
          onSaveProject={handleSaveProject}
          onSaveProjectAs={handleSaveProjectAs}
        />
        {/* アプリ全体に渡す状態管理のコンテキストプロバイダー群 + ルーティング */}
        <AudioUnlockGate /> {/* AudioContextのロック解除を促すUI */}
        <AppRouter />

        {/* Save モーダル */}
        <SaveProjectModal
          isOpen={!!saveModalOpen}
          initialName={project.currentProjectName}
          onClose={() => setSaveModalOpen(null)}
          onSubmit={async ({ name, mode }) => {
            if (mode === 'cloud') {
              await saveAs(name);
              if (openAfterSave) {
                setOpenAfterSave(false);
                setOpenModal(true);
              }
              if (newAfterSave) {
                setNewAfterSave(false);
                resetToInitialProject();
              }
            } else {
              const data = assemble();
              downloadLocalProject(name, data);
              if (openAfterSave) {
                setOpenAfterSave(false);
                setOpenModal(true);
              }
              if (newAfterSave) {
                setNewAfterSave(false);
                resetToInitialProject();
              }
            }
          }}
        />
        <OpenProjectModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          fetchItems={fetchProjectItems}
          onSelect={onSelectProject}
          onSelectLocal={async (doc) => {
            // プロジェクト名とIDをステートに反映（ローカルファイル）
            try {
              const meta = (doc as any).meta || {};
              const id = String(meta.id || 'local');
              const name = String(meta.name || 'Untitled');
              project.setProject(id, name);
            } catch {}
            const d = (doc as any).data || doc;
            try { project.setLastSavedHash(stableStringify(d)); } catch {}
            if (typeof d.tempo === 'number') setTempo(d.tempo);
            if ((d as any).chordPattern) setChordPattern((d as any).chordPattern as any);
            if ((d as any).drumPattern) setDrumPattern((d as any).drumPattern as any);
            if (d.effects) setEffects(d.effects as any);
            if (d.effectsHold) {
              setHold(!!d.effectsHold.holdAll);
              const by = d.effectsHold.holdByKey || {};
              for (const [k, v] of Object.entries(by)) setHoldFor(k as any, !!v);
            }
            if (d.channelsMuted) {
              setMuted('melody', !!d.channelsMuted.melody);
              setMuted('chord', !!d.channelsMuted.chord);
              setMuted('drum', !!d.channelsMuted.drum);
            }
          }}
        />

        {/* 未保存変更の確認 */}
        <ConfirmUnsavedChangesModal
          isOpen={confirmUnsavedOpen}
          projectName={project.currentProjectName}
          onCancel={() => setConfirmUnsavedOpen(false)}
          onDiscardAndContinue={() => {
            setConfirmUnsavedOpen(false);
            if (confirmForNew) {
              resetToInitialProject();
            } else {
              setOpenModal(true);
            }
            setConfirmForNew(false);
          }}
          onSaveAndContinue={async () => {
            try {
              await save();
              setConfirmUnsavedOpen(false);
              if (confirmForNew) {
                resetToInitialProject();
              } else {
                setOpenModal(true);
              }
              setConfirmForNew(false);
            } catch (e: any) {
              if (String(e?.message) === 'NAME_REQUIRED') {
                setConfirmUnsavedOpen(false);
                if (confirmForNew) setNewAfterSave(true); else setOpenAfterSave(true);
                setSaveModalOpen({ mode: 'as' });
                return;
              }
              if (String(e?.message) === 'OPEN_LOGIN_MODAL') {
                setConfirmUnsavedOpen(false);
                setLoginRequiredOpen(true);
                return;
              }
              throw e;
            }
          }}
        />

        {/* Login required modal */}
        <LoginRequiredModal
          isOpen={loginRequiredOpen}
          onClose={() => setLoginRequiredOpen(false)}
          onLogin={() => { setLoginRequiredOpen(false); openLoginModal(); }}
        />
      </>
    );
  };

  // アプリ全体のベーススタイル（背景ぼかし含むレイヤー構成）
  const appStyle = css`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
 `;

  /* ぼかしフィルター付きの背景画像 */
  const backgroundStyle = css`
  position: absolute;
  inset: 0;
  background-image: url(/background.jpg);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(50px);
  z-index: 0;
 `;

  /* 背景の上に重ねるUIのコンテンツレイヤー */
  const contentStyle = css`
  position: relative;
  z-index: 1;
  /* 左サイドバーの幅分だけ右側にオフセット */
  padding-left: 240px;
  /* タイトルバーの高さ分だけ上に余白 */
  padding-top: 56px;
 `;

  return (
    <div css={appStyle}>
      <div css={backgroundStyle} />
      <div css={contentStyle}>
        <ChakraProvider value={system}>
          <Providers>
            {/* 画面上部に現在のプロジェクト名を表示 */}
            <ProjectTitleBar />
            <AppInner />
          </Providers>
          {/* Global toast host (Chakra v3 toaster) */}
          <ToasterHost />
        </ChakraProvider>
      </div>
    </div>
  );
};
