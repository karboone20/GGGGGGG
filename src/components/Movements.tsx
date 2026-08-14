import { useMemo, useState } from "react";
import type { Movement } from "../types";
import { clockTime, dayLabel, fmt, relTime } from "../lib/format";
import { ArrowInIcon, ArrowOutIcon, EmptyIcon, SwapIcon } from "./icons";

type Filter = "all" | "in" | "out";

export function Movements({
  movements,
  resourceName,
}: {
  movements: Movement[];
  resourceName: (id: string) => string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(() => [...movements].sort((a, b) => b.at - a.at), [movements]);
  const filtered = sorted.filter((m) => filter === "all" || m.type === filter);

  const totals = useMemo(
    () => ({
      inn: filtered.filter((m) => m.type === "in").reduce((s, m) => s + m.qty, 0),
      out: filtered.filter((m) => m.type === "out").reduce((s, m) => s + m.qty, 0),
    }),
    [filtered]
  );

  const groups = useMemo(() => {
    const map = new Map<string, Movement[]>();
    for (const m of filtered) {
      const key = new Date(m.at).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(m);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const tabs: { id: Filter; label: string; tint: string; count: number }[] = [
    { id: "all", label: "كل الحركات", tint: "#9db6a9", count: movements.length },
    {
      id: "in",
      label: "وارد",
      tint: "#3fd68f",
      count: movements.filter((m) => m.type === "in").length,
    },
    {
      id: "out",
      label: "صادر",
      tint: "#f0684f",
      count: movements.filter((m) => m.type === "out").length,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* الرأس */}
      <div className="panel animate-rise p-4" style={{ animationDelay: "40ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className={`rounded-xl border px-4 py-2 text-[12.5px] font-bold transition-all ${
                  filter === t.id ? "scale-[1.03]" : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  color: t.tint,
                  borderColor: filter === t.id ? `${t.tint}66` : "var(--color-line)",
                  background: filter === t.id ? `${t.tint}14` : "transparent",
                }}
              >
                {t.label}
                <span className="ms-1.5 tabular-nums opacity-70">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[12px] font-bold">
            <span className="flex items-center gap-1.5 rounded-lg border border-mint/30 bg-mint/10 px-3 py-1.5 text-mint tabular-nums">
              <ArrowInIcon className="size-3.5" />
              +{fmt(totals.inn)}
            </span>
            <span className="flex items-center gap-1.5 rounded-lg border border-coral/30 bg-coral/10 px-3 py-1.5 text-coral tabular-nums">
              <ArrowOutIcon className="size-3.5" />
              −{fmt(totals.out)}
            </span>
            <span className="rounded-lg border border-line px-3 py-1.5 text-mist tabular-nums">
              الصافي: {fmt(totals.inn - totals.out)}
            </span>
          </div>
        </div>
      </div>

      {/* السجل */}
      {groups.length === 0 && (
        <div className="panel animate-rise flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid size-16 place-items-center rounded-2xl border border-dashed border-line text-dim">
            <EmptyIcon className="size-8" />
          </span>
          <p className="font-display text-lg font-bold text-fog">لا توجد حركات مسجّلة</p>
          <p className="max-w-xs text-[12.5px] text-mist">
            كل عملية إيداع أو سحب تظهر هنا فورًا مع وقتها وتفاصيلها.
          </p>
        </div>
      )}

      {groups.map(([day, list], gi) => (
        <div key={day} className="animate-rise" style={{ animationDelay: `${80 + gi * 60}ms` }}>
          <div className="mb-2 flex items-center gap-3 px-1">
            <h3 className="font-display text-sm font-bold text-saffron">{dayLabel(list[0].at)}</h3>
            <span className="h-px flex-1 bg-line" />
            <span className="text-[10.5px] font-semibold text-dim tabular-nums">
              {list.length} حركة
            </span>
          </div>
          <div className="panel divide-y divide-linesoft overflow-hidden">
            {list.map((m) => (
              <div
                key={m.id}
                className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-raised/60"
              >
                <span
                  className={`grid size-10 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-110 ${
                    m.type === "in" ? "bg-mint/12 text-mint" : "bg-coral/12 text-coral"
                  }`}
                >
                  {m.type === "in" ? <ArrowInIcon className="size-4.5" /> : <ArrowOutIcon className="size-4.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13.5px] font-bold text-fog">
                      {resourceName(m.resourceId) ?? m.name}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        m.type === "in" ? "bg-mint/12 text-mint" : "bg-coral/12 text-coral"
                      }`}
                    >
                      {m.type === "in" ? "إيداع" : "صرف"}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11.5px] text-dim">
                    {m.note ? `«${m.note}»` : "بدون ملاحظة"} · {relTime(m.at)}
                  </p>
                </div>
                <div className="text-end">
                  <p
                    className={`font-display text-lg font-extrabold leading-6 tabular-nums ${
                      m.type === "in" ? "text-mint" : "text-coral"
                    }`}
                  >
                    {m.type === "in" ? "+" : "−"}
                    {fmt(m.qty)}
                  </p>
                  <p className="text-[10.5px] tabular-nums text-dim" dir="ltr">
                    {clockTime(m.at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {movements.length > 0 && (
        <p className="flex items-center justify-center gap-2 py-2 text-[11px] text-dim">
          <SwapIcon className="size-3.5" />
          إجمالي الحركات المسجّلة: <b className="text-mist tabular-nums">{movements.length}</b>
        </p>
      )}
    </div>
  );
}
