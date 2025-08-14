import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";

/* ========= Types（このファイルに内包） ========= */
export type EffectKey = "CRUSH" | "COMB" | "FILTER" | "REVERB" | "DIRTY" | "CUTTER";
/** 0..1 の正規化値。必要になったら enabled などプロパティを追加すればOK */
export type EffectState = Record<EffectKey, number>;

/* ========= Initial State ========= */
const INITIAL_STATE: EffectState = {
    CRUSH: 0,
    COMB: 0,
    FILTER: 0,
    REVERB: 0,
    DIRTY: 0,
    CUTTER: 0,
};

/* ========= Reducer ========= */
type Action =
    | { type: "SET_VALUE"; key: EffectKey; value: number }
    | { type: "SET_MANY"; payload: Partial<EffectState> }
    | { type: "RESET"; payload?: Partial<EffectState> };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function reducer(state: EffectState, action: Action): EffectState {
    switch (action.type) {
        case "SET_VALUE":
            return { ...state, [action.key]: clamp01(action.value) };
        case "SET_MANY":
            return {
                ...state,
                ...Object.fromEntries(
                    Object.entries(action.payload).map(([k, v]) => [k, clamp01(v as number)])
                ),
            };
        case "RESET":
            return { ...state, ...(action.payload ?? INITIAL_STATE) };
        default:
            return state;
    }
}

/* ========= Context ========= */
type EffectsContextValue = {
    /** 内部状態（そのまま使ってOK） */
    state: EffectState;
    /** 名前が直感的なエイリアス（UI側で読みやすくするために同じ参照を提供） */
    effects: EffectState;

    /** 1件更新 */
    setValue: (key: EffectKey, value: number) => void;
    /** 直感名エイリアス */
    setEffect: (key: EffectKey, value: number) => void;

    /** 複数まとめて更新 */
    setMany: (patch: Partial<EffectState>) => void;

    /** 全体または一部リセット */
    reset: (patch?: Partial<EffectState>) => void;
};

const EffectsContext = createContext<EffectsContextValue | null>(null);

/* ========= Provider ========= */
export const EffectsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

    const setValue = useCallback((key: EffectKey, value: number) => {
        dispatch({ type: "SET_VALUE", key, value });
    }, []);

    const setMany = useCallback((patch: Partial<EffectState>) => {
        dispatch({ type: "SET_MANY", payload: patch });
    }, []);

    const reset = useCallback((patch?: Partial<EffectState>) => {
        dispatch({ type: "RESET", payload: patch });
    }, []);

    const value = useMemo<EffectsContextValue>(
        () => ({
            state,
            effects: state,      // 同じ参照を渡す：用途に合わせて好きな名前で読める
            setValue,
            setEffect: setValue, // エイリアス
            setMany,
            reset,
        }),
        [state, setValue, setMany, reset]
    );

    return <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>;
};

/* ========= Hook ========= */
export function useEffects() {
    const ctx = useContext(EffectsContext);
    if (!ctx) throw new Error("useEffects must be used inside <EffectsProvider/>");
    return ctx;
}