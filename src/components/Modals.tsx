import { useMemo, useState } from "react";
import type { MovementType, Resource } from "../types";
import { CATEGORIES, catById } from "../data";
import { fmt } from "../lib/format";
import { Field, Modal, useToast } from "./ui";
import { ArrowInIcon, ArrowOutIcon, MinusIcon, PlusIcon, TrashIcon } from "./icons";

const SKU_PREFIX: Record<string, string> = {
  elec: "ELC",
  furn: "FRN",
  stat: "STA",
  tool: "TLS",
  net: "NET",
};

const genSku = (catId: string) =>
  `${SKU_PREFIX[catId] ?? "ITM"}-${String(Math.floor(1000 + Math.random() * 9000))}`;

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ---------------- نموذج الصنف ---------------- */

export function ResourceModal({
  resource,
  onSave,
  onClose,
}: {
  resource?: Resource;
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
  const editing = Boolean(resource);
  const [name, setName] = useState(resource?.name ?? "");
  const [sku, setSku] = useState(resource?.sku ?? "");
  const [categoryId, setCategoryId] = useState(resource?.categoryId ?? "elec");
  const [qty, setQty] = useState(String(resource?.qty ?? 0));
  const [minQty, setMinQty] = useState(String(resource?.minQty ?? 5));
  const [unit, setUnit] = useState(resource?.unit ?? "قطعة");
  const [price, setPrice] = useState(String(resource?.price ?? 0));
  const [location, setLocation] = useState(resource?.location ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shakeKey, setShakeKey] = useState(0);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "اسم الصنف مطلوب";
    if (num(qty) < 0) errs.qty = "الكمية لا يمكن أن تكون سالبة";
    if (num(minQty) < 0) errs.minQty = "الحد الأدنى لا يمكن أن يكون سالبًا";
    if (num(price) < 0) errs.price = "السعر لا يمكن أن يكون سالبًا";
    if (!location.trim()) errs.location = "حدّد موقع التخزين (مثل A-01)";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setShakeKey((k) => k + 1);
      return;
    }
    onSave({
      name: name.trim(),
      sku: sku.trim() || genSku(categoryId),
      categoryId,
      qty: Math.round(num(qty)),
      minQty: Math.round(num(minQty)),
      unit: unit.trim() || "قطعة",
      price: num(price),
      location: location.trim().toUpperCase(),
    });
  };

  return (
    <Modal
      title={editing ? "تعديل الصنف" : "صنف جديد"}
      subtitle={editing ? resource!.name : "أضف موردًا جديدًا إلى المستودع"}
      onClose={onClose}
    >
      <div key={shakeKey} className={shakeKey > 0 ? "animate-shake" : ""}>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="اسم الصنف *" error={errors.name} className="col-span-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: لابتوب Dell Latitude"
              className={`field ${errors.name ? "field-error" : ""}`}
            />
          </Field>

          <Field label="الفئة">
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="field">
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="الوحدة">
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="قطعة / كرتون…" className="field" />
          </Field>

          <Field label={editing ? "الكمية الحالية" : "الكمية الافتتاحية"} error={errors.qty}>
            <input
              type="number"
              min={0}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={`field tabular-nums ${errors.qty ? "field-error" : ""}`}
            />
          </Field>

          <Field label="الحد الأدنى للتنبيه" error={errors.minQty}>
            <input
              type="number"
              min={0}
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
              className={`field tabular-nums ${errors.minQty ? "field-error" : ""}`}
            />
          </Field>

          <Field label="سعر الوحدة (ر.س)" error={errors.price}>
            <input
              type="number"
              min={0}
              step="0.5"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`field tabular-nums ${errors.price ? "field-error" : ""}`}
            />
          </Field>

          <Field label="موقع التخزين *" error={errors.location}>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="A-01"
              dir="ltr"
              className={`field text-end ${errors.location ? "field-error" : ""}`}
            />
          </Field>

          <Field label="رمز الصنف SKU" className="col-span-2">
            <div className="flex gap-2">
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="يُولَّد تلقائيًا إن تُرك فارغًا"
                dir="ltr"
                className="field flex-1 text-end"
              />
              <button
                type="button"
                onClick={() => setSku(genSku(categoryId))}
                className="shrink-0 rounded-xl border border-line px-3.5 text-[11.5px] font-bold text-mist transition-colors hover:border-saffron/40 hover:text-saffron"
              >
                توليد
              </button>
            </div>
          </Field>
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={submit}
            className="flex-1 rounded-xl bg-saffron py-2.5 text-sm font-extrabold text-ink shadow-lg shadow-saffron/20 transition-all hover:-translate-y-0.5 hover:bg-[#f7b455] active:translate-y-0"
          >
            {editing ? "حفظ التعديلات" : "إضافة إلى المستودع"}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-line px-5 py-2.5 text-sm font-bold text-mist transition-colors hover:border-coral/40 hover:text-coral"
          >
            إلغاء
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- حركة إيداع / سحب ---------------- */

export function MovementModal({
  resource,
  initialType,
  onMove,
  onClose,
}: {
  resource: Resource;
  initialType: MovementType;
  onMove: (type: MovementType, qty: number, note: string) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<MovementType>(initialType);
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const cat = catById(resource.categoryId);

  const after = useMemo(
    () => (type === "in" ? resource.qty + qty : resource.qty - qty),
    [type, qty, resource.qty]
  );

  const setQ = (n: number) => {
    setError("");
    setQty(Math.max(1, Math.round(n)));
  };

  const submit = () => {
    if (type === "out" && qty > resource.qty) {
      setError(`المتوفر ${resource.qty} فقط — لا يمكن سحب ${qty}`);
      setShakeKey((k) => k + 1);
      return;
    }
    onMove(type, qty, note);
  };

  return (
    <Modal title="حركة مخزون" subtitle={`${resource.name} · المتوفر حاليًا ${fmt(resource.qty)} ${resource.unit}`} onClose={onClose}>
      <div key={shakeKey} className={shakeKey > 0 ? "animate-shake" : ""}>
        {/* نوع الحركة */}
        <div className="grid grid-cols-2 gap-2.5">
          {(
            [
              { t: "in" as const, label: "إيداع (وارد)", icon: ArrowInIcon, color: "#3fd68f" },
              { t: "out" as const, label: "سحب (صادر)", icon: ArrowOutIcon, color: "#f0684f" },
            ]
          ).map(({ t, label, icon: Icon, color }) => (
            <button
              key={t}
              onClick={() => {
                setType(t);
                setError("");
              }}
              className="flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-extrabold transition-all"
              style={{
                color,
                borderColor: type === t ? `${color}66` : "var(--color-line)",
                background: type === t ? `${color}14` : "var(--color-raised)",
                transform: type === t ? "scale(1.02)" : undefined,
              }}
            >
              <Icon className="size-4.5" />
              {label}
            </button>
          ))}
        </div>

        {/* الكمية */}
        <div className="mt-4">
          <span className="mb-1.5 block text-xs font-semibold text-mist">الكمية ({resource.unit})</span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setQ(qty - 1)}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-mist transition-all hover:scale-105 hover:border-saffron/40 hover:text-saffron active:scale-95"
            >
              <MinusIcon className="size-4" />
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQ(Number(e.target.value) || 1)}
              className={`field text-center font-display text-2xl font-extrabold tabular-nums ${error ? "field-error" : ""}`}
            />
            <button
              onClick={() => setQ(qty + 1)}
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-mist transition-all hover:scale-105 hover:border-saffron/40 hover:text-saffron active:scale-95"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[5, 10, 25].map((n) => (
              <button
                key={n}
                onClick={() => setQ(n)}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold tabular-nums transition-colors ${
                  qty === n
                    ? "border-saffron/50 bg-saffron/15 text-saffron"
                    : "border-line text-dim hover:text-mist"
                }`}
              >
                {n}
              </button>
            ))}
            {type === "out" && resource.qty > 0 && (
              <button
                onClick={() => setQ(resource.qty)}
                className={`rounded-full border px-3 py-1 text-[11px] font-bold tabular-nums transition-colors ${
                  qty === resource.qty
                    ? "border-coral/50 bg-coral/15 text-coral"
                    : "border-line text-dim hover:text-mist"
                }`}
              >
                الكل ({resource.qty})
              </button>
            )}
          </div>
          {error && <p className="mt-2 text-[11.5px] font-bold text-coral">{error}</p>}
        </div>

        {/* معاينة */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-raised px-4 py-3">
          <span className="text-[11.5px] font-semibold text-mist">الرصيد بعد الحركة</span>
          <span
            className="font-display text-xl font-extrabold tabular-nums transition-colors"
            style={{ color: after <= resource.minQty ? (after === 0 ? "#f0684f" : "#f0a63c") : "#3fd68f" }}
          >
            {fmt(after)} {resource.unit}
          </span>
        </div>

        <div className="mt-3.5">
          <Field label="ملاحظة (اختياري)">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={type === "in" ? "مثال: توريد من مؤسسة الأفق" : "مثال: طلب قسم تقنية المعلومات"}
              className="field"
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>
        </div>

        <button
          onClick={submit}
          className="mt-5 w-full rounded-xl py-3 text-sm font-extrabold text-ink shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
          style={{
            background: type === "in" ? "#3fd68f" : "#f0684f",
            boxShadow: `0 10px 24px -8px ${type === "in" ? "#3fd68f55" : "#f0684f55"}`,
          }}
        >
          تأكيد {type === "in" ? "الإيداع" : "السحب"} — {fmt(qty)} {resource.unit}
        </button>

        <p className="mt-3 text-center text-[10.5px] text-dim">
          {cat.name} · موقع <span dir="ltr">{resource.location}</span> · رمز{" "}
          <span dir="ltr">{resource.sku}</span>
        </p>
      </div>
    </Modal>
  );
}

/* ---------------- تأكيد الحذف ---------------- */

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
    <Modal title="حذف صنف" subtitle="لا يمكن التراجع عن هذا الإجراء" onClose={onClose} width="max-w-md">
      <div className="flex items-start gap-3.5 rounded-xl border border-coral/30 bg-coral/[0.08] p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-coral/15 text-coral">
          <TrashIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-fog">
            سيُحذف «{resource.name}» نهائيًا من المستودع.
          </p>
          <p className="mt-1 text-[12px] leading-5 text-mist">
            الكمية الحالية <b className="tabular-nums text-coral">{fmt(resource.qty)} {resource.unit}</b>{" "}
            بقيمة <b className="tabular-nums text-coral">{fmt(resource.qty * resource.price)} ر.س</b>.
            ستبقى حركاته السابقة في السجل.
          </p>
        </div>
      </div>
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onConfirm}
          className="flex-1 rounded-xl bg-coral py-2.5 text-sm font-extrabold text-ink shadow-lg shadow-coral/25 transition-all hover:-translate-y-0.5 hover:bg-[#f57d67] active:translate-y-0"
        >
          نعم، احذف الصنف
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border border-line px-5 py-2.5 text-sm font-bold text-mist transition-colors hover:text-fog"
        >
          تراجع
        </button>
      </div>
    </Modal>
  );
}
