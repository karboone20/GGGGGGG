import { useMemo, useState } from "react";
import type { Category, Movement, Resource } from "../types";
import { clockTime, dateInputValue, dayLabel, fmt, receiptNo } from "../lib/format";
import { useCountUp } from "./ui";
import { CalendarIcon, PlusIcon, ReceiptIcon, UsersIcon } from "./icons";

type Range = "today" | "yesterday" | "all" | string;

export function Receipts({
  movements,
  resources,
  categories,
  onNewReceipt,
}: {
  movements: Movement[];
  resources: Resource[];
  categories: Category[];
  onNewReceipt: () => void;
}) {
  const [range, setRange] = useState<Range>("today");

  const resById = useMemo(() => new Map(resources.map((r) => [r.id, r])), [resources]);
  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const receipts = useMemo(() => movements.filter((m) => m.type === "out"), [movements]);

  const filtered = useMemo(() => {
    if (range === "all") return receipts;
    const day = new Date();
    if (range === "yesterday") day.setDate(day.getDate() - 1);
    else if (range !== "today") {
      const [y, mo, d] = (range as string).split("-").map(Number);
      if (!y || !mo || !d) return receipts;
      day.setFullYear(y, mo - 1, d);
    }
    const target = day.toDateString();
    return receipts.filter((m) => new Date(m.at).toDateString() === target);
  }, [receipts, range]);

  const totalUnits = filtered.reduce((a, m) => a + m.qty, 0);
  const beneficiaries = new Set(filtered.map((m) => m.beneficiary).filter(Boolean)).size;

  const groups = useMemo(() => {
    const map = new Map<string, Movement[]>();
    for (const m of [...filtered].sort((a, b) => b.at - a.at)) {
      const key = new Date(m.at).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return [...map.entries()];
  }, [filtered]);

  const headCount = useCountUp(filtered.length);
  const unitsCount = useCountUp(totalUnits);

  const rangeTitle =
    range === "today"
      ? "بتاريخ اليوم"
      : range === "yesterday"
        ? "بتاريخ أمس"
        : range === "all"
          ? "— كل التواريخ"
          : `بتاريخ ${dayLabel(new Date(`${range}T12:00:00`).getTime())}`;

  return (
    <div className="flex flex-col gap-5 animate-rise">
      {/* رأس الشاشة + الفلاتر */}
      <div className="panel relative overflow-hidden p-5">
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 place-items-center rounded-xl bg-coral/15 text-coral ring-1 ring-coral/30">
              <ReceiptIcon className="size-6" />
            </span>
            <div>
              <h2 className="font-display text-xl font-extrabold text-fog sm:text-2xl">
                الوصولات الخارجة{" "}
                <span className="text-[15px] font-bold text-saffron sm:text-base">{rangeTitle}</span>
              </h2>
              <p className="mt-0.5 text-[12px] text-mist">
                كل عملية صرف تُرقَّم تلقائيًا بوصولة رسمية ({receiptNo(1)} ← …)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center overflow-hidden rounded-xl border border-line bg-raised">
              {(
                [
                  ["today", "اليوم"],
                  ["yesterday", "أمس"],
                  ["all", "الكل"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setRange(v)}
                  className={`px-4 py-2 text-[12.5px] font-bold transition-colors ${
                    range === v ? "bg-saffron text-ink" : "text-mist hover:text-fog"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-raised px-3 py-1.5 text-[12.5px] font-bold text-mist transition-colors hover:border-saffron/50 hover:text-fog">
              <CalendarIcon className="size-4 text-saffron" />
              <input
                type="date"
                value={range.length === 10 ? range : ""}
                max={dateInputValue(Date.now())}
                onChange={(e) => e.target.value && setRange(e.target.value)}
                className="bg-transparent text-[12px] font-bold text-fog outline-none [color-scheme:dark]"
              />
            </label>
            <button
              onClick={onNewReceipt}
              className="flex items-center gap-1.5 rounded-xl bg-mint px-3.5 py-2 text-[12.5px] font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            >
              <PlusIcon className="size-4" strokeWidth={2.4} />
              تسجيل وصولة
            </button>
          </div>
        </div>

        {/* ملخص */}
        <div className="relative mt-5 grid grid-cols-3 divide-x divide-x-reverse divide-line overflow-hidden rounded-xl border border-line bg-ink/40">
          {[
            { label: "وصولات", value: fmt(headCount), color: "#f0a63c" },
            { label: "وحدة مصروفة", value: fmt(unitsCount), color: "#3fd68f" },
            { label: "جهة مستفيدة", value: fmt(beneficiaries), color: "#58b0ee" },
          ].map((s) => (
            <div key={s.label} className="px-3 py-3.5 text-center">
              <div
                className="font-display text-xl font-extrabold tabular-nums sm:text-2xl"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-dim">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* القوائم */}
      {filtered.length === 0 ? (
        <div className="panel grid place-items-center px-6 py-16 text-center animate-fadein">
          <span className="grid size-16 place-items-center rounded-2xl border border-dashed border-line text-dim">
            <ReceiptIcon className="size-8" />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-fog">
            لا وصولات خارجة {rangeTitle}
          </h3>
          <p className="mt-1 max-w-sm text-[13px] leading-6 text-mist">
            عند صرف أي صنف من المخزون تُنشأ وصولة مرقّمة هنا تلقائيًا باسم الجهة المستفيدة ووقتها.
          </p>
          <button
            onClick={onNewReceipt}
            className="mt-5 flex items-center gap-2 rounded-xl bg-saffron px-4 py-2.5 text-[13px] font-extrabold text-ink transition-transform hover:-translate-y-0.5"
          >
            <PlusIcon className="size-4" strokeWidth={2.4} />
            تسجيل وصولة الآن
          </button>
        </div>
      ) : (
        groups.map(([day, list]) => (
          <section key={day}>
            <div className="mb-2.5 flex items-center gap-3">
              <span className="font-display text-[13px] font-bold text-saffron">
                {dayLabel(list[0].at)}
              </span>
              <span className="text-[11px] font-semibold tabular-nums text-dim">
                {list.length} وصولة · {fmt(list.reduce((a, m) => a + m.qty, 0))} وحدة
              </span>
              <span className="h-px flex-1 bg-linesoft" />
            </div>

            <div className="flex flex-col gap-2">
              {list.map((m) => {
                const res = resById.get(m.resourceId);
                const cat = res ? catById.get(res.categoryId) : undefined;
                const color = cat?.color ?? "#64806f";
                return (
                  <article
                    key={m.id}
                    className="panel flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-line/80 hover:bg-raised"
                  >
                    <span className="rounded-lg border border-saffron/35 bg-saffron/10 px-2.5 py-1 font-display text-[12px] font-extrabold tabular-nums text-saffron">
                      {receiptNo(m.receiptSeq ?? 0)}
                    </span>

                    <div className="min-w-[180px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold text-fog">{m.name}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ color, background: `${color}18` }}
                        >
                          {cat?.name ?? "قسم محذوف"}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-mist">
                        <span className="flex items-center gap-1.5">
                          <UsersIcon className="size-3.5 text-sky" />
                          {m.beneficiary || "جهة غير محددة"}
                        </span>
                        {m.note && <span className="italic text-dim">«{m.note}»</span>}
                      </div>
                    </div>

                    <div className="text-left">
                      <div className="font-display text-xl font-extrabold tabular-nums text-coral">
                        {fmt(m.qty)}
                        <span className="ms-1 text-[11px] font-bold text-mist">وحدة</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px] font-semibold tabular-nums text-dim">
                        <svg
                          viewBox="0 0 24 24"
                          className="size-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        >
                          <circle cx="12" cy="12" r="8.5" />
                          <path d="M12 7.5V12l3 2" />
                        </svg>
                        {clockTime(m.at)}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
