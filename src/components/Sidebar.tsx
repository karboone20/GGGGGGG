import type { View } from "../types";
import { fmt } from "../lib/format";
import {
  AlertIcon,
  BoxesIcon,
  BuildingIcon,
  CrateIcon,
  PulseIcon,
  ReceiptIcon,
  ResetIcon,
  SwapIcon,
} from "./icons";

interface NavProps {
  view: View;
  setView: (v: View) => void;
  itemCount: number;
  lowCount: number;
  todayMoves: number;
  receiptsToday: number;
  deptCount: number;
  storageKB: number;
  onReset: () => void;
}

export function Sidebar({
  view,
  setView,
  itemCount,
  lowCount,
  todayMoves,
  receiptsToday,
  deptCount,
  storageKB,
  onReset,
}: NavProps) {
  const NAV: Array<{ id: View; label: string; icon: (p: { className?: string }) => React.ReactNode; count?: number; tint?: string }> = [
    { id: "dashboard", label: "لوحة التحكم", icon: (p) => <PulseIcon {...p} /> },
    {
      id: "inventory",
      label: "المخزون",
      icon: (p) => <BoxesIcon {...p} />,
      count: itemCount,
    },
    {
      id: "movements",
      label: "سجل الحركات",
      icon: (p) => <SwapIcon {...p} />,
      count: todayMoves,
    },
    {
      id: "receipts",
      label: "الوصولات الخارجة",
      icon: (p) => <ReceiptIcon {...p} />,
      count: receiptsToday,
      tint: "#f0684f",
    },
    {
      id: "departments",
      label: "المصالح والأقسام",
      icon: (p) => <BuildingIcon {...p} />,
      count: deptCount,
      tint: "#b78cf0",
    },
  ];

  return (
    <>
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-[264px] flex-col border-l border-line bg-surface/80 backdrop-blur-md lg:flex">
        {/* الشعار */}
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="relative grid size-11 place-items-center rounded-xl bg-gradient-to-br from-saffron to-[#d97f1f] text-ink shadow-lg shadow-saffron/25">
            <CrateIcon className="size-6" strokeWidth={2} />
            <span className="absolute -left-1 -top-1 size-2.5 rounded-full bg-mint ring-2 ring-surface animate-blink" />
          </span>
          <div>
            <h1 className="font-display text-[22px] font-extrabold leading-6 text-fog">المُستودَع</h1>
            <p className="text-[10.5px] font-semibold text-dim">إدارة الموارد والمخزون</p>
          </div>
        </div>

        {/* التنقل */}
        <nav className="mt-1 flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px] font-bold transition-all duration-200 ${
                  active
                    ? "bg-raised text-fog shadow-inner"
                    : "text-mist hover:bg-raised/60 hover:text-fog"
                }`}
              >
                <span className={`relative transition-transform duration-200 ${active ? "" : "group-hover:-translate-x-0.5"}`}>
                  {item.icon({ className: `size-[18px] ${active ? "text-saffron" : ""}` })}
                </span>
                <span className="flex-1 text-start">{item.label}</span>
                {item.count !== undefined && (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold tabular-nums ${
                      active ? "bg-saffron/15 text-saffron" : "bg-lift text-dim"
                    }`}
                    style={item.tint && item.count > 0 ? { color: item.tint, background: `${item.tint}18` } : undefined}
                  >
                    {fmt(item.count)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* تنبيه المخزون المنخفض */}
        {lowCount > 0 && (
          <div className="mx-3 mb-3 rounded-xl border border-saffron/25 bg-saffron/8 p-3.5 animate-fadein">
            <p className="flex items-center gap-2 text-[12px] font-extrabold text-saffron">
              <AlertIcon className="size-4" />
              {lowCount === 1 ? "صنف واحد تحت الحد" : `${lowCount} أصناف تحت الحد الأدنى`}
            </p>
            <p className="mt-1 text-[10.5px] font-semibold leading-4 text-mist">
              راجع لوحة التحكم لجدول التعويض السريع
            </p>
          </div>
        )}

        {/* التخزين المحلي */}
        <div className="border-t border-line px-5 py-4">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-dim">
            <span>التخزين المحلي</span>
            <span className="tabular-nums">{storageKB} ك.ب</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
            <div
              className="h-full rounded-full bg-gradient-to-l from-mint to-saffron transition-all duration-700"
              style={{ width: `${Math.min(100, (storageKB / 512) * 100)}%` }}
            />
          </div>
          <button
            onClick={onReset}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line py-1.5 text-[10.5px] font-bold text-dim transition-colors hover:border-coral/50 hover:text-coral"
          >
            <ResetIcon className="size-3.5" />
            استعادة البيانات التجريبية
          </button>
        </div>
      </aside>
    </>
  );
}

export function MobileNav({ view, setView }: { view: View; setView: (v: View) => void }) {
  const items: Array<{ id: View; label: string }> = [
    { id: "dashboard", label: "الرئيسية" },
    { id: "inventory", label: "المخزون" },
    { id: "movements", label: "الحركات" },
    { id: "receipts", label: "الوصولات" },
    { id: "departments", label: "المصالح" },
  ];
  return (
    <nav className="flex gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
      {items.map((it) => (
        <button
          key={it.id}
          onClick={() => setView(it.id)}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
            view === it.id ? "bg-saffron/15 text-saffron" : "text-mist hover:text-fog"
          }`}
        >
          {it.label}
        </button>
      ))}
    </nav>
  );
}
