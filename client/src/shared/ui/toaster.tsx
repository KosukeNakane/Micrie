// [UI] shared/ui - toaster.tsx
// 役割: 表示・入力のUIコンポーネント
// toaster.tsx
import {
  Toaster,
  createToaster,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastIndicator,
  ToastCloseTrigger,
} from "@chakra-ui/react";

import { StyledArea } from "./StyledArea";

const textColorByType: Record<string, string> = {
  success: "#38A169",
  error: "#E53E3E",
  warning: "#D69E2E",
  info: "#3182CE",
  loading: "#4A5568",
  default: "rgba(5, 4, 69, 0.8)",
};

const resolveTextColor = (type?: string) =>
  textColorByType[type ?? ""] ?? textColorByType.default;

export const toaster = createToaster({ placement: "top-end", gap: 12, max: 3, overlap: false });

// Chakra/Ark toast storeはmax超過時にキューに積むため、最新トーストを即時表示するよう最古のものを先に消す
const ensureCapacityForNextToast = () => {
  const maxVisible = toaster.attrs.max;
  const visibleToasts = toaster.getVisibleToasts();
  if (visibleToasts.length < maxVisible) return;
  const oldest = visibleToasts[visibleToasts.length - 1];
  if (oldest?.id) {
    toaster.remove(oldest.id);
  }
};

const wrapWithCapacity = <T extends (...args: any[]) => unknown>(fn: T): T => {
  return ((...args: Parameters<T>) => {
    ensureCapacityForNextToast();
    return fn(...args);
  }) as T;
};

const baseCreate = toaster.create.bind(toaster);
const baseSuccess = toaster.success.bind(toaster);
const baseError = toaster.error.bind(toaster);
const baseWarning = toaster.warning.bind(toaster);
const baseInfo = toaster.info.bind(toaster);
const baseLoading = toaster.loading.bind(toaster);
const basePromise = toaster.promise.bind(toaster);

toaster.create = wrapWithCapacity(baseCreate);
toaster.success = wrapWithCapacity(baseSuccess);
toaster.error = wrapWithCapacity(baseError);
toaster.warning = wrapWithCapacity(baseWarning);
toaster.info = wrapWithCapacity(baseInfo);
toaster.loading = wrapWithCapacity(baseLoading);
toaster.promise = wrapWithCapacity(basePromise);

export const ToasterHost = () => (
  <Toaster toaster={toaster}>
    {(toast) => {
      const color = resolveTextColor(toast.type);

      return (
        <ToastRoot
          style={{
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            gap: 0,
            color: "inherit",
            width: "auto",
            alignSelf: "flex-end",
          }}
        >
          <StyledArea
            style={{
              margin: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 12,
              color,
              maxWidth: "80vw",
              flexWrap: "nowrap",
            }}
          >
            <ToastIndicator
              style={{
                color,
                width: 16,
                height: 16,
                minWidth: 16,
                minHeight: 16,
              }}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minWidth: 0,
              }}
            >
              {toast.title && (
                <ToastTitle
                  style={{
                    color,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.3,
                  }}
                >
                  {toast.title}
                </ToastTitle>
              )}
              {toast.description && (
                <ToastDescription
                  style={{
                    color,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.3,
                  }}
                >
                  {toast.description}
                </ToastDescription>
              )}
            </div>
            <ToastCloseTrigger
              style={{
                color,
                position: "static",
                padding: 0,
                marginLeft: 8,
              }}
            />
          </StyledArea>
        </ToastRoot>
      );
    }}
  </Toaster>
);
