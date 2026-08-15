import { useMemo, useState } from "react";
import type { Category, Resource } from "../types";
import { fmt, money } from "../lib/format";
import { AlertIcon, BoxesIcon, PlusIcon, TrashIcon } from "./icons";

export function Departments({
  categories,
  resources,
  onAdd,
  onDelete,
  onBrowse,
}: {
  categories: Category[];
  resources: Resource[];
  onAdd: () => void;
  onDelete: (cat: Category) => void;
  onBrowse: (categoryId: string) => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const map = new Map<string, { items: number; units: number; value: number; low: number }>();
    for (const c of categories) map.set(c.id, { items: 0, units: 0, value: 0, low: 0 });
    for (const r of resources) {
      const s = map.get(r.categoryId);
      if (!s) continue;
      s.items++;
      s.units += r.qty;
      s.value += r.qty * r.price;
      if (r.qty <= r.minQty) s.low++;
    }
    return map;
  }, [categories, resources]);

  const totalItems = resources.length;

  return (
    <div className="flex flex-col gap-5 animate-rise">
      <div className="panel relative overflow-hidden p-5">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 place-items-center rounded-xl bg-lilac/15 text-lilac ring-1 ring-lilac/30">
              <BoxesIcon className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-fog sm:text-2xl">
                المصالح والأقسام
                <span className="ms-2 rounded-full bg-lilac/15 px-2.5 py-0.5 text-[12px] font-bold tabular-nums text-lilac">
                  {fmt(categories.length)} قسم
                </span>
              </h2>
              <p className="mt-0.5 text-[12px] text-mist">
                هيكلة المستودع: {fmt(totalItems)} صنفًا موزّعًا على الأقسام — الأقسام الفارغة يمكن حذفها
              </p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-[13px] font-extrabold text-ink shadow-lg shadow-saffron/20 transition-all hover:-translate-y-0.5 hover:bg-[#f7b455] active:translate-y-0"
          >
            <PlusIcon className="size-4" strokeWidth={2.4} />
            إضافة قسم جديد
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((c, idx) => {
          const s = stats.get(c.id) ?? { items: 0, units: 0, value: 0, low: 0 };
          const share = totalItems ? (s.items / totalItems) * 100 : 0;
          const empty = s.items === 0;
          const confirming = confirmId === c.id;

          return (
            <article
              key={c.id}
              className={`panel group relative flex flex-col overflow-hidden p-4 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 animate-rise ${
                empty ? "border-dashed" : ""
              }`}
              style={{ animationDelay: `${Math.min(idx * 45, 400)}ms` }}
            >
              <span className="absolute inset-y-0 right-0 w-1" style={{ background: c.color }} />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className="grid size-9 place-items-center rounded-lg font-display text-[13px] font-extrabold"
                    style={{ color: c.color, background: `${c.color}16`, border: `1px solid ${c.color}40` }}
                  >
                    {c.skuPrefix}
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-extrabold leading-5 text-fog">{c.name}</h3>
                    <span className="text-[10.5px] font-semibold text-dim" dir="ltr">
                      {c.skuPrefix}-###
                    </span>
                  </div>
                </div>
                {s.low > 0 && !empty && (
                  <span className="flex items-center gap-1 rounded-full bg-saffron/12 px-2 py-0.5 text-[10.5px] font-bold text-saffron">
                    <AlertIcon className="size-3" />
                    {s.low} منخفض
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-end gap-5">
                <div>
                  <div
                    className="font-display text-3xl font-extrabold tabular-nums leading-none"
                    style={{ color: empty ? "#64806f" : c.color }}
                  >
                    {fmt(s.items)}
                  </div>
                  <div className="mt-1 text-[10.5px] font-bold text-dim">صنف</div>
                </div>
                {!empty && (
                  <>
                    <div>
                      <div className="font-display text-lg font-bold tabular-nums leading-none text-fog">
                        {fmt(s.units)}
                      </div>
                      <div className="mt-1 text-[10.5px] font-bold text-dim">وحدة</div>
                    </div>
                    <div>
                      <div className="font-display text-lg font-bold tabular-nums leading-none text-mint">
                        {money(s.value)}
                      </div>
                      <div className="mt-1 text-[10.5px] font-bold text-dim">قيمة المخزون</div>
                    </div>
                  </>
                )}
              </div>

              {/* حصة القسم من إجمالي الأصناف */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[10.5px] font-bold text-dim">
                  <span>الحصة من إجمالي الأصناف</span>
                  <span className="tabular-nums">{share.toFixed(1)}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink">
                  <div
                    className="h-full origin-right rounded-full animate-growbar"
                    style={{
                      width: `${Math.max(share, empty ? 0 : 1.2)}%`,
                      background: c.color,
                      animationDelay: `${idx * 60}ms`,
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-linesoft pt-3">
                {confirming ? (
                  <div className="flex w-full items-center justify-between gap-2 animate-fadein">
                    <span className="text-[11.5px] font-bold text-coral">حذف القسم نهائيًا؟</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          onDelete(c);
                          setConfirmId(null);
                        }}
                        className="rounded-lg bg-coral px-3 py-1.5 text-[11.5px] font-extrabold text-ink transition-transform hover:scale-105"
                      >
                        نعم، احذف
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-bold text-mist hover:text-fog"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onBrowse(c.id)}
                      className="flex-1 rounded-lg border border-line px-3 py-2 text-[12px] font-bold text-mist transition-colors hover:border-saffron/50 hover:text-saffron"
                    >
                      {empty ? "القسم فارغ" : "عرض الأصناف"}
                    </button>
                    {empty && (
                      <button
                        onClick={() => setConfirmId(c.id)}
                        className="grid size-9 place-items-center rounded-lg border border-line text-dim transition-colors hover:border-coral/60 hover:text-coral"
                        aria-label={`حذف ${c.name}`}
                      >
                        <TrashIcon className="size-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
