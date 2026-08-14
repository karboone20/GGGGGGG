import { useEffect, useMemo, useState } from "react";
import type { Movement, MovementType, Resource } from "../types";
import { SEED_MOVEMENTS, SEED_RESOURCES } from "../data";
import { uid } from "../lib/format";

const KEY = "mustawdaa-store-v1";

interface StoreShape {
  resources: Resource[];
  movements: Movement[];
}

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreShape;
      if (Array.isArray(parsed.resources) && Array.isArray(parsed.movements)) {
        return parsed;
      }
    }
  } catch {
    /* fall back to seed */
  }
  return { resources: SEED_RESOURCES, movements: SEED_MOVEMENTS };
}

export function storageKB(): number {
  try {
    const raw = localStorage.getItem(KEY) ?? "";
    return Math.max(1, Math.round((new Blob([raw]).size / 1024) * 10) / 10);
  } catch {
    return 0;
  }
}

export function useStore() {
  const [state, setState] = useState<StoreShape>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state]);

  const actions = useMemo(
    () => ({
      addResource(data: Omit<Resource, "id" | "createdAt" | "updatedAt">): Resource {
        const res: Resource = { ...data, id: uid(), createdAt: Date.now(), updatedAt: Date.now() };
        setState((s) => ({ ...s, resources: [res, ...s.resources] }));
        return res;
      },

      updateResource(id: string, patch: Partial<Omit<Resource, "id" | "createdAt">>) {
        setState((s) => ({
          ...s,
          resources: s.resources.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
          ),
        }));
      },

      removeResource(id: string) {
        setState((s) => ({ ...s, resources: s.resources.filter((r) => r.id !== id) }));
      },

      move(resource: Resource, type: MovementType, qty: number, note?: string): boolean {
        if (qty <= 0) return false;
        if (type === "out" && qty > resource.qty) return false;
        const mv: Movement = {
          id: uid(),
          resourceId: resource.id,
          name: resource.name,
          type,
          qty,
          note: note?.trim() || undefined,
          at: Date.now(),
        };
        setState((s) => ({
          movements: [mv, ...s.movements],
          resources: s.resources.map((r) =>
            r.id === resource.id
              ? {
                  ...r,
                  qty: type === "in" ? r.qty + qty : Math.max(0, r.qty - qty),
                  updatedAt: Date.now(),
                }
              : r
          ),
        }));
        return true;
      },

      resetAll() {
        setState({ resources: SEED_RESOURCES, movements: SEED_MOVEMENTS });
      },
    }),
    []
  );

  return { ...state, ...actions };
}

export type Store = ReturnType<typeof useStore>;
