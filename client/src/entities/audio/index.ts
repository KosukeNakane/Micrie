// [Model] entities - index.ts
// 役割: ビジネスロジック/状態操作
export * from './model';

export { GlobalAudioProvider, useGlobalAudio } from './model/GlobalAudioContext';
export { RecordingProvider, useRecording } from './model/RecordingContext';
export { RecordingUIProvider, useRecordingUI } from './model/RecordingUIContext';
export { GlobalAudioEngine } from './lib/GlobalAudioEngine';
