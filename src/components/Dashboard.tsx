import { useEffect, useMemo, useState } from "react";
import type { Movement, MovementType, Resource } from "../types";
import { CATEGORIES, catById, stockStatus } from "../data";
import { fmt, money, relTime } from "../lib/format";
import { StatusBadge, useCountUp } from "./ui";
import {
  ArrowInIcon,
  ArrowOutIcon,
  BoxesIcon,
  CoinIcon,
  PlusIcon,
  SwapIcon,
} from "./icons";

const D = 86_400_000;

function Panel({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section className={`panel animate-rise ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </section>
  );
}

function PanelHead({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-linesoft px-5 py-3.5">
      <div>
        <h3 className="font-display text-base font-bold text-fog">{title}</h3>
        {hint && <p className="text-[11px] text-dim">{hint}</p>}
      </div>
      {action}
    </header>
  );
}

/* حلقة الجاهزية */
function HealthRing({ pct }: { pct: number }) {
  const [offset, setOffset] = useState(1);
  const R = 52;
  const C = 2 * Math.PI * R;
  useEffect(() => {
    const t = window.setTimeout(() => setOffset(1 - pct / 100), 250);
    return () => window.clearTimeout(t);
  }, [pct]);
  const color = pct >= 80 ? "#3fd68f" : pct >= 55 ? "#f0a63c" : "#f0684f";
  return (
    <div className="relative size-[132px] shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={R} fill="none" stroke="#1b2e27" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * offset}
          style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-2xl font-extrabold tabular-nums leading-6" style={{ color }}>
            {pct}%
          </p>
          <p className="text-[10px] text-dim">جاهزية</p>
        </div>
      </div>
    </div>
  );
}

/* شريط التنبيهات المتحرك */
function AlertTicker({ items }: { items: Resource[] }) {
  if (items.length === 0) return null;
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {items.map((r) => (
        <span key={key + r.id} className="flex items-center gap-2 px-5 text-xs font-semibold">
          <span className={`size-1.5 rounded-full ${r.qty === 0 ? "bg-coral" : "bg-saffron"} animate-blink`} />
          <span className="text-fog">{r.name}</span>
          <span className={r.qty === 0 ? "text-coral" : "text-saffron"}>
            {r.qty === 0 ? "نفد تمامًا" : `متبقٍ ${r.qty} فقط`}
          </span>
          <span className="text-dim">◆</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="panel overflow-hidden !rounded-full animate-rise" style={{ animationDelay: "40ms" }}>
      <div className="flex items-center">
        <span className="z-10 flex shrink-0 items-center gap-2 border-l border-line bg-coral/15 py-2 pe-4 ps-4 text-xs font-bold text-coral">
          <span className="size-2 rounded-full bg-coral animate-blink" />
          تنبيه
        </span>
        <div className="relative flex-1 overflow-hidden" dir="ltr">
          <div className="flex w-max animate-marquee py-2 hover:[animation-play-state:paused]">
            {row("a")}
            {row("b")}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({
  resources,
  movements,
  onMove,
  onAdd,
  goInventory,
  goMovements,
}: {
  resources: Resource[];
  movements: Movement[];
  onMove: (r: Resource, t: MovementType) => void;
  onAdd: () => void;
  goInventory: () => void;
  goMovements: () => void;
}) {
  const stats = useMemo(() => {
    const totalUnits = resources.reduce((s, r) => s + r.qty, 0);
    const totalValue = resources.reduce((s, r) => s + r.qty * r.price, 0);
    const low = resources.filter((r) => stockStatus(r) !== "ok");
    const ok = resources.length - low.length;
    const cutoff = Date.now() - 14 * D;
    const recent = movements.filter((m) => m.at >= cutoff);
    const inSum = recent.filter((m) => m.type === "in").reduce((s, m) => s + m.qty, 0);
    const outSum = recent.filter((m) => m.type === "out").reduce((s, m) => s + m.qty, 0);

    const days = Array.from({ length: 14 }, (_, i) => {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      const start = dayStart.getTime() - (13 - i) * D;
      const end = start + D;
      const dayMoves = movements.filter((m) => m.at >= start && m.at < end);
      return {
        label: new Intl.DateTimeFormat("ar-EG-u-nu-latn", { day: "numeric" }).format(start),
        weekday: new Intl.DateTimeFormat("ar", { weekday: "short" }).format(start),
        inn: dayMoves.filter((m) => m.type === "in").reduce((s, m) => s + m.qty, 0),
        out: dayMoves.filter((m) => m.type === "out").reduce((s, m) => s + m.qty, 0),
      };
    });

    const catDist = CATEGORIES.map((c) => ({
      ...c,
      units: resources.filter((r) => r.categoryId === c.id).reduce((s, r) => s + r.qty, 0),
      count: resources.filter((r) => r.categoryId === c.id).length,
    })).sort((a, b) => b.units - a.units);

    return {
      totalUnits,
      totalValue,
      low,
      inSum,
      outSum,
      days,
      catDist,
      health: resources.length ? Math.round((ok / resources.length) * 100) : 100,
    };
  }, [resources, movements]);

  const units = useCountUp(stats.totalUnits);
  const value = useCountUp(stats.totalValue);
  const maxDay = Math.max(1, ...stats.days.map((d) => Math.max(d.inn, d.out)));
  const maxCat = Math.max(1, ...stats.catDist.map((c) => c.units));

  const kpis = [
    { label: "إجمالي الأصناف", val: fmt(resources.length), icon: BoxesIcon, tint: "#58b0ee", sub: `${stats.catDist.filter((c) => c.count > 0).length} فئات نشطة` },
    { label: "قيمة المخزون", val: money(value), icon: CoinIcon, tint: "#f0a63c", sub: "بسعر الوحدة الحالي" },
    { label: "وارد 14 يوم", val: `+${fmt(stats.inSum)}`, icon: ArrowInIcon, tint: "#3fd68f", sub: "وحدة دخلت المستودع" },
    { label: "صادر 14 يوم", val: `−${fmt(stats.outSum)}`, icon: ArrowOutIcon, tint: "#f0684f", sub: "وحدة صُرفت" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <AlertTicker items={stats.low} />

      {/* الصف الأول: نبض المخزون + المؤشرات */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-5" delay={60}>
          <div className="flex h-full flex-col p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">نبض المخزون</h3>
              <span className="flex items-center gap-1.5 rounded-full border border-mint/30 bg-mint/10 px-2.5 py-1 text-[10.5px] font-bold text-mint">
                <span className="size-1.5 rounded-full bg-mint animate-blink" />
                مباشر
              </span>
            </div>
            <div className="mt-4 flex flex-1 items-center justify-between gap-4">
              <div>
                <p className="font-display text-[56px] font-extrabold leading-none tabular-nums text-fog">
                  {fmt(units)}
                </p>
                <p className="mt-2 text-sm font-semibold text-mist">وحدة مخزّنة الآن</p>
                <p className="mt-4 text-[12px] text-dim">
                  {fmt(resources.length)} صنف · بقيمة{" "}
                  <b className="text-saffron">{money(stats.totalValue)}</b>
                </p>
              </div>
              <HealthRing pct={stats.health} />
            </div>
          </div>
        </Panel>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <Panel key={k.label} delay={100 + i * 70} className="group">
                <div className="flex h-full flex-col justify-between p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold text-mist">{k.label}</p>
                    <span
                      className="grid size-9 place-items-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                      style={{ background: `${k.tint}18`, color: k.tint }}
                    >
                      <Icon className="size-4.5" />
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="font-display text-[26px] font-extrabold leading-7 tabular-nums text-fog">
                      {k.val}
                    </p>
                    <p className="mt-1 text-[11px] text-dim">{k.sub}</p>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>

      {/* الصف الثاني: الفئات + حركة 14 يوم */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-4" delay={180}>
          <PanelHead title="توزيع الفئات" hint="حسب عدد الوحدات" />
          <div className="flex flex-col gap-4 p-5">
            {stats.catDist.map((c, i) => (
              <div key={c.id}>
                <div className="mb-1.5 flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2 font-semibold text-fog">
                    <span className="size-2.5 rounded-[4px]" style={{ background: c.color }} />
                    {c.name}
                    <span className="text-[10.5px] font-medium text-dim">({c.count} صنف)</span>
                  </span>
                  <span className="font-bold tabular-nums" style={{ color: c.color }}>
                    {fmt(c.units)}
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-lift">
                  <div
                    className="h-full rounded-full animate-growbar"
                    style={{
                      width: `${Math.max(2, (c.units / maxCat) * 100)}%`,
                      background: `linear-gradient(to left, ${c.color}, ${c.color}88)`,
                      transformOrigin: "right",
                      animationDelay: `${300 + i * 90}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-8" delay={240}>
          <PanelHead
            title="حركة الوارد والصادر"
            hint="آخر 14 يومًا — مرّر فوق الأعمدة للتفاصيل"
            action={
              <button
                onClick={goMovements}
                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-bold text-mist transition-colors hover:border-sky/40 hover:text-sky"
              >
                <SwapIcon className="size-3.5" />
                السجل الكامل
              </button>
            }
          />
          <div className="p-5">
            <div className="mb-3 flex items-center gap-4 text-[11px] text-mist">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-mint" /> وارد
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-[3px] bg-coral/80" /> صادر
              </span>
            </div>
            <div className="grid grid-cols-14 gap-1.5 sm:gap-2.5">
              {stats.days.map((d, i) => (
                <div key={i} className="group relative flex flex-col items-center gap-1.5">
                  <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-raised px-2.5 py-1 text-[10.5px] font-bold opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                    <span className="text-mint">+{d.inn}</span>
                    <span className="mx-1 text-dim">/</span>
                    <span className="text-coral">−{d.out}</span>
                  </div>
                  <div className="flex h-28 w-full items-end justify-center gap-[3px]">
                    <div
                      className="w-[38%] max-w-[16px] rounded-t-[4px] bg-mint animate-growup"
                      style={{
                        height: `${Math.max(3, (d.inn / maxDay) * 100)}%`,
                        transformOrigin: "bottom",
                        animationDelay: `${350 + i * 45}ms`,
                      }}
                    />
                    <div
                      className="w-[38%] max-w-[16px] rounded-t-[4px] bg-coral/80 animate-growup"
                      style={{
                        height: `${Math.max(3, (d.out / maxDay) * 100)}%`,
                        transformOrigin: "bottom",
                        animationDelay: `${390 + i * 45}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[9.5px] tabular-nums text-dim group-hover:text-mist">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* الصف الثالث: منخفضة + آخر الحركات */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Panel className="lg:col-span-5" delay={300}>
          <PanelHead
            title="أصناف تحتاج تعويضًا"
            hint="تحت الحد الأدنى"
            action={
              <span className="rounded-full bg-coral/15 px-2.5 py-1 text-[11px] font-bold text-coral tabular-nums">
                {stats.low.length}
              </span>
            }
          />
          <div className="flex flex-col">
            {stats.low.length === 0 && (
              <p className="p-6 text-center text-sm text-dim">لا توجد أصناف منخفضة — ممتاز!</p>
            )}
            {stats.low.slice(0, 5).map((r) => {
              const st = stockStatus(r);
              return (
                <div
                  key={r.id}
                  className="group flex items-center gap-3 border-b border-linesoft px-5 py-3 transition-colors last:border-0 hover:bg-raised/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-bold text-fog">{r.name}</p>
                    <p className="mt-0.5 text-[11px] tabular-nums text-dim">
                      المتبقي <b className={st === "out" ? "text-coral" : "text-saffron"}>{r.qty}</b> من
                      حد أدنى {r.minQty} · {catById(r.categoryId).name}
                    </p>
                  </div>
                  <StatusBadge status={st} />
                  <button
                    onClick={() => onMove(r, "in")}
                    className="flex items-center gap-1 rounded-lg border border-mint/40 bg-mint/10 px-2.5 py-1.5 text-[11px] font-bold text-mint opacity-90 transition-all hover:bg-mint/20 hover:opacity-100"
                    title="إيداع كمية"
                  >
                    <PlusIcon className="size-3.5" />
                    تعويض
                  </button>
                </div>
              );
            })}
            {stats.low.length > 0 && (
              <button
                onClick={goInventory}
                className="mx-5 my-3 rounded-lg border border-line py-2 text-[12px] font-bold text-mist transition-colors hover:border-saffron/40 hover:text-saffron"
              >
                عرض كل الأصناف
              </button>
            )}
          </div>
        </Panel>

        <Panel className="lg:col-span-7" delay={360}>
          <PanelHead
            title="آخر الحركات"
            hint="أحدث عمليات الإيداع والصرف"
            action={
              <button
                onClick={goMovements}
                className="rounded-lg border border-line px-3 py-1.5 text-[11.5px] font-bold text-mist transition-colors hover:border-sky/40 hover:text-sky"
              >
                عرض الكل
              </button>
            }
          />
          <div className="grid sm:grid-cols-2">
            {movements.slice(0, 8).map((mv, i) => (
              <div
                key={mv.id}
                className="flex items-center gap-3 border-b border-linesoft px-5 py-3 transition-colors hover:bg-raised/60 sm:[&:nth-child(odd)]:border-l"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg ${
                    mv.type === "in" ? "bg-mint/12 text-mint" : "bg-coral/12 text-coral"
                  }`}
                >
                  {mv.type === "in" ? <ArrowInIcon className="size-4" /> : <ArrowOutIcon className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-bold text-fog">{mv.name}</p>
                  <p className="text-[10.5px] text-dim">{relTime(mv.at)}</p>
                </div>
                <span
                  className={`text-sm font-extrabold tabular-nums ${
                    mv.type === "in" ? "text-mint" : "text-coral"
                  }`}
                >
                  {mv.type === "in" ? "+" : "−"}
                  {fmt(mv.qty)}
                </span>
              </div>
            ))}
            {movements.length === 0 && (
              <p className="col-span-full p-6 text-center text-sm text-dim">
                لا توجد حركات بعد — ابدأ بإيداع أول كمية.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
