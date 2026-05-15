"use client";

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DashboardListLayout = "cards" | "table";

export const DASHBOARD_LIST_LAYOUT_STORAGE_KEY = "unibac:dashboard-list-layout";

type DashboardListLayoutContextValue = {
  layout: DashboardListLayout;
  setLayout: Dispatch<SetStateAction<DashboardListLayout>>;
};

function readStoredLayout(): DashboardListLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DASHBOARD_LIST_LAYOUT_STORAGE_KEY);
    if (raw === "cards" || raw === "table") return raw;
  } catch {
    /* ignorar quota / modo privado */
  }
  return null;
}

const DashboardListLayoutContext =
  createContext<DashboardListLayoutContextValue | null>(null);

export function DashboardListLayoutProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [layout, setLayoutState] = useState<DashboardListLayout>("cards");

  useEffect(() => {
    const stored = readStoredLayout();
    if (stored != null) {
      setLayoutState(stored);
    }
  }, []);

  const setLayout = useCallback<Dispatch<SetStateAction<DashboardListLayout>>>(
    (next) => {
      setLayoutState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          window.localStorage.setItem(
            DASHBOARD_LIST_LAYOUT_STORAGE_KEY,
            resolved,
          );
        } catch {
          /* ignorar */
        }
        return resolved;
      });
    },
    [],
  );

  const value = useMemo(() => ({ layout, setLayout }), [layout, setLayout]);

  return (
    <DashboardListLayoutContext.Provider value={value}>
      {children}
    </DashboardListLayoutContext.Provider>
  );
}

export function useDashboardListLayout(): DashboardListLayoutContextValue {
  const ctx = useContext(DashboardListLayoutContext);
  if (ctx == null) {
    throw new Error(
      "useDashboardListLayout debe usarse dentro de DashboardListLayoutProvider.",
    );
  }
  return ctx;
}
