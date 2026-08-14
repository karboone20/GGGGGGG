import { useMemo, useState } from "react";
import type { MovementType, Resource, StockStatus } from "../types";
import { CATEGORIES, catById, stockStatus } from "../data";
import { fmt, money, relTime } from "../lib/format";
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

type SortKey = "name" | "qtyAsc" | "qtyDesc" | "valueDesc" | "recent";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "recent", label: "الأحدث تحديثًا" },
  { id: "name", label: "الاسم (أ - ي)" },
  { id: "qtyAsc", label: "الكمية: الأقل أولًا" },
  { id: "qtyDesc", label: "الكمية: الأكثر أولًا" },
  { id: "valueDesc", label: "القيمة: الأعلى أولًا" },
];

export function Inventory({
  resources,
  onMove,
  onEdit,
  onDelete,
  onAdd,
}: {
  resources: Resource[];
  onMove: (r: Resource, t: MovementType) => void;
  onEdit: (r: Resource) => void;
  onDelete: (r: Resource) => void;
  onAdd: () => void;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<"all" | StockStatus>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = resources.filter((r) => {
      if (q && ![r.name, r.sku, r.location].some((f) => f.toLowerCase().includes(q))) return false;
      if (cat !== "all" && r.categoryId !== cat) return false;
      if (status !== "all" && stockStatus(r) !== status) return false;
      return true;
    });
    list = [...list];
    switch (sort) {
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
        break;
      case "qtyAsc":
        list.sort((a, b) => a.qty - b.qty);
        break;
      case "qtyDesc":
        list.sort((a, b) => b.qty - a.qty);
        break;
      case "valueDesc":
        list.sort((a, b) => b.qty * b.price - a.qty * a.price);
        break;
      default:
        list.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return list;
  }, [resources, query, cat, status, sort]);

  const statusCount = (s: "all" | StockStatus) =>
    s === "all" ? resources.length : resources.filter((r) => stockStatus(r) === s).length;

  const statusTabs: { id: "all" | StockStatus; label: string; tint: string }[] = [
    { id: "all", label: "الكل", tint: "#9db6a9" },
    { id: "ok", label: "متوفر", tint: "#3fd68f" },
    { id: "low", label: "منخفض", tint: "#f0a63c" },
    { id: "out", label: "نفد", tint: "#f0684f" },
  ];

  const hasFilters = query !== "" || cat !== "all" || status !== "all";

  return (
    <div className="flex flex-col gap-4">
      {/* شريط الأدوات */}
      <div className="panel animate-rise p-4" style={{ animationDelay: "40ms" }}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <SearchIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-dim" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الرمز أو الموقع…"
                className="field !py-2.5 !pe-10"
              />
            </div>
            <div className="relative">
              <FilterIcon className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-dim" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="field !w-auto !py-2.5 !pe-10"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-sm font-extrabold text-ink shadow-lg shadow-saffron/20 transition-all hover:-translate-y-0.5 hover:bg-[#f7b455] active:translate-y-0"
            >
              <PlusIcon className="size-4" strokeWidth={2.4} />
              صنف جديد
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {statusTabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setStatus(t.id)}
                className={`rounded-full border px-3.5 py-1.5 text-[11.5px] font-bold transition-all ${
                  status === t.id ? "scale-105" : "opacity-75 hover:opacity-100"
                }`}
                style={{
                  color: t.tint,
                  borderColor: status === t.id ? `${t.tint}66` : "var(--color-line)",
                  background: status === t.id ? `${t.tint}16` : "transparent",
                }}
              >
                {t.label}
                <span className="ms-1.5 tabular-nums opacity-70">{statusCount(t.id)}</span>
              </button>
            ))}
            <span className="mx-1 hidden h-4 w-px bg-line sm:block" />
            <button
              onClick={() => setCat("all")}
              className={`rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
                cat === "all"
                  ? "border-fog/40 bg-fog/10 text-fog"
                  : "border-line text-dim hover:text-mist"
              }`}
            >
              كل الفئات
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(cat === c.id ? "all" : c.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-bold transition-all ${
                  cat === c.id ? "scale-105" : "opacity-75 hover:opacity-100"
                }`}
                style={{
                  color: c.color,
                  borderColor: cat === c.id ? `${c.color}66` : "var(--color-line)",
                  background: cat === c.id ? `${c.color}14` : "transparent",
                }}
              >
                <span className="size-2 rounded-full" style={{ background: c.color }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* الجدول */}
      <div className="panel animate-rise overflow-hidden" style={{ animationDelay: "120ms" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-start">
            <thead>
              <tr className="border-b border-line bg-raised/60 text-[11px] font-bold text-dim">
                <th className="px-5 py-3 text-start">الصنف</th>
                <th className="px-3 py-3 text-start">الفئة</th>
                <th className="px-3 py-3 text-start">الموقع</th>
                <th className="px-3 py-3 text-start">الكمية</th>
                <th className="px-3 py-3 text-start">سعر الوحدة</th>
                <th className="px-3 py-3 text-start">القيمة</th>
                <th className="px-3 py-3 text-start">الحالة</th>
                <th className="px-5 py-3 text-end">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const c = catById(r.categoryId);
                const st = stockStatus(r);
                const ratio = r.minQty > 0 ? Math.min(1, r.qty / (r.minQty * 3)) : 1;
                return (
                  <tr
                    key={`${r.id}-${r.updatedAt}`}
                    className="group animate-flash border-b border-linesoft transition-colors last:border-0 hover:bg-raised/50"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-[13.5px] font-bold text-fog transition-colors group-hover:text-saffron">
                        {r.name}
                      </p>
                      <p className="mt-0.5 text-[10.5px] tracking-wide text-dim" dir="ltr">
                        {r.sku} · حُدّث {relTime(r.updatedAt)}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                        style={{ color: c.color, borderColor: `${c.color}44`, background: `${c.color}10` }}
                      >
                        <span className="size-1.5 rounded-full" style={{ background: c.color }} />
                        {c.name}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="flex items-center gap-1.5 text-[12px] font-semibold text-mist">
                        <PinIcon className="size-3.5 text-dim" />
                        <span dir="ltr">{r.location}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-display text-lg font-extrabold tabular-nums text-fog">
                          {fmt(r.qty)}
                        </span>
                        <span className="text-[10.5px] text-dim">{r.unit}</span>
                        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-lift">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(4, ratio * 100)}%`,
                              background:
                                st === "out" ? "#f0684f" : st === "low" ? "#f0a63c" : "#3fd68f",
                            }}
                          />
                        </div>
                      </div>
                      <p className="mt-0.5 text-[10px] text-dim">الحد الأدنى {r.minQty}</p>
                    </td>
                    <td className="px-3 py-3.5 text-[12.5px] font-semibold tabular-nums text-mist">
                      {money(r.price)}
                    </td>
                    <td className="px-3 py-3.5 text-[12.5px] font-extrabold tabular-nums text-saffron">
                      {money(r.qty * r.price)}
                    </td>
                    <td className="px-3 py-3.5">
                      <StatusBadge status={st} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5 opacity-70 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onMove(r, "in")}
                          title="إيداع كمية"
                          className="grid size-8 place-items-center rounded-lg border border-mint/35 text-mint transition-all hover:scale-110 hover:bg-mint/15"
                        >
                          <ArrowInIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => onMove(r, "out")}
                          title="سحب كمية"
                          className="grid size-8 place-items-center rounded-lg border border-coral/35 text-coral transition-all hover:scale-110 hover:bg-coral/15"
                        >
                          <ArrowOutIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => onEdit(r)}
                          title="تعديل"
                          className="grid size-8 place-items-center rounded-lg border border-sky/35 text-sky transition-all hover:scale-110 hover:bg-sky/15"
                        >
                          <PencilIcon className="size-4" />
                        </button>
                        <button
                          onClick={() => onDelete(r)}
                          title="حذف"
                          className="grid size-8 place-items-center rounded-lg border border-line text-dim transition-all hover:scale-110 hover:border-coral/50 hover:text-coral"
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

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center animate-fadein">
            <span className="grid size-16 place-items-center rounded-2xl border border-dashed border-line text-dim">
              <EmptyIcon className="size-8" />
            </span>
            {resources.length === 0 ? (
              <>
                <p className="font-display text-lg font-bold text-fog">المستودع فارغ</p>
                <p className="max-w-xs text-[12.5px] text-mist">
                  ابدأ بإضافة أول صنف لتتبّع الكميات والقيم والحركات.
                </p>
                <button
                  onClick={onAdd}
                  className="mt-1 flex items-center gap-2 rounded-xl bg-saffron px-4 py-2 text-sm font-extrabold text-ink transition-transform hover:-translate-y-0.5"
                >
                  <PlusIcon className="size-4" strokeWidth={2.4} />
                  إضافة أول صنف
                </button>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-bold text-fog">لا توجد نتائج مطابقة</p>
                <p className="text-[12.5px] text-mist">جرّب تعديل البحث أو الفلاتر.</p>
                {hasFilters && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setCat("all");
                      setStatus("all");
                    }}
                    className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-bold text-mist transition-colors hover:border-saffron/40 hover:text-saffron"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-center text-[11px] text-dim animate-fadein" style={{ animationDelay: "200ms" }}>
        عرض <b className="text-mist tabular-nums">{filtered.length}</b> من{" "}
        <b className="text-mist tabular-nums">{resources.length}</b> صنف
      </p>
    </div>
  );
}
