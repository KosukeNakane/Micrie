/** @jsxImportSource @emotion/react */
import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

import { Providers } from '@app/providers/Providers';
import { AppRouter } from '@app/routes/AppRouter';
import { Sidebar } from '@widgets/sidebar';

import { Scaler } from '@/app/providers/Scaler';
import { OpenProjectModal, SaveProjectModal } from '@/features/project-save-load';
import { NavBar } from '@/shared/ui';
import { ConfirmUnsavedChangesModal } from '@/shared/ui/ConfirmUnsavedChangesModal';
import { LoginRequiredModal } from '@/shared/ui/LoginRequiredModal';
import { ToasterHost } from '@/shared/ui/toaster';
import { SavedPatternPanel } from '@/widgets/saved-patterns/ui/SavedPatternPanel';

import { appStyle, backgroundStyle, contentStyle, savedPatternPanelStyle } from './App.styles';
import { useAudioWarmup } from './hooks/useAudioWarmup';
import { useEnsureDefaultPattern } from './hooks/useEnsureDefaultPattern';
import { useProjectCommands } from './hooks/useProjectCommands';
import { useSpacebarPlayback } from './hooks/useSpacebarPlayback';

const config = defineConfig({
	globalCss: {
		'html, body': {
			bg: 'gray.100',
			color: 'gray.800',
		},
	},
});
const system = createSystem(defaultConfig, config);

const AppInner = () => {
	useSpacebarPlayback();
	const cmds = useProjectCommands();

	return (
		<>
			<Sidebar
				onNewProject={cmds.handleNewProject}
				onOpenProject={cmds.handleOpenProject}
				onSaveProject={cmds.handleSaveProject}
				onSaveProjectAs={cmds.handleSaveProjectAs}
			/>

			<SaveProjectModal
				isOpen={!!cmds.saveModalOpen}
				initialName={cmds.project.currentProjectName}
				onClose={cmds.closeSaveModal}
				onSubmit={cmds.handleSaveModalSubmit}
			/>
			<OpenProjectModal
				isOpen={cmds.openModal}
				onClose={cmds.closeOpenModal}
				fetchItems={cmds.fetchProjectItems}
				onSelect={cmds.onSelectProject}
				onSelectLocal={cmds.onSelectLocal}
			/>

			<ConfirmUnsavedChangesModal
				isOpen={cmds.confirmUnsavedOpen}
				projectName={cmds.project.currentProjectName}
				onCancel={cmds.closeConfirmUnsaved}
				onDiscardAndContinue={cmds.handleConfirmDiscard}
				onSaveAndContinue={cmds.handleConfirmSave}
			/>

			<LoginRequiredModal
				isOpen={cmds.loginRequiredOpen}
				onClose={cmds.closeLoginRequired}
				onLogin={cmds.handleLoginPrompt}
			/>
		</>
	);
};

export const App = () => {
	useEnsureDefaultPattern();
	useAudioWarmup();

	return (
		<div css={appStyle}>
			{/* 背景はスケール外で常にビューポートをカバー */}
			<div css={backgroundStyle} />
			<ChakraProvider value={system}>
				<Providers>
					<AppInner />
					{/* Global toast host (Chakra v3 toaster) */}
					<ToasterHost />
					{/*  */}
					<div css={savedPatternPanelStyle}>
						<SavedPatternPanel />
					</div>
					{/* スケール対象のアプリ本体 */}
					<Scaler>
						<div css={contentStyle}>
							{/* ルーティング等のメインコンテンツ */}
							<AppRouter />
							{/* 画面最下部のNavBar（スケール追従の下余白） */}
							<div
								style={{
									position: 'fixed',
									left: '50%',
									transform: 'translateX(calc(-50% - 12px))',
									bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
									zIndex: 5,
									pointerEvents: 'auto',
								}}
							>
								<NavBar />
							</div>
						</div>
					</Scaler>
				</Providers>
			</ChakraProvider>
		</div>
	);
};
