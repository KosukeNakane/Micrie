// [App] app/providers - Providers.tsx
// 役割: アプリ全体のセットアップ/プロバイダ
import { AnalysisModeProvider } from '@entities/analysis/model/AnalysisModeContext';
import { GlobalAudioProvider } from '@entities/audio/model/GlobalAudioContext'; // Context
import { RecordingProvider } from '@entities/audio/model/RecordingContext';
import { RecordingUIProvider } from '@entities/audio/model/RecordingUIContext';
import { BarCountProvider } from '@entities/bar-count/model/BarCountContext';
import { CountBarsAndBeatsProvider } from '@entities/count-bars-and-beats/model/CountBarsAndBeatsContext';
import { EffectsProvider } from '@entities/effects/model/EffectsContext';
import { ModeProvider } from '@entities/mode/model/ModeContext';
import { ChordPatternProvider } from '@entities/pattern/model/ChordPatternContext';
import { DrumPatternProvider } from '@entities/pattern/model/DrumPatternContext';
import { ScaleModeProvider } from '@entities/scale-mode/model/ScaleModeContext';
import { SegmentProvider } from '@entities/segment/model/SegmentContext';
import { TempoProvider } from '@entities/tempo/model/TempoContext';
import { AuthStateListener } from '@entities/user'; // Context
import { VolumeProvider } from '@entities/volume/model/VolumeContext';
import { ChannelsEngineBinder } from '@features/audio-channels';
import {
	ReverbBinder,
	CutFiltersBinder,
	CrushBinder,
	DirtyBinder,
	CombBinder,
} from '@features/effects';
import { ChordPatternToChordsBinder } from '@features/pattern-select/model/ChordPatternToChordsBinder';
import { DrumPatternToRhythmSegmentsBinder } from '@features/pattern-select/model/DrumPatternToRhythmSegmentsBinder';
import { PlaybackBinder } from '@features/playback';
import { TempoTransportBinder } from '@features/tempo';
import { VolumeEngineBinder } from '@features/volume';

import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export const Providers = ({ children }: Props) => (
	<GlobalAudioProvider>
		{/* Tone ノードは各フックでエンジンへ直結（Context整合は各所で実施） */}
		{/* Firebase Auth の状態を購読してグローバル状態に反映 */}
		<AuthStateListener />
		{/* テンポ/ボリュームのコンテキストを上位に配置し、Binder を内部で利用 */}
		<TempoProvider>
			<VolumeProvider>
				{/* テンポ変更を Tone.Transport に常時反映 */}
				<TempoTransportBinder />
				{/* ボリューム変更をエンジンに常時反映 */}
				<VolumeEngineBinder />
				{/* ミュート状態をエンジンに常時反映 */}
				<ChannelsEngineBinder />
				<AnalysisModeProvider>
					<ModeProvider>
						<RecordingProvider>
							<RecordingUIProvider>
								<SegmentProvider>
									<BarCountProvider>
										<ScaleModeProvider>
											<CountBarsAndBeatsProvider>
												<ChordPatternProvider>
													<ChordPatternToChordsBinder />
													<DrumPatternProvider>
														<DrumPatternToRhythmSegmentsBinder />
														<EffectsProvider>
															<CrushBinder />
															<ReverbBinder />
															<CutFiltersBinder />
															<CombBinder />
															<DirtyBinder />
															<PlaybackBinder />
															{children}
														</EffectsProvider>
													</DrumPatternProvider>
												</ChordPatternProvider>
											</CountBarsAndBeatsProvider>
										</ScaleModeProvider>
									</BarCountProvider>
								</SegmentProvider>
							</RecordingUIProvider>
						</RecordingProvider>
					</ModeProvider>
				</AnalysisModeProvider>
			</VolumeProvider>
		</TempoProvider>
	</GlobalAudioProvider>
);
