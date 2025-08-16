import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, chakra } from "@chakra-ui/react";

type Props = {
    value: number;
    onChange: (v: number) => void;
    onChangeEnd?: (v: number) => void;
    step?: number;
    fineMultiplier?: number;
    coarseMultiplier?: number;
    label?: string;
    fillColor?: string;
    trackColor?: string;
    textColor?: string;
    doubleClickResetsTo?: number;
    width?: number;
    height?: number;
    rounded?: number;
    disabled?: boolean;
};

export const VerticalFader: React.FC<Props> = ({
    value,
    onChange,
    onChangeEnd,
    step = 0.02,
    fineMultiplier = 0.2,
    coarseMultiplier = 5,
    label,
    fillColor = "linear-gradient(135deg, rgba(1, 203, 229, 0.45), rgba(45, 211, 208, 0.74))",
    trackColor = "rgba(0, 0, 0, 0.07)",
    textColor = "#fff",
    doubleClickResetsTo,
    width = 60,
    height = 180,
    rounded = 14,
    disabled = false,
}) => {
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const trackRef = useRef<HTMLDivElement | null>(null);
    const draggingRef = useRef(false);
    const lastValueRef = useRef(value);
    const [focused, setFocused] = useState(false);

    const setFromPointer = useCallback((clientY: number) => {
        const el = trackRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const y = clientY - rect.top;
        const ratio = 1 - y / rect.height;
        onChange(clamp(ratio));
    }, [onChange]);

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (disabled) return;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        draggingRef.current = true;
        setFromPointer(e.clientY);
    }, [disabled, setFromPointer]);

    const onPointerMove = useCallback((e: React.PointerEvent) => {
        if (!draggingRef.current || disabled) return;
        setFromPointer(e.clientY);
    }, [disabled, setFromPointer]);

    const endDrag = useCallback(() => {
        if (!draggingRef.current) return;
        draggingRef.current = false;
        onChangeEnd?.(lastValueRef.current);
    }, [onChangeEnd]);

    useEffect(() => {
        const up = () => endDrag();
        window.addEventListener("pointerup", up);
        return () => window.removeEventListener("pointerup", up);
    }, [endDrag]);

    useEffect(() => { lastValueRef.current = value; }, [value]);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;
        const handler = (e: WheelEvent) => {
            if (disabled) return;
            e.preventDefault();
            const mul = (e.shiftKey ? fineMultiplier : (e.altKey ? coarseMultiplier : 1));
            const delta = -Math.sign(e.deltaY) * step * mul;
            const next = clamp(value + delta);
            onChange(next);
            onChangeEnd?.(next);
        };
        el.addEventListener("wheel", handler, { passive: false });
        return () => el.removeEventListener("wheel", handler);
    }, [disabled, fineMultiplier, coarseMultiplier, step, value, onChange, onChangeEnd]);

    const onKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (disabled) return;
        let delta = 0;
        const mul = e.shiftKey ? fineMultiplier : (e.altKey ? coarseMultiplier : 1);
        switch (e.key) {
            case "ArrowUp": delta = step * mul; break;
            case "ArrowDown": delta = -step * mul; break;
            case "PageUp": delta = step * mul * 5; break;
            case "PageDown": delta = -step * mul * 5; break;
            case "Home": onChange(1); onChangeEnd?.(1); return;
            case "End": onChange(0); onChangeEnd?.(0); return;
            default: return;
        }
        e.preventDefault();
        const next = clamp(value + delta);
        onChange(next);
        onChangeEnd?.(next);
    }, [disabled, fineMultiplier, coarseMultiplier, step, value, onChange, onChangeEnd]);

    const onDoubleClick = useCallback(() => {
        if (disabled || doubleClickResetsTo == null) return;
        const v = clamp(doubleClickResetsTo);
        onChange(v);
        onChangeEnd?.(v);
    }, [disabled, doubleClickResetsTo, onChange, onChangeEnd]);

    const fillStyle = useMemo(() => ({
        height: `${value * 100}%`,
        background: fillColor,
        borderBottomLeftRadius: rounded,
        borderBottomRightRadius: rounded,
    }), [value, fillColor, rounded]);

    return (
        <Box display="inline-flex" alignItems="flex-end" justifyContent="center" px="4px" userSelect="none" w={`${width}px`}>
            <Box
                ref={trackRef}
                role="slider"
                aria-label={label ?? "fader"}
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={Number(value.toFixed(3))}
                tabIndex={disabled ? -1 : 0}
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); onChangeEnd?.(value); }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onKeyDown={onKeyDown}
                onDoubleClick={onDoubleClick}
                position="relative"
                h={`${height}px`}
                w="100%"
                bg={trackColor}
                borderRadius={`${rounded}px`}
                cursor="ns-resize"
                outline="none"
                overflow="hidden"
                css={{ touchAction: "none" }}
            >
                <Box position="absolute" left={0} right={0} bottom={0} style={fillStyle} />
                {label && (
                    <Box position="absolute" inset="6px" display="flex" alignItems="center" justifyContent="center" pointerEvents="none" textTransform="uppercase" fontWeight={800} letterSpacing="1px" color={textColor}>
                        <chakra.span css={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)", fontFamily: "Brandon Grotesque, sans-serif", fontSize: 14, lineHeight: 1 }}>
                            {label}
                        </chakra.span>
                    </Box>
                )}
                {focused && (
                    <Box position="absolute" inset="-3px" border="2px solid #fff" boxShadow="0 0 0 3px rgba(84,120,255,0.8)" borderRadius={`${rounded}px`} pointerEvents="none" />
                )}
            </Box>
        </Box>
    );
};
