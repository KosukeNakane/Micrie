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

export const toaster = createToaster({ placement: "top" });

export const ToasterHost = () => (
  <Toaster toaster={toaster}>
    {(toast) => (
      <ToastRoot>
        <ToastIndicator />
        <div>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && (
            <ToastDescription>{toast.description}</ToastDescription>
          )}
        </div>
        <ToastCloseTrigger />
      </ToastRoot>
    )}
  </Toaster>
);