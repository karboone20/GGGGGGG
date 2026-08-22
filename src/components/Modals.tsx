import { useMemo, useRef, useState } from "react";
import type { Category, ImportRow, MovementType, Resource } from "../types";
import { BENEFICIARIES, DEPT_PALETTE, UNITS, statusOf } from "../data";
import {
  IMPORT_TEMPLATE,
  dateInputValue,
  downloadFile,
  fmt,
  money,
  parseItemsCsv,
} from "../lib/format";
import { Field, Modal, useToast } from "./ui";
import {
  AlertIcon,
  ArrowInIcon,
  ArrowOutIcon,
  CheckIcon,
  DownloadIcon,
  FileTextIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
  UploadIcon,
} from "./icons";

const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

/* ================= إضافة / تعديل مورد ================= */

export function ResourceModal({
  resource,
  categories,
  onSave,
  onClose,
}: {
  resource?: Resource;
  categories: Category[];
  onSave: (data: {
    name: string;
    sku: string;
    categoryId: string;
    qty: number;
    minQty: number;
    unit: string;
    price: number;
    location: string;
  }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(resource?.name ?? "");
  const [categoryId, setCategoryId] = useState(resource?.categoryId ?? categories[0]?.id ?? "");
  const [sku, setSku] = useState(resource?.sku ?? "");
  const [qty, setQty] = useState(resource ? String(resource.qty) : "0");
  const [minQty, setMinQty] = useState(resource ? String(resource.minQty) : "5");
  const [unit, setUnit] = useState(resource?.unit ?? "قطعة");
  const [price, setPrice] = useState(resource ? String(resource.price) : "10");
  const [location, setLocation] = useState(resource?.location ?? "منطقة A · رف 1");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(0);

  const submit = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "أدخل اسمًا واضحًا للصنف";
    const q = num(qty);
    const m = num(minQty);
    const p = num(price);
    if (!Number.isFinite(q) || q < 0) e.qty = "الكمية يجب أن تكون رقمًا موجبًا";
    if (!Number.isFinite(m) || m < 0) e.min = "حد غير صالح";
    if (!Number.isFinite(p) || p < 0) e.price = "سعر غير صالح";
    if (!categoryId) e.cat = "اختر القسم";
    setErrors(e);
    if (Object.keys(e).length) {
      setShake((s) => s + 1);
      return;
    }
    onSave({
      name: name.trim(),
      sku: sku.trim() || `${categories.find((c) => c.id === categoryId)?.skuPrefix ?? "IT"}-${Date.now()
        .toString()
        .slice(-4)}`,
      categoryId,
      qty: q,
      minQty: m,
      unit,
      price: p,
      location: location.trim() || "غير محدد",
    });
  };

  return (
    <Modal
      title={resource ? "تعديل مورد" : "إضافة مورد جديد"}
      subtitle={resource ? `الرمز الحالي: ${resource.sku}` : "أدخل بيانات الصنف ليُضاف إلى المخزون"}
      onClose={onClose}
    >
      <div key={shake} className={shake ? "animate-shake" : ""}>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="اسم المورد *" error={errors.name} className="col-span-2">
            <input
              className={`field ${errors.name ? "field-error" : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: ورق طباعة A4 — 80 غرام"
              autoFocus
            />
          </Field>
          <Field label="القسم / المصلحة *" error={errors.cat}>
            <select
              className="field"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="رمز الصنف (SKU)">
            <input
              className="field"
              dir="ltr"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="يُولَّد تلقائيًا إن تُرك فارغًا"
            />
          </Field>
          <Field label="الكمية الحالية *" error={errors.qty}>
            <input
              className={`field ${errors.qty ? "field-error" : ""}`}
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </Field>
          <Field label="الحد الأدنى للتنبيه *" error={errors.min}>
            <input
              className={`field ${errors.min ? "field-error" : ""}`}
              type="number"
              min={0}
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
            />
          </Field>
          <Field label="وحدة القياس">
            <select className="field" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </Field>
          <Field label="سعر الوحدة (ر.س) *" error={errors.price}>
            <input
              className={`field ${errors.price ? "field-error" : ""}`}
              type="number"
              min={0}
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </Field>
          <Field label="موقع التخزين" className="col-span-2">
            <input
              className="field"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثال: منطقة B · رف 3"
            />
          </Field>
        </div>
        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-mist transition-colors hover:border-line/80 hover:text-fog"
          >
            إلغاء
          </button>
          <button
            onClick={submit}
            className="flex items-center gap-2 rounded-xl bg-saffron px-5 py-2.5 text-sm font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#f7b455] active:translate-y-0"
          >
            <CheckIcon className="size-4" strokeWidth={2.4} />
            {resource ? "حفظ التعديلات" : "إضافة المورد"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ================= حركة مخزون (إيداع / صرف) ================= */

export function MovementModal({
  resource,
  resources,
  categories,
  initialType,
  onMove,
  onClose,
}: {
  resource?: Resource;
  resources?: Resource[];
  categories: Category[];
  initialType: MovementType;
  onMove: (type: MovementType, qty: number, note: string, beneficiary: string, resourceId?: string) => void;
  onClose: () => void;
}) {
  const pickMode = !resource;
  const [type, setType] = useState<MovementType>(initialType);
  const [pickedId, setPickedId] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(0);

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const target = resource ?? resources?.find((r) => r.id === pickedId);
  const cat = target ? catById.get(target.categoryId) : undefined;
  const newQty = target ? (type === "in" ? target.qty + qty : target.qty - qty) : 0;
  const overflow = target ? type === "out" && qty > target.qty : false;

  const confirm = () => {
    if (!target) {
      setErr("اختر الصنف أولًا");
      setShake((s) => s + 1);
      return;
    }
    if (qty <= 0) {
      setErr("الكمية يجب أن تكون أكبر من صفر");
      setShake((s) => s + 1);
      return;
    }
    if (overflow) {
      setErr(`المتوفر ${fmt(target.qty)} فقط — لا يمكن صرف أكثر`);
      setShake((s) => s + 1);
      return;
    }
    onMove(type, qty, note, beneficiary, pickedId || undefined);
  };

  return (
    <Modal
      title={pickMode ? "تسجيل وصولة صرف" : "حركة مخزون"}
      subtitle={pickMode ? "اختر الصنف وحدّد الكمية والجهة المستفيدة" : target?.name}
      onClose={onClose}
      width="max-w-md"
    >
      <div key={shake} className={shake ? "animate-shake" : ""}>
        {pickMode && resources && (
          <Field label="الصنف *" className="mb-3.5">
            <select
              className={`field ${err && !target ? "field-error" : ""}`}
              value={pickedId}
              onChange={(e) => {
                setPickedId(e.target.value);
                setErr("");
              }}
            >
              <option value="">— اختر صنفًا من المخزون —</option>
              {resources.map((r) => {
                const c = catById.get(r.categoryId);
                return (
                  <option key={r.id} value={r.id} disabled={r.qty === 0 && type === "out"}>
                    {r.name} · {c?.name ?? ""} · متوفر {fmt(r.qty)} {r.unit}
                  </option>
                );
              })}
            </select>
          </Field>
        )}

        {target && (
          <div className="mb-3.5 flex items-center justify-between rounded-xl border border-line bg-raised px-3.5 py-2.5 text-[12px]">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: cat?.color ?? "#64806f" }}
              />
              <span className="font-bold text-mist">{cat?.name}</span>
            </span>
            <span className="tabular-nums text-mist">
              المتوفر: <b className="text-fog">{fmt(target.qty)}</b> {target.unit}
            </span>
          </div>
        )}

        {/* نوع الحركة */}
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { v: "in", label: "إيداع وارد", icon: <ArrowInIcon className="size-4" />, color: "#3fd68f" },
              { v: "out", label: "صرف صادر", icon: <ArrowOutIcon className="size-4" />, color: "#f0684f" },
            ] as const
          ).map((t) => {
            const active = type === t.v;
            return (
              <button
                key={t.v}
                onClick={() => {
                  setType(t.v);
                  setErr("");
                }}
                className="flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-extrabold transition-all"
                style={{
                  borderColor: active ? t.color : "var(--color-line)",
                  color: active ? t.color : "var(--color-mist)",
                  background: active ? `${t.color}14` : "transparent",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* الكمية */}
        <div className="mt-3.5">
          <span className="mb-1.5 block text-xs font-semibold text-mist">الكمية *</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-mist transition-colors hover:border-saffron/60 hover:text-saffron"
              aria-label="إنقاص"
            >
              <MinusIcon className="size-4" />
            </button>
            <input
              type="number"
              min={1}
              value={Number.isFinite(qty) ? qty : ""}
              onChange={(e) => setQty(e.target.value === "" ? NaN : Math.max(0, Number(e.target.value)))}
              className="field text-center font-display text-xl font-extrabold tabular-nums"
            />
            <button
              onClick={() => setQty((q) => (Number.isFinite(q) ? q + 1 : 1))}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-mist transition-colors hover:border-saffron/60 hover:text-saffron"
              aria-label="زيادة"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[5, 10, 25, 50].map((n) => (
              <button
                key={n}
                onClick={() => setQty(n)}
                className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold tabular-nums transition-colors ${
                  qty === n
                    ? "border-saffron/60 bg-saffron/15 text-saffron"
                    : "border-line text-dim hover:text-mist"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {type === "out" && (
          <Field label="الجهة المستفيدة" className="mt-3.5">
            <input
              className="field"
              list="beneficiaries-list"
              value={beneficiary}
              onChange={(e) => setBeneficiary(e.target.value)}
              placeholder="مثال: مصلحة الشؤون الإدارية"
            />
            <datalist id="beneficiaries-list">
              {BENEFICIARIES.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </Field>
        )}

        <Field label="ملاحظة (اختياري)" className="mt-3.5">
          <input
            className="field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={type === "in" ? "مثال: توريد من المزوّد" : "مثال: طلبية عاجلة"}
          />
        </Field>

        {target && (
          <div
            className={`mt-3.5 rounded-xl border px-3.5 py-2.5 text-[12.5px] font-bold tabular-nums ${
              overflow
                ? "border-coral/50 bg-coral/10 text-coral"
                : newQty <= target.minQty && type === "out"
                  ? "border-saffron/50 bg-saffron/10 text-saffron"
                  : "border-line bg-raised text-mist"
            }`}
          >
            {overflow
              ? `المتوفر ${fmt(target.qty)} فقط — قلّل الكمية`
              : `الرصيد بعد الحركة: ${fmt(newQty)} ${target.unit}${
                  !overflow && newQty <= target.minQty && type === "out" ? " — سينخفض تحت الحد الأدنى" : ""
                }`}
          </div>
        )}

        {err && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-bold text-coral">
            <AlertIcon className="size-3.5" />
            {err}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-mist hover:text-fog"
          >
            إلغاء
          </button>
          <button
            onClick={confirm}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-extrabold text-ink transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{ background: type === "in" ? "#3fd68f" : "#f0684f" }}
          >
            {type === "in" ? <ArrowInIcon className="size-4" /> : <ArrowOutIcon className="size-4" />}
            {type === "in" ? "تأكيد الإيداع" : pickMode ? "إصدار الوصلة" : "تأكيد الصرف"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ================= حذف مورد ================= */

export function DeleteModal({
  resource,
  onConfirm,
  onClose,
}: {
  resource: Resource;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title="حذف مورد" onClose={onClose} width="max-w-md">
      <div className="flex items-start gap-3.5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coral/15 text-coral ring-1 ring-coral/30">
          <TrashIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-fog">
            سيتم حذف <span className="text-coral">«{resource.name}»</span> نهائيًا من المستودع.
          </p>
          <p className="mt-1.5 text-[12.5px] leading-5 text-mist">
            الكمية الحالية <b className="tabular-nums text-fog">{fmt(resource.qty)}</b> {resource.unit} · قيمة
            مفقودة <b className="tabular-nums text-fog">{money(resource.qty * resource.price)}</b>. سجل الحركات
            سيبقى محفوظًا.
          </p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-mist hover:text-fog"
        >
          تراجع
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 rounded-xl bg-coral px-5 py-2.5 text-sm font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
        >
          <TrashIcon className="size-4" />
          حذف نهائي
        </button>
      </div>
    </Modal>
  );
}

/* ================= قسم جديد ================= */

export function DepartmentModal({
  existing,
  onSave,
  onClose,
}: {
  existing: Category[];
  onSave: (name: string, color: string) => boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEPT_PALETTE[4]);
  const [err, setErr] = useState("");

  const submit = () => {
    if (name.trim().length < 2) {
      setErr("أدخل اسمًا للقسم (حرفان على الأقل)");
      return;
    }
    if (existing.some((c) => c.name.trim() === name.trim())) {
      setErr("يوجد قسم بهذا الاسم بالفعل");
      return;
    }
    onSave(name, color);
  };

  return (
    <Modal title="إضافة قسم جديد" subtitle="قسّم المستودع حسب المصلحة أو نوع اللوازم" onClose={onClose} width="max-w-md">
      <Field label="اسم القسم *" error={err}>
        <input
          className={`field ${err ? "field-error" : ""}`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErr("");
          }}
          placeholder="مثال: لوازم المختبرات"
          autoFocus
        />
      </Field>

      <div className="mt-4">
        <span className="mb-2 block text-xs font-semibold text-mist">اللون المميز</span>
        <div className="flex flex-wrap gap-2">
          {DEPT_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`grid size-9 place-items-center rounded-lg transition-transform hover:scale-110 ${
                color === c ? "ring-2 ring-fog ring-offset-2 ring-offset-surface" : ""
              }`}
              style={{ background: `${c}22`, border: `1.5px solid ${c}` }}
              aria-label={c}
            >
              <span className="size-3.5 rounded-full" style={{ background: c }} />
            </button>
          ))}
        </div>
      </div>

      {/* معاينة */}
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-line bg-raised px-3.5 py-3">
        <span
          className="grid size-9 place-items-center rounded-lg font-display text-[11px] font-extrabold"
          style={{ color, background: `${color}16`, border: `1px solid ${color}40` }}
        >
          جديد
        </span>
        <div>
          <div className="font-display text-[14px] font-extrabold text-fog">
            {name.trim() || "معاينة القسم"}
          </div>
          <div className="text-[10.5px] font-semibold text-dim">
            0 صنف · سيُضاف فارغًا ويمكنك تعبئته من شاشة المخزون
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-mist hover:text-fog"
        >
          إلغاء
        </button>
        <button
          onClick={submit}
          className="flex items-center gap-2 rounded-xl bg-saffron px-5 py-2.5 text-sm font-extrabold text-ink transition-all hover:-translate-y-0.5 hover:bg-[#f7b455] active:translate-y-0"
        >
          <PlusIcon className="size-4" strokeWidth={2.4} />
          إنشاء القسم
        </button>
      </div>
    </Modal>
  );
}

/* ================= استيراد البيانات ================= */

export function ImportModal({
  categories,
  onImport,
  onClose,
}: {
  categories: Category[];
  onImport: (rows: ImportRow[], categoryId: string) => void;
  onClose: () => void;
}) {
  const notify = useToast();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parsed = useMemo(() => parseItemsCsv(text), [text]);
  const cat = categories.find((c) => c.id === categoryId);

  const onFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setText(String(reader.result ?? ""));
      setFileName(f.name);
    };
    reader.readAsText(f, "utf-8");
  };

  return (
    <Modal
      title="استيراد البيانات"
      subtitle="أدخل قائمة سلع جديدة بصيغة CSV: الاسم، الكمية، الوحدة، السعر"
      onClose={onClose}
    >
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="القسم المستهدف *">
          <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <button
            onClick={() => {
              downloadFile("نموذج-الاستيراد.csv", IMPORT_TEMPLATE, "text/csv");
              notify("info", "نُزّل نموذج CSV جاهز للتعبئة");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[12.5px] font-bold text-mist transition-colors hover:border-saffron/50 hover:text-saffron"
          >
            <FileTextIcon className="size-4" />
            تحميل نموذج CSV
          </button>
        </div>
      </div>

      <div className="mt-3.5">
        <button
          onClick={() => fileRef.current?.click()}
          className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed border-line bg-raised/50 px-4 py-4 text-[13px] font-bold text-mist transition-colors hover:border-saffron/60 hover:text-saffron"
        >
          <UploadIcon className="size-5 transition-transform group-hover:-translate-y-0.5" />
          {fileName ? `اختير الملف: ${fileName}` : "اختر ملف CSV من جهازك"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,text/csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      <Field label="أو الصق الصفوف هنا" className="mt-3.5">
        <textarea
          className="field min-h-[110px] resize-y leading-6"
          dir="auto"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setFileName("");
          }}
          placeholder={"قلم جاف أزرق,48,علبة,14\nورق طباعة A4,25,رزمة,18"}
        />
      </Field>

      {/* معاينة */}
      {text.trim() && (
        <div className="mt-3.5 rounded-xl border border-line bg-ink/40 p-3.5 animate-fadein">
          <div className="flex items-center justify-between text-[12px] font-bold">
            <span className="flex items-center gap-1.5 text-mint">
              <CheckIcon className="size-3.5" />
              {fmt(parsed.items.length)} صف صالح
            </span>
            {parsed.bad > 0 && (
              <span className="flex items-center gap-1.5 text-coral">
                <AlertIcon className="size-3.5" />
                {fmt(parsed.bad)} صف سيتجاهل
              </span>
            )}
          </div>
          {parsed.items.length > 0 && (
            <div className="mt-2.5 flex flex-col gap-1">
              {parsed.items.slice(0, 4).map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg bg-raised px-3 py-1.5 text-[11.5px]"
                >
                  <span className="font-bold text-fog">{r.name}</span>
                  <span className="tabular-nums text-mist">
                    {fmt(r.qty)} {r.unit} · {money(r.price)}
                  </span>
                </div>
              ))}
              {parsed.items.length > 4 && (
                <span className="text-[10.5px] font-semibold text-dim">
                  + {fmt(parsed.items.length - 4)} أصناف أخرى…
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2.5">
        <button
          onClick={onClose}
          className="rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-mist hover:text-fog"
        >
          إلغاء
        </button>
        <button
          disabled={parsed.items.length === 0}
          onClick={() => onImport(parsed.items, categoryId)}
          className="flex items-center gap-2 rounded-xl bg-mint px-5 py-2.5 text-sm font-extrabold text-ink transition-all enabled:hover:-translate-y-0.5 enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <DownloadIcon className="size-4" />
          استيراد {parsed.items.length > 0 ? fmt(parsed.items.length) : ""} صنفًا
          {cat ? ` إلى «${cat.name}»` : ""}
        </button>
      </div>

      <p className="mt-3 text-[10.5px] leading-5 text-dim">
        تُقبل الفاصلة اللاتينية أو العربية فاصلًا بين الأعمدة. الوحدة والسعر اختياريان (قطعة / 0).
      </p>
      <span className="hidden">{dateInputValue(Date.now())}</span>
    </Modal>
  );
}
