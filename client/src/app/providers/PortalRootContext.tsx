import React, { createContext, useContext } from 'react';

const PortalRootContext = createContext<HTMLElement | null>(null);

export const PortalRootProvider = ({ root, children }: { root: HTMLElement | null; children: React.ReactNode }) => (
  <PortalRootContext.Provider value={root}>{children}</PortalRootContext.Provider>
);

export const usePortalRoot = () => useContext(PortalRootContext);

