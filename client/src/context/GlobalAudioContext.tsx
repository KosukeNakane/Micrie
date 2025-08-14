// client/src/context/GlobalAudioContext.tsx
import React, { createContext, useContext, useMemo } from "react";
import { GlobalAudioEngine } from "../audio/GlobalAudioEngine";

type Value = { engine: GlobalAudioEngine };

const Ctx = createContext<Value | null>(null);

export const GlobalAudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const value = useMemo(() => ({ engine: GlobalAudioEngine.instance }), []);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useGlobalAudio = () => {
    const v = useContext(Ctx);
    if (!v) throw new Error("useGlobalAudio must be used within GlobalAudioProvider");
    return v.engine;
};