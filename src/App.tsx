import { useEffect, useState } from "react";
import type { ModalState, MovementType, Resource, View } from "./types";
import { storageKB, useStore } from "./hooks/useStore";
import { fmt, fullDate } from "./lib/format";
import { ToastProvider, useToast } from "./components/ui";
import { Sidebar, MobileNav } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Movements } from "./components/Movements";
import { DeleteModal, MovementModal, ResourceModal } from "./components/Modals";
import { CrateIcon, PlusIcon } from "./components/icons";

const TITLES: Record<View, { title: string; sub: string }> = {
  dashboard: { title: "لوحة التحكم", sub: "نبض المستودع لحظة بلحظة" },
  inventory: { title: "المخزون", sub: "كل الأصناف والكميات والقيم" },
  movements: { title: "سجل الحركات", sub: "الوارد والصادر بالتاريخ والوقت" },
};

function LiveClock() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const time = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(now);
  return (
    <span className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2 text-[12px] font-bold tabular-nums text-mist sm:flex">
      <span className="size-1.5 rounded-full bg-mint animate-blink" />
      <span dir="ltr">{time}</span>
    </span>
  );
}

function Shell() {
  const store = useStore();
  const notify = useToast();
  const [view, setView] = useState<View>("dashboard");
  const [modal, setModal] = useState<ModalState>(null);

  const lowCount = store.resources.filter((r) => r.qty <= r.minQty).length;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayMoves = store.movements.filter((m) => m.at >= todayStart).length;
  const kb = storageKB();

  /* ---- handlers ---- */

  const openMove = (r: Resource, t: MovementType) => setModal({ kind: "move", resource: r, type: t });

  const saveResource = (data: {
    name: string;
    sku: string;
    categoryId: string;
    qty: number;
    minQty: number;
    unit: string;
    price: number;
    location: string;
  }) => {
    if (modal?.kind === "resource" && modal.resource) {
      store.updateResource(modal.resource.id, data);
      notify("success", `تم حفظ تعديلات «${data.name}»`);
    } else {
      store.addResource(data);
      notify("success", `أُضيف «${data.name}» إلى المستودع`);
    }
    setModal(null);
  };

  const confirmMove = (type: MovementType, qty: number, note: string) => {
    if (modal?.kind !== "move") return;
    const ok = store.move(modal.resource, type, qty, note);
    if (ok) {
      notify(
        type === "in" ? "success" : "info",
        type === "in"
          ? `أُودعت ${fmt(qty)} وحدة في «${modal.resource.name}»`
          : `صُرفت ${fmt(qty)} وحدة من «${modal.resource.name}»`
      );
      setModal(null);
    } else {
      notify("error", "تعذّر تنفيذ الحركة — تحقق من الكمية");
    }
  };

  const confirmDelete = () => {
    if (modal?.kind !== "delete") return;
    store.removeResource(modal.resource.id);
    notify("error", `حُذف «${modal.resource.name}» من المستودع`);
    setModal(null);
  };

  const meta = TITLES[view];

  return (
    <div className="min-h-screen">
      {/* خلفية محيطية */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-ink" />
        <div
          className="absolute inset-0 grid-dots"
          style={{ maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)" }}
        />
        <div
          className="absolute -top-40 right-1/4 h-[480px] w-[480px] rounded-full opacity-[0.13] blur-[110px]"
          style={{ background: "#f0a63c" }}
        />
        <div
          className="absolute bottom-[-160px] left-[-80px] h-[420px] w-[420px] rounded-full opacity-[0.09] blur-[110px]"
          style={{ background: "#3fd68f" }}
        />
      </div>

      <Sidebar
        view={view}
        setView={setView}
        itemCount={store.resources.length}
        lowCount={lowCount}
        todayMoves={todayMoves}
        storageKB={kb}
        onReset={() => {
          store.resetAll();
          notify("info", "استُعيدت البيانات التجريبية بنجاح");
        }}
      />

      <main className="lg:pr-[264px]">
        {/* الشريط العلوي */}
        <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl bg-saffron/15 text-saffron ring-1 ring-saffron/30 lg:hidden">
                <CrateIcon className="size-5" />
              </span>
              <div>
                <h1 className="font-display text-xl font-extrabold leading-6 text-fog sm:text-2xl">
                  {meta.title}
                </h1>
                <p className="text-[11px] text-dim">
                  {meta.sub} · {fullDate(Date.now())}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <LiveClock />
              <button
                onClick={() => setModal({ kind: "resource" })}
                className="flex items-center gap-2 rounded-xl bg-saffron px-3.5 py-2.5 text-[13px] font-extrabold text-ink shadow-lg shadow-saffron/20 transition-all hover:-translate-y-0.5 hover:bg-[#f7b455] active:translate-y-0"
              >
                <PlusIcon className="size-4" strokeWidth={2.4} />
                <span className="hidden sm:inline">إضافة مورد</span>
                <span className="sm:hidden">إضافة</span>
              </button>
            </div>
          </div>
          <MobileNav view={view} setView={setView} />
        </header>

        {/* المحتوى */}
        <div key={view} className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6">
          {view === "dashboard" && (
            <Dashboard
              resources={store.resources}
              movements={store.movements}
              onMove={openMove}
              onAdd={() => setModal({ kind: "resource" })}
              goInventory={() => setView("inventory")}
              goMovements={() => setView("movements")}
            />
          )}
          {view === "inventory" && (
            <Inventory
              resources={store.resources}
              onMove={openMove}
              onEdit={(r) => setModal({ kind: "resource", resource: r })}
              onDelete={(r) => setModal({ kind: "delete", resource: r })}
              onAdd={() => setModal({ kind: "resource" })}
            />
          )}
          {view === "movements" && (
            <Movements
              movements={store.movements}
              resourceName={(id) => store.resources.find((r) => r.id === id)?.name ?? ""}
            />
          )}

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-linesoft pt-4 text-[11px] text-dim">
            <span>
              المُستودَع · بياناتك محفوظة محليًا في متصفحك ({kb} ك.ب)
            </span>
            <span className="tabular-nums">
              {fmt(store.resources.length)} صنف · {fmt(store.movements.length)} حركة مسجّلة
            </span>
          </footer>
        </div>
      </main>

      {/* النوافذ */}
      {modal?.kind === "resource" && (
        <ResourceModal resource={modal.resource} onSave={saveResource} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "move" && (
        <MovementModal
          resource={store.resources.find((r) => r.id === modal.resource.id) ?? modal.resource}
          initialType={modal.type}
          onMove={confirmMove}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "delete" && (
        <DeleteModal resource={modal.resource} onConfirm={confirmDelete} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
}
