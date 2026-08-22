import { useMemo, useState } from "react";
import type { Category, Movement, Resource } from "../types";
import { clockTime, dayLabel, fmt, receiptNo, relTime } from "../lib/format";
import { ArrowInIcon, ArrowOutIcon, EmptyIcon, ReceiptIcon, UsersIcon } from "./icons";

type Filter = "all" | "in" | "out";

export function Movements({
  movements,
  resources,
  categories,
}: {
  movements: Movement[];
  resources: Resource[];
  categories: Category[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const resById = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(
    () => movements.filter((m) => filter === "all" || m.type === filter),
    [movements, filter]
  );

  const groups = useMemo(() => {
    const map = new Map<string, Movement[]>();
    for (const m of filtered) {
      const key = new Date(m.at).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return [...map.entries()];
  }, [filtered]);

  const totals = useMemo(() => {
    const t = { inQty: 0, outQty: 0 };
    for (const m of movements) {
      if (m.type === "in") t.inQty += m.qty;
      else t.outQty += m.qty;
    }
    return t;
  }, [movements]);

  const FILTERS: Array<{ v: Filter; label: string; count: number }> = [
    { v: "all", label: "الكل", count: movements.length },
    { v: "in", label: "وارد", count: movements.filter((m) => m.type === "in").length },
    { v: "out", label: "صادر", count: movements.filter((m) => m.type === "out").length },
  ];

  return (
    <div className="flex flex-col gap-4 animate-rise">
      <div className="panel flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex items-center gap-1.5 rounded-xl border border-line bg-raised p-1">
          {FILTERS.map((f) => (
            <button
              key={f.v}
              onClick={() => setFilter(f.v)}
              className={`rounded-lg px-4 py-1.5 text-[12.5px] font-bold transition-all ${
                filter === f.v ? "bg-lift text-fog shadow" : "text-mist hover:text-fog"
              }`}
            >
              {f.label}
              <span className="ms-1.5 tabular-nums text-dim">{fmt(f.count)}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-[12px] font-bold">
          <span className="flex items-center gap-1.5 text-mint">
            <ArrowInIcon className="size-4" />
            وارد: <b className="tabular-nums">{fmt(totals.inQty)}</b> وحدة
          </span>
          <span className="flex items-center gap-1.5 text-coral">
            <ArrowOutIcon className="size-4" />
            صادر: <b className="tabular-nums">{fmt(totals.outQty)}</b> وحدة
          </span>
          <span className="hidden text-dim sm:block">
            الصافي: <b className={`tabular-nums ${totals.inQty - totals.outQty >= 0 ? "text-mint" : "text-coral"}`}>
              {totals.inQty - totals.outQty >= 0 ? "+" : ""}
              {fmt(totals.inQty - totals.outQty)}
            </b>
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl border border-dashed border-line text-dim">
            <EmptyIcon className="size-8" />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-fog">لا حركات مسجّلة</h3>
          <p className="mt-1 text-[13px] text-mist">نفّذ إيداعًا أو صرفًا من شاشة المخزون لتظهر الحركة هنا.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map(([day, list]) => (
            <section key={day}>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-display text-[13px] font-bold text-saffron">{dayLabel(list[0].at)}</span>
                <span className="h-px flex-1 bg-linesoft" />
              </div>
              <div className="panel divide-y divide-linesoft">
                {list.map((m) => {
                  const isIn = m.type === "in";
                  const res = resById.get(m.resourceId);
                  const cat = res ? catById.get(res.categoryId) : undefined;
                  return (
                    <div key={m.id} className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-raised/70">
                      <span
                        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
                          isIn ? "bg-mint/12 text-mint" : "bg-coral/12 text-coral"
                        }`}
                      >
                        {isIn ? <ArrowInIcon className="size-5" /> : <ArrowOutIcon className="size-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-[13.5px] font-bold text-fog">{m.name}</span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                            style={{
                              color: cat?.color ?? "#64806f",
                              background: `${cat?.color ?? "#64806f"}16`,
                            }}
                          >
                            {cat?.name ?? "قسم محذوف"}
                          </span>
                          {m.receiptSeq !== undefined && (
                            <span className="flex items-center gap-1 rounded-md border border-saffron/30 bg-saffron/8 px-1.5 py-0.5 text-[9.5px] font-extrabold tabular-nums text-saffron">
                              <ReceiptIcon className="size-3" />
                              {receiptNo(m.receiptSeq)}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-semibold text-dim">
                          {m.beneficiary && (
                            <span className="flex items-center gap-1 text-sky/90">
                              <UsersIcon className="size-3" />
                              {m.beneficiary}
                            </span>
                          )}
                          {m.note && <span className="italic">«{m.note}»</span>}
                          <span dir="ltr" className="tabular-nums">
                            {clockTime(m.at)}
                          </span>
                        </div>
                      </div>
                      <div className="text-end">
                        <div
                          className={`font-display text-[15px] font-extrabold tabular-nums ${
                            isIn ? "text-mint" : "text-coral"
                          }`}
                        >
                          {isIn ? "+" : "−"}
                          {fmt(m.qty)}
                          <span className="ms-1 text-[10px] font-bold text-dim">{res?.unit ?? "وحدة"}</span>
                        </div>
                        <div className="text-[10px] font-semibold text-dim">{relTime(m.at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
