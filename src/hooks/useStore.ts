import { useEffect, useMemo, useState } from "react";
import type { Category, ImportRow, Movement, MovementType, Resource } from "../types";
import { DEPARTMENTS, SEED_MOVEMENTS, SEED_RESOURCES } from "../data";
import { uid } from "../lib/format";

const KEY = "mustawdaa-store-v2";

interface StoreShape {
  resources: Resource[];
  movements: Movement[];
  categories: Category[];
}

function load(): StoreShape {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreShape;
      if (
        Array.isArray(parsed.resources) &&
        Array.isArray(parsed.movements) &&
        Array.isArray(parsed.categories) &&
        parsed.categories.length > 0
      ) {
        return parsed;
      }
    }
  } catch {
    /* fall back to seed */
  }
  return {
    resources: SEED_RESOURCES,
    movements: SEED_MOVEMENTS,
    categories: DEPARTMENTS,
  };
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

      move(
        resource: Resource,
        type: MovementType,
        qty: number,
        note?: string,
        beneficiary?: string
      ): boolean {
        if (qty <= 0) return false;
        if (type === "out" && qty > resource.qty) return false;
        setState((s) => {
          const maxSeq = s.movements.reduce((mx, m) => Math.max(mx, m.receiptSeq ?? 0), 0);
          const mv: Movement = {
            id: uid(),
            resourceId: resource.id,
            name: resource.name,
            type,
            qty,
            note: note?.trim() || undefined,
            beneficiary: type === "out" ? beneficiary?.trim() || undefined : undefined,
            receiptSeq: type === "out" ? maxSeq + 1 : undefined,
            at: Date.now(),
          };
          return {
            ...s,
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
          };
        });
        return true;
      },

      addCategory(name: string, color: string): Category {
        const cat: Category = {
          id: uid(),
          name: name.trim(),
          color,
          skuPrefix: `D${(state.categories.length + 1).toString().padStart(2, "0")}`,
        };
        setState((s) => ({ ...s, categories: [...s.categories, cat] }));
        return cat;
      },

      removeCategory(id: string) {
        setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }));
      },

      importResources(rows: ImportRow[], categoryId: string): number {
        const cat = state.categories.find((c) => c.id === categoryId);
        if (!cat || rows.length === 0) return 0;
        const existing = state.resources.filter((r) => r.categoryId === categoryId).length;
        const now = Date.now();
        const news: Resource[] = rows.map((row, i) => ({
          id: uid(),
          name: row.name,
          sku: `${cat.skuPrefix}-${String(existing + i + 1).padStart(3, "0")}`,
          categoryId,
          qty: row.qty,
          minQty: Math.max(3, Math.round(row.qty * 0.15)),
          unit: row.unit,
          price: row.price,
          location: "منطقة الوارد · رف 1",
          createdAt: now,
          updatedAt: now,
        }));
        setState((s) => ({ ...s, resources: [...news, ...s.resources] }));
        return news.length;
      },

      resetAll() {
        setState({
          resources: SEED_RESOURCES,
          movements: SEED_MOVEMENTS,
          categories: DEPARTMENTS,
        });
      },
    }),
    [state.categories, state.resources]
  );

  return { ...state, ...actions };
}

export type Store = ReturnType<typeof useStore>;
