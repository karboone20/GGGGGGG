import { useEffect, useRef, useState } from "react";
import type { ModalState, MovementType, Resource, View } from "./types";
import { storageKB, useStore } from "./hooks/useStore";
import {
  dateInputValue,
  downloadFile,
  fmt,
  fullDate,
  receiptNo,
  toCsv,
} from "./lib/format";
import { ToastProvider, useToast } from "./components/ui";
import { Sidebar, MobileNav } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { Inventory } from "./components/Inventory";
import { Movements } from "./components/Movements";
import { Receipts } from "./components/Receipts";
import { Departments } from "./components/Departments";
import {
  DeleteModal,
  DepartmentModal,
  ImportModal,
  MovementModal,
  ResourceModal,
} from "./components/Modals";
import {
  BoxesIcon,
  BuildingIcon,
  ChevronDownIcon,
  CrateIcon,
  DownloadIcon,
  FileTextIcon,
  PlusIcon,
  ReceiptIcon,
  UploadIcon,
} from "./components/icons";

const TITLES: Record<View, { title: string; sub: string }> = {
  dashboard: { title: "لوحة التحكم", sub: "نبض المستودع لحظة بلحظة" },
  inventory: { title: "المخزون", sub: "كل الأصناف والكميات والقيم" },
  movements: { title: "سجل الحركات", sub: "الوارد والصادر بالتاريخ والوقت" },
  receipts: { title: "الوصولات الخارجة", sub: "متابعة عمليات الصرف اليومية" },
  departments: { title: "المصالح والأقسام", sub: "هيكلة المخزن والجهات" },
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
  const [inventoryDept, setInventoryDept] = useState<string | undefined>(undefined);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, []);

  const lowCount = store.resources.filter((r) => r.qty <= r.minQty).length;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const todayMoves = store.movements.filter((m) => m.at >= todayStart).length;
  const todayReceipts = store.movements.filter((m) => m.type === "out" && m.at >= todayStart).length;
  const kb = storageKB();

  /* ---- التصدير ---- */

  const catName = (id: string) => store.categories.find((c) => c.id === id)?.name ?? "غير مصنف";

  const exportInventoryCsv = () => {
    const rows: (string | number)[][] = [
      ["الرمز", "الاسم", "القسم", "الكمية", "الحد الأدنى", "الوحدة", "سعر الوحدة", "القيمة الإجمالية", "الموقع"],
      ...store.resources.map((r) => [
        r.sku,
        r.name,
        catName(r.categoryId),
        r.qty,
        r.minQty,
        r.unit,
        r.price,
        r.qty * r.price,
        r.location,
      ]),
    ];
    downloadFile(`المخزون-${dateInputValue(Date.now())}.csv`, toCsv(rows), "text/csv");
    notify("success", `صُدّر ${fmt(store.resources.length)} صنفًا إلى ملف CSV`);
    setExportOpen(false);
  };

  const exportFullJson = () => {
    downloadFile(
      `نسخة-المستودع-${dateInputValue(Date.now())}.json`,
      JSON.stringify(
        { exportedAt: new Date().toISOString(), ...store },
        null,
        2
      ),
      "application/json"
    );
    notify("success", "حُفظت نسخة احتياطية كاملة (JSON)");
    setExportOpen(false);
  };

  const exportTodayReceipts = () => {
    const list = store.movements.filter((m) => m.type === "out" && m.at >= todayStart);
    const rows: (string | number)[][] = [
      ["رقم الوصلة", "الصنف", "الكمية", "الجهة المستفيدة", "الوقت", "ملاحظة"],
      ...list.map((m) => [
        receiptNo(m.receiptSeq ?? 0),
        m.name,
        m.qty,
        m.beneficiary ?? "",
        new Intl.DateTimeFormat("ar-EG-u-nu-latn", { hour: "2-digit", minute: "2-digit" }).format(m.at),
        m.note ?? "",
      ]),
    ];
    downloadFile(`وصولات-اليوم-${dateInputValue(Date.now())}.csv`, toCsv(rows), "text/csv");
    notify(
      list.length ? "success" : "info",
      list.length ? `صُدّرت ${fmt(list.length)} وصولة بتاريخ اليوم` : "لا وصولات بتاريخ اليوم لتصديرها"
    );
    setExportOpen(false);
  };

  /* ---- المعالجات ---- */

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
      notify("success", `أُضيف «${data.name}» إلى «${catName(data.categoryId)}»`);
    }
    setModal(null);
  };

  const confirmMove = (
    type: MovementType,
    qty: number,
    note: string,
    beneficiary: string,
    resourceId?: string
  ) => {
    if (modal?.kind !== "move") return;
    const res = modal.resource ?? store.resources.find((r) => r.id === resourceId);
    if (!res) return;
    const ok = store.move(res, type, qty, note, beneficiary);
    if (ok) {
      notify(
        type === "in" ? "success" : "info",
        type === "in"
          ? `أُودعت ${fmt(qty)} وحدة في «${res.name}»`
          : `أُصدرت وصولة بصرف ${fmt(qty)} وحدة من «${res.name}»`
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

  const saveDepartment = (name: string, color: string): boolean => {
    const cat = store.addCategory(name, color);
    notify("success", `أُنشئ قسم «${cat.name}» — أضف أصنافه من شاشة المخزون`);
    setModal(null);
    return true;
  };

  const handleImport = (rows: Parameters<typeof store.importResources>[0], categoryId: string) => {
    const n = store.importResources(rows, categoryId);
    notify("success", `استُورد ${fmt(n)} صنفًا إلى «${catName(categoryId)}»`);
    setModal(null);
  };

  const browseDept = (categoryId: string) => {
    setInventoryDept(categoryId);
    setView("inventory");
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
        receiptsToday={todayReceipts}
        deptCount={store.categories.length}
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

          {/* لوحة التحكم العلوية للعمليات */}
          <div className="flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-6">
            <div className="relative shrink-0" ref={exportRef}>
              <button
                onClick={() => setExportOpen((o) => !o)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-colors ${
                  exportOpen
                    ? "border-saffron/60 bg-saffron/10 text-saffron"
                    : "border-line bg-surface text-mist hover:border-saffron/50 hover:text-saffron"
                }`}
              >
                <DownloadIcon className="size-4" />
                تصدير البيانات
                <ChevronDownIcon className={`size-3.5 transition-transform ${exportOpen ? "rotate-180" : ""}`} />
              </button>
              {exportOpen && (
                <div className="panel absolute right-0 top-[calc(100%+6px)] z-40 w-60 overflow-hidden animate-pop">
                  <button
                    onClick={exportInventoryCsv}
                    className="flex w-full items-center gap-2.5 px-4 py-3 text-start text-[12.5px] font-bold text-fog transition-colors hover:bg-raised"
                  >
                    <FileTextIcon className="size-4 text-mint" />
                    <span>
                      المخزون (CSV)
                      <span className="block text-[10px] font-semibold text-dim">
                        {fmt(store.resources.length)} صنفًا مع القيم
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={exportTodayReceipts}
                    className="flex w-full items-center gap-2.5 border-t border-linesoft px-4 py-3 text-start text-[12.5px] font-bold text-fog transition-colors hover:bg-raised"
                  >
                    <ReceiptIcon className="size-4 text-saffron" />
                    <span>
                      وصولات اليوم (CSV)
                      <span className="block text-[10px] font-semibold text-dim">
                        {fmt(todayReceipts)} وصولة بتاريخ اليوم
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={exportFullJson}
                    className="flex w-full items-center gap-2.5 border-t border-linesoft px-4 py-3 text-start text-[12.5px] font-bold text-fog transition-colors hover:bg-raised"
                  >
                    <DownloadIcon className="size-4 text-sky" />
                    <span>
                      نسخة احتياطية كاملة (JSON)
                      <span className="block text-[10px] font-semibold text-dim">كل البيانات للحفظ خارج النظام</span>
                    </span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setModal({ kind: "import" })}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] font-bold text-mist transition-colors hover:border-mint/60 hover:text-mint"
            >
              <UploadIcon className="size-4" />
              استيراد البيانات
            </button>

            <button
              onClick={() => setView("receipts")}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-colors ${
                view === "receipts"
                  ? "border-coral/60 bg-coral/10 text-coral"
                  : "border-line bg-surface text-mist hover:border-coral/50 hover:text-coral"
              }`}
            >
              <ReceiptIcon className="size-4" />
              وصولات اليوم
              <span className="rounded-md bg-coral/15 px-1.5 py-0.5 text-[10.5px] font-extrabold tabular-nums text-coral">
                {fmt(todayReceipts)}
              </span>
            </button>

            <button
              onClick={() => setView("departments")}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-colors ${
                view === "departments"
                  ? "border-lilac/60 bg-lilac/10 text-lilac"
                  : "border-line bg-surface text-mist hover:border-lilac/50 hover:text-lilac"
              }`}
            >
              <BuildingIcon className="size-4" />
              المصالح
              <span className="rounded-md bg-lilac/15 px-1.5 py-0.5 text-[10.5px] font-extrabold tabular-nums text-lilac">
                {fmt(store.categories.length)}
              </span>
            </button>

            <button
              onClick={() => setModal({ kind: "department" })}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-line px-3 py-2 text-[12px] font-bold text-dim transition-colors hover:border-saffron/60 hover:text-saffron"
            >
              <PlusIcon className="size-3.5" />
              قسم جديد
            </button>
          </div>

          <MobileNav view={view} setView={setView} />
        </header>

        {/* المحتوى */}
        <div key={view} className="mx-auto max-w-[1240px] px-4 py-5 sm:px-6">
          {view === "dashboard" && (
            <Dashboard
              resources={store.resources}
              movements={store.movements}
              categories={store.categories}
              onMove={openMove}
              onAdd={() => setModal({ kind: "resource" })}
              goInventory={() => setView("inventory")}
              goMovements={() => setView("movements")}
            />
          )}
          {view === "inventory" && (
            <Inventory
              key={inventoryDept ?? "all"}
              resources={store.resources}
              categories={store.categories}
              initialDept={inventoryDept}
              onMove={openMove}
              onEdit={(r) => setModal({ kind: "resource", resource: r })}
              onDelete={(r) => setModal({ kind: "delete", resource: r })}
              onAdd={() => setModal({ kind: "resource" })}
            />
          )}
          {view === "movements" && (
            <Movements
              movements={store.movements}
              resources={store.resources}
              categories={store.categories}
            />
          )}
          {view === "receipts" && (
            <Receipts
              movements={store.movements}
              resources={store.resources}
              categories={store.categories}
              onNewReceipt={() => setModal({ kind: "move", type: "out", pick: true })}
            />
          )}
          {view === "departments" && (
            <Departments
              categories={store.categories}
              resources={store.resources}
              onAdd={() => setModal({ kind: "department" })}
              onDelete={(cat) => {
                store.removeCategory(cat.id);
                notify("error", `حُذف قسم «${cat.name}»`);
              }}
              onBrowse={browseDept}
            />
          )}

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-linesoft pt-4 text-[11px] text-dim">
            <span>المُستودَع · بياناتك محفوظة محليًا في متصفحك ({kb} ك.ب)</span>
            <span className="tabular-nums">
              {fmt(store.resources.length)} صنف · {fmt(store.categories.length)} قسم ·{" "}
              {fmt(store.movements.length)} حركة مسجّلة
            </span>
          </footer>
        </div>
      </main>

      {/* النوافذ */}
      {modal?.kind === "resource" && (
        <ResourceModal
          resource={modal.resource}
          categories={store.categories}
          onSave={saveResource}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "move" && (
        <MovementModal
          resource={
            modal.resource
              ? store.resources.find((r) => r.id === modal.resource!.id) ?? modal.resource
              : undefined
          }
          resources={modal.pick ? store.resources : undefined}
          categories={store.categories}
          initialType={modal.type}
          onMove={confirmMove}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "delete" && (
        <DeleteModal resource={modal.resource} onConfirm={confirmDelete} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "department" && (
        <DepartmentModal
          existing={store.categories}
          onSave={saveDepartment}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "import" && (
        <ImportModal
          categories={store.categories}
          onImport={handleImport}
          onClose={() => setModal(null)}
        />
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
