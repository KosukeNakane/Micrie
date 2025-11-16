// [Types] entities/pattern - patternTypes.ts
// 役割: Pattern ドメインモデル共通型

// Segment の基本情報
export type Segment = {
	label: string;
	start: number;
	end: number;
	hz?: number;
	note?: string;
	confidence?: number;
	rms?: number;
	confidence_rms?: number;
};

////////////////////////////////////////////////////////////
// コードの構造
export type ChordQuality = 'maj' | 'min' | 'dim' | 'aug';
export type ChordTension = '' | 'maj7' | '7' | '6' | '9' | '11' | '13';

export interface Chord {
	rootIndex: number;
	quality: ChordQuality;
	tension: ChordTension;
}

export type PlayType = 'chord' | 'root' | 'rest';

// 1 スロット分
export interface ChordSlot {
	chord: Chord;
	plays: [PlayType, PlayType];
}
////////////////////////////////////////////////////////////

// Pattern — 音源データの唯一のドメインモデル
export interface Pattern {
	id: string;
	name: string;

	bars: number;
	chordsPerBar: number;

	chordSlots: ChordSlot[];

	melodySegments: Segment[];
	rhythmSegments: Segment[];
}
