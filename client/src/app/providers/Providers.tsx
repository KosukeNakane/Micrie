import type { ReactNode } from 'react';
import { GlobalAudioProvider } from '@entities/audio/model/GlobalAudioContext';
import { AnalysisModeProvider } from '@entities/analysis/model/AnalysisModeContext';
import { ModeProvider } from '@entities/mode/model/ModeContext';
import { RecordingProvider } from '@entities/audio/model/RecordingContext';
import { RecordingUIProvider } from '@entities/audio/model/RecordingUIContext';
import { SegmentProvider } from '@entities/segment/model/SegmentContext';
import { BarCountProvider } from '@entities/bar-count/model/BarCountContext';
import { ScaleModeProvider } from '@entities/scale-mode/model/ScaleModeContext';
import { CountBarsAndBeatsProvider } from '@entities/count-bars-and-beats/model/CountBarsAndBeatsContext';
import { ChordPatternProvider } from '@entities/pattern/model/ChordPatternContext';
import { DrumPatternProvider } from '@entities/pattern/model/DrumPatternContext';
import { EffectsProvider } from '@entities/effects/model/EffectsContext';
import { TempoProvider } from '@entities/tempo/model/TempoContext';

type Props = { children: ReactNode };

export const Providers = ({ children }: Props) => (
  <GlobalAudioProvider>
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

