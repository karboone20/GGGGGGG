import type { View } from "../types";
import { AlertIcon, BoxesIcon, CrateIcon, PulseIcon, ResetIcon, SwapIcon } from "./icons";

const NAV: { id: View; label: string; icon: typeof PulseIcon; desc: string }[] = [
  { id: "dashboard", label: "لوحة التحكم", icon: PulseIcon, desc: "نظرة شاملة" },
  { id: "inventory", label: "المخزون", icon: BoxesIcon, desc: "الأصناف والكميات" },
  { id: "movements", label: "الحركات", icon: SwapIcon, desc: "وارد وصادر" },
];

export function Sidebar({
  view,
  setView,
  itemCount,
  lowCount,
  todayMoves,
  storageKB,
  onReset,
}: {
  view: View;
  setView: (v: View) => void;
  itemCount: number;
  lowCount: number;
  todayMoves: number;
  storageKB: number;
  onReset: () => void;
}) {
  const badge = (id: View) =>
    id === "inventory" ? itemCount : id === "movements" ? todayMoves : lowCount;

  return (
    <aside className="fixed inset-y-0 right-0 z-40 hidden w-[264px] flex-col border-l border-line bg-surface/80 backdrop-blur-md lg:flex">
      {/* الشعار */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-5">
        <span className="grid size-11 place-items-center rounded-xl bg-saffron/15 text-saffron ring-1 ring-saffron/30">
          <CrateIcon className="size-6" />
        </span>
        <div>
          <p className="font-display text-2xl font-extrabold leading-6 text-fog">المُستودَع</p>
          <p className="text-[11px] text-dim">نظام الموارد والمخزون</p>
        </div>
      </div>

      {/* التنقل */}
      <nav className="flex flex-col gap-1.5 px-3 py-4">
        {NAV.map((n) => {
          const active = view === n.id;
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`group relative flex items-center gap-3 rounded-xl border px-3.5 py-3 text-start transition-all duration-200 ${
                active
                  ? "border-saffron/35 bg-saffron/10 text-fog"
                  : "border-transparent text-mist hover:border-line hover:bg-raised hover:text-fog"
              }`}
            >
              <span
                className={`absolute inset-y-2 right-0 w-[3px] rounded-full bg-saffron transition-all duration-300 ${
                  active ? "opacity-100" : "opacity-0 -translate-x-1"
                }`}
              />
              <Icon
                className={`size-5 shrink-0 transition-colors ${active ? "text-saffron" : "text-dim group-hover:text-mist"}`}
              />
              <span className="flex-1">
                <span className="block text-sm font-bold leading-4">{n.label}</span>
                <span className="block text-[10.5px] text-dim">{n.desc}</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold tabular-nums ${
                  active ? "bg-saffron/20 text-saffron" : "bg-lift text-mist"
                }`}
              >
                {badge(n.id)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* تنبيه */}
      <div className="mx-3 rounded-xl border border-coral/25 bg-coral/[0.07] p-3.5">
        <div className="flex items-center gap-2 text-coral">
          <AlertIcon className="size-4.5" />
          <span className="text-xs font-bold">تنبيهات المخزون</span>
        </div>
        <p className="mt-1.5 text-[11.5px] leading-5 text-mist">
          {lowCount > 0 ? (
            <>
              يوجد <b className="text-coral tabular-nums">{lowCount}</b>{" "}
              {lowCount === 1 ? "صنف" : lowCount === 2 ? "صنفان" : "أصناف"} تحت الحد الأدنى ويحتاج
              إلى تعويض.
            </>
          ) : (
            "جميع الأصناف فوق الحد الأدنى. وضع ممتاز!"
          )}
        </p>
        {lowCount > 0 && (
          <button
            onClick={() => setView("inventory")}
            className="mt-2 w-full rounded-lg border border-coral/40 bg-coral/15 py-1.5 text-[11.5px] font-bold text-coral transition-colors hover:bg-coral/25"
          >
            مراجعة الأصناف
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* التخزين المحلي */}
      <div className="border-t border-line px-5 py-4">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-mist">التخزين المحلي</span>
          <span className="tabular-nums text-dim">{storageKB} ك.ب</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-lift">
          <div
            className="h-full rounded-full bg-gradient-to-l from-mint to-saffron transition-all duration-700"
            style={{ width: `${Math.min(100, (storageKB / 64) * 100)}%` }}
          />
        </div>
        <button
          onClick={onReset}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-1.5 text-[11px] font-semibold text-dim transition-colors hover:border-sky/40 hover:text-sky"
        >
          <ResetIcon className="size-3.5" />
          استعادة البيانات التجريبية
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
      {NAV.map((n) => {
        const Icon = n.icon;
        const active = view === n.id;
        return (
          <button
            key={n.id}
            onClick={() => setView(n.id)}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
              active
                ? "border-saffron/40 bg-saffron/15 text-saffron"
                : "border-line bg-surface text-mist"
            }`}
          >
            <Icon className="size-4" />
            {n.label}
          </button>
        );
      })}
    </div>
  );
}
