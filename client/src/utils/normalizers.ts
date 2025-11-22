// [Utils] shared - normalizers.ts
// 役割: レガシー値を安全に正規化するユーティリティ
import type { Chord, PlayType } from '@/types/pattern';

const CHORD_QUALITIES: Chord['quality'][] = ['maj', 'min', 'dim', 'aug'];
const CHORD_TENSIONS: Chord['tension'][] = ['', 'maj7', '7', '6', '9', '11', '13'];
const DEFAULT_CHORD: Chord = { rootIndex: 0, quality: 'maj', tension: '' };
const DEFAULT_SLOT_PLAYS: [PlayType, PlayType] = ['chord', 'rest'];

export const normalizeRootIndex = (value: unknown): number => {
	if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_CHORD.rootIndex;
	const normalized = Math.round(value) % 12;
	return normalized < 0 ? normalized + 12 : normalized;
};

export const normalizeQuality = (value: unknown): Chord['quality'] =>
	CHORD_QUALITIES.includes(value as Chord['quality']) ? (value as Chord['quality']) : DEFAULT_CHORD.quality;

export const normalizeTension = (value: unknown): Chord['tension'] =>
	CHORD_TENSIONS.includes(value as Chord['tension']) ? (value as Chord['tension']) : DEFAULT_CHORD.tension;

export const normalizePlayType = (value: unknown, index: 0 | 1): PlayType => {
	if (value === 'root' || value === 'rest' || value === 'chord') return value;
	return DEFAULT_SLOT_PLAYS[index];
};
