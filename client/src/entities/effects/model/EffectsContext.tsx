import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";

export type EffectKey = "CRUSH" | "COMB" | "FILTER" | "REVERB" | "DIRTY" | "CUTTER";
export type EffectState = Record<EffectKey, number>;

const INITIAL_STATE: EffectState = { CRUSH: 0, COMB: 0, FILTER: 0, REVERB: 0, DIRTY: 0, CUTTER: 0 };

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
      return { ...state, ...Object.fromEntries(Object.entries(action.payload).map(([k, v]) => [k, clamp01(v as number)])) };
    case "RESET":
      return { ...state, ...(action.payload ?? INITIAL_STATE) };
    default:
      return state;
  }
}

type EffectsContextValue = {
  state: EffectState;
  effects: EffectState;
  setValue: (key: EffectKey, value: number) => void;
  setEffect: (key: EffectKey, value: number) => void;
  setMany: (patch: Partial<EffectState>) => void;
  reset: (patch?: Partial<EffectState>) => void;
};

const EffectsContext = createContext<EffectsContextValue | null>(null);

export const EffectsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const setValue = useCallback((key: EffectKey, value: number) => { dispatch({ type: "SET_VALUE", key, value }); }, []);
  const setMany = useCallback((patch: Partial<EffectState>) => { dispatch({ type: "SET_MANY", payload: patch }); }, []);
  const reset = useCallback((patch?: Partial<EffectState>) => { dispatch({ type: "RESET", payload: patch }); }, []);
  const value = useMemo<EffectsContextValue>(() => ({ state, effects: state, setValue, setEffect: setValue, setMany, reset }), [state, setValue, setMany, reset]);
  return <EffectsContext.Provider value={value}>{children}</EffectsContext.Provider>;
};

export function useEffects() {
  const ctx = useContext(EffectsContext);
  if (!ctx) throw new Error("useEffects must be used inside <EffectsProvider/>");
  return ctx;
}
