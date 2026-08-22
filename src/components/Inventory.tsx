import { useEffect, useMemo, useRef, useState } from "react";
import type { Category, MovementType, Resource, StockStatus } from "../types";
import { statusOf, STATUS_META } from "../data";
import { fmt, money } from "../lib/format";
import { StatusBadge } from "./ui";
import {
  ArrowInIcon,
  ArrowOutIcon,
  EmptyIcon,
  FilterIcon,
  PencilIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "./icons";

type SortKey = "name" | "qty" | "value" | "updated";

export function Inventory({
  resources,
  categories,
  initialDept,
  onMove,
  onEdit,
  onDelete,
  onAdd,
}: {
  resources: Resource[];
  categories: Category[];
  initialDept?: string;
  onMove: (r: Resource, t: MovementType) => void;
  onEdit: (r: Resource) => void;
  onDelete: (r: Resource) => void;
  onAdd: () => void;
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(initialDept ?? "all");
  const [status, setStatus] = useState<"all" | StockStatus>("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [flashId, setFlashId] = useState<string | null>(null);
  const prevRef = useRef<Map<string, number>>(new Map(resources.map((r) => [r.id, r.updatedAt])));

  useEffect(() => {
    for (const r of resources) {
      const prev = prevRef.current.get(r.id);
      if (prev !== undefined && prev !== r.updatedAt) {
        setFlashId(r.id);
        const t = window.setTimeout(() => setFlashId(null), 1700);
        prevRef.current = new Map(resources.map((x) => [x.id, x.updatedAt]));
        return () => window.clearTimeout(t);
      }
    }
    prevRef.current = new Map(resources.map((x) => [x.id, x.updatedAt]));
  }, [resources]);

  useEffect(() => {
    if (initialDept) setCat(initialDept);
  }, [initialDept]);

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = resources.filter((r) => {
      if (cat !== "all" && r.categoryId !== cat) return false;
      if (status !== "all" && statusOf(r) !== status) return false;
      if (
        term &&
        !r.name.toLowerCase().includes(term) &&
        !r.sku.toLowerCase().includes(term) &&
        !r.location.toLowerCase().includes(term)
      )
        return false;
      return true;
    });
    switch (sort) {
      case "name":
        return list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
      case "qty":
        return list.sort((a, b) => a.qty - b.qty);
      case "value":
        return list.sort((a, b) => b.qty * b.price - a.qty * a.price);
      default:
        return list.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  }, [resources, q, cat, status, sort]);

  const totalValue = filtered.reduce((a, r) => a + r.qty * r.price, 0);
  const catColor = cat !== "all" ? catById.get(cat)?.color : undefined;

  return (
    <div className="flex flex-col gap-4 animate-rise">
      {/* شريط الأدوات */}
      <div className="panel flex flex-wrap items-center gap-2.5 p-3.5">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-dim" />
          <input
            className="field pr-10"
            placeholder="ابحث بالاسم أو الرمز أو الموقع…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select className="field w-auto min-w-[170px]" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">كل الأقسام ({categories.length})</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="field w-auto min-w-[130px]"
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | StockStatus)}
        >
          <option value="all">كل الحالات</option>
          <option value="ok">متوفر</option>
          <option value="low">منخفض</option>
          <option value="out">نفد</option>
        </select>
        <select className="field w-auto min-w-[150px]" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="updated">الأحدث تحديثًا</option>
          <option value="name">الاسم (أ-ي)</option>
          <option value="qty">الأقل كمية</option>
          <option value="value">الأعلى قيمة</option>
        </select>
      </div>

      {/* ملخص */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-[12px] font-semibold text-dim">
        <span className="flex items-center gap-2">
          <FilterIcon className="size-3.5" />
          <b className="tabular-nums text-mist">{fmt(filtered.length)}</b> صنف معروض من{" "}
          <b className="tabular-nums text-mist">{fmt(resources.length)}</b>
          {cat !== "all" && (
            <span
              className="rounded-full px-2 py-0.5 text-[10.5px] font-bold"
              style={{ color: catColor, background: `${catColor}18` }}
            >
              {catById.get(cat)?.name}
            </span>
          )}
        </span>
        <span>
          القيمة الإجمالية: <b className="tabular-nums text-mint">{money(totalValue)}</b>
        </span>
      </div>

      {/* الجدول */}
      {filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl border border-dashed border-line text-dim">
            <EmptyIcon className="size-8" />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-fog">لا أصناف مطابقة</h3>
          <p className="mt-1 text-[13px] text-mist">جرّب تعديل البحث أو الفلاتر، أو أضف صنفًا جديدًا.</p>
          <button
            onClick={onAdd}
            className="mt-5 flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-[13px] font-extrabold text-ink transition-transform hover:-translate-y-0.5"
          >
            <PlusIcon className="size-4" strokeWidth={2.4} />
            إضافة مورد
          </button>
        </div>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[960px] text-start">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold text-dim">
                <th className="px-4 py-3 text-start font-bold">الصنف</th>
                <th className="px-3 py-3 text-start font-bold">القسم</th>
                <th className="px-3 py-3 text-start font-bold">الكمية</th>
                <th className="px-3 py-3 text-start font-bold">سعر الوحدة</th>
                <th className="px-3 py-3 text-start font-bold">القيمة</th>
                <th className="px-3 py-3 text-start font-bold">الحالة</th>
                <th className="px-3 py-3 text-start font-bold">الموقع</th>
                <th className="px-4 py-3 text-end font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const c = catById.get(r.categoryId);
                const st = statusOf(r);
                const meta = STATUS_META[st];
                const ratio = r.minQty > 0 ? Math.min(1, r.qty / (r.minQty * 4)) : 1;
                return (
                  <tr
                    key={r.id}
                    className={`group border-b border-linesoft transition-colors last:border-0 hover:bg-raised/70 ${
                      flashId === r.id ? "animate-flash" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-lg font-display text-[11px] font-extrabold"
                          style={{
                            color: c?.color ?? "#9db6a9",
                            background: `${c?.color ?? "#9db6a9"}14`,
                          }}
                        >
                          {c?.skuPrefix ?? "؟"}
                        </span>
                        <div>
                          <div className="text-[13.5px] font-bold leading-5 text-fog">{r.name}</div>
                          <div className="text-[10.5px] font-semibold tabular-nums text-dim" dir="ltr">
                            {r.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold"
                        style={{ color: c?.color ?? "#9db6a9", background: `${c?.color ?? "#9db6a9"}14` }}
                      >
                        {c?.name ?? "بدون قسم"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-display text-[15px] font-extrabold tabular-nums text-fog">
                        {fmt(r.qty)}
                        <span className="ms-1 text-[10px] font-bold text-dim">{r.unit}</span>
                      </div>
                      <div className="mt-1.5 h-1 w-24 overflow-hidden rounded-full bg-ink">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(ratio * 100, 2)}%`, background: meta.color }}
                        />
                      </div>
                      <div className="mt-1 text-[9.5px] font-semibold text-dim">الحد الأدنى: {fmt(r.minQty)}</div>
                    </td>
                    <td className="px-3 py-3 text-[12.5px] font-semibold tabular-nums text-mist">{money(r.price)}</td>
                    <td className="px-3 py-3 text-[13px] font-bold tabular-nums text-mint">{money(r.qty * r.price)}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={st} />
                    </td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 text-[11.5px] font-semibold text-mist">
                        <PinIcon className="size-3.5 text-dim" />
                        {r.location}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 opacity-70 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onMove(r, "in")}
                          title="إيداع وارد"
                          className="grid size-8 place-items-center rounded-lg border border-line text-mint transition-all hover:-translate-y-0.5 hover:border-mint/60 hover:bg-mint/10"
                        >
                          <ArrowInIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => onMove(r, "out")}
                          disabled={r.qty === 0}
                          title={r.qty === 0 ? "المخزون نافد" : "صرف صادر"}
                          className="grid size-8 place-items-center rounded-lg border border-line text-coral transition-all hover:-translate-y-0.5 hover:border-coral/60 hover:bg-coral/10 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0"
                        >
                          <ArrowOutIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => onEdit(r)}
                          title="تعديل"
                          className="grid size-8 place-items-center rounded-lg border border-line text-mist transition-all hover:-translate-y-0.5 hover:border-saffron/60 hover:text-saffron"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          title="حذف"
                          className="grid size-8 place-items-center rounded-lg border border-line text-mist transition-all hover:-translate-y-0.5 hover:border-coral/60 hover:text-coral"
                        >
                          <TrashIcon className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
