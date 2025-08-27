import { AnalysisModeProvider } from '@entities/analysis/model/AnalysisModeContext';
import { GlobalAudioProvider } from '@entities/audio/model/GlobalAudioContext';
import { RecordingProvider } from '@entities/audio/model/RecordingContext';
import { RecordingUIProvider } from '@entities/audio/model/RecordingUIContext';
import { BarCountProvider } from '@entities/bar-count/model/BarCountContext';
import { CountBarsAndBeatsProvider } from '@entities/count-bars-and-beats/model/CountBarsAndBeatsContext';
import { EffectsProvider } from '@entities/effects/model/EffectsContext';
import { ReverbBinder, CutFiltersBinder } from '@features/effects';
import { ToneMasterBridge } from '@features/playback/model/ToneMasterBridge';
import { ModeProvider } from '@entities/mode/model/ModeContext';
import { ChordPatternProvider } from '@entities/pattern/model/ChordPatternContext';
import { DrumPatternProvider } from '@entities/pattern/model/DrumPatternContext';
import { ScaleModeProvider } from '@entities/scale-mode/model/ScaleModeContext';
import { SegmentProvider } from '@entities/segment/model/SegmentContext';
import { TempoProvider } from '@entities/tempo/model/TempoContext';

import type { ReactNode } from 'react';

type Props = { children: ReactNode };

export const Providers = ({ children }: Props) => (
  <GlobalAudioProvider>
    {/* Tone のコンテキストを最優先でエンジンに統一 */}
    <ToneMasterBridge />
    <AnalysisModeProvider>
      <ModeProvider>
        <RecordingProvider>
          <TempoProvider>
            <RecordingUIProvider>
              <SegmentProvider>
                <BarCountProvider>
                  <ScaleModeProvider>
                    <CountBarsAndBeatsProvider>
                      <ChordPatternProvider>
                        <DrumPatternProvider>
                          <EffectsProvider>
                            <ReverbBinder />
                            <CutFiltersBinder />
                            {children}
                          </EffectsProvider>
                        </DrumPatternProvider>
                      </ChordPatternProvider>
                    </CountBarsAndBeatsProvider>
                  </ScaleModeProvider>
                </BarCountProvider>
              </SegmentProvider>
            </RecordingUIProvider>
          </TempoProvider>
        </RecordingProvider>
      </ModeProvider>
    </AnalysisModeProvider>
  </GlobalAudioProvider>
);
