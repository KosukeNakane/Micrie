// Micrie アプリのルートコンポーネント。
// 各種コンテキストプロバイダーで状態を共有しつつ、AppContentを表示する。
/** @jsxImportSource @emotion/react */
import { createSystem, defineConfig, defaultConfig, ChakraProvider } from "@chakra-ui/react";
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
import { useProjectState } from "@/features/project-save-load/model/store";

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
    const { saveAs } = useSaveProject();
    const [saveModalOpen, setSaveModalOpen] = useState<null | { mode: 'new' | 'as' }>(null);
    const [openModal, setOpenModal] = useState(false);
    const { setTempo } = useTempo();
    const { setMany: setEffects } = useEffects();
    const setHold = useEffectsUiStore((s) => s.setHold);
    const setHoldFor = useEffectsUiStore((s) => s.setHoldFor);
    const setMuted = useChannelsStore((s) => s.setMuted);
    const { setContextAudioBuffer } = useSegment();
    const assemble = useAssembleProjectData();
    const project = useProjectState();

    const handleSaveProject = async () => {
      // 選択モーダルを開く（Cloud/Local）
      setSaveModalOpen({ mode: 'as' });
    };

    const handleSaveProjectAs = async () => {
      setSaveModalOpen({ mode: 'as' });
    };

    const handleOpenProject = async () => {
      if (import.meta.env.DEV) console.log('[open] UI: open modal');
      setOpenModal(true);
    };

    const fetchProjectItems = async () => {
      const t0 = performance.now();
      if (import.meta.env.DEV) console.log('[open] list: start');
      const uid = await ensureAuth();
      const items = await listProjects(uid);
      if (import.meta.env.DEV) console.log('[open] list: done', { count: items.length, elapsedMs: Math.round(performance.now() - t0) });
      return items;
    };

    const onSelectProject = async (id: string) => {
      const t0 = performance.now();
      if (import.meta.env.DEV) console.log('[open] load: start', { id });
      try {
        const uid = await ensureAuth();
        const doc = await loadProject(uid, id);
        if (!doc) return;
        const d = doc.data;
        if (typeof d.tempo === 'number') setTempo(d.tempo);
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
            } else {
              const data = assemble();
              downloadLocalProject(name, data);
            }
          }}
        />
        <OpenProjectModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          fetchItems={fetchProjectItems}
          onSelect={onSelectProject}
          onSelectLocal={async (doc) => {
            const d = (doc as any).data || doc;
            if (typeof d.tempo === 'number') setTempo(d.tempo);
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
 `;

  return (
    <div css={appStyle}>
      <div css={backgroundStyle} />
      <div css={contentStyle}>
        <ChakraProvider value={system}>
          <Providers>
            <AppInner />
          </Providers>
        </ChakraProvider>
      </div>
    </div>
  );
};
