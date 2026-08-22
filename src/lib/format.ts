import type { ImportRow } from "../types";

export const fmt = (n: number): string => Math.round(n).toLocaleString("en-US");

export const money = (n: number): string => `${fmt(n)} ر.س`;

export const receiptNo = (seq: number): string => `خ-${String(seq).padStart(4, "0")}`;

export function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "قبل لحظات";
  if (m === 1) return "قبل دقيقة";
  if (m === 2) return "قبل دقيقتين";
  if (m <= 10) return `قبل ${m} دقائق`;
  if (m < 60) return `قبل ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h === 1) return "قبل ساعة";
  if (h === 2) return "قبل ساعتين";
  if (h <= 10) return `قبل ${h} ساعات`;
  if (h < 24) return `قبل ${h} ساعة`;
  const d = Math.floor(h / 24);
  if (d === 1) return "أمس";
  if (d === 2) return "قبل يومين";
  if (d <= 10) return `قبل ${d} أيام`;
  return `قبل ${d} يومًا`;
}

export function clockTime(ts: number): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts);
}

export function dayLabel(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "اليوم";
  if (d.toDateString() === yesterday.toDateString()) return "أمس";
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

export function fullDate(ts: number): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ts);
}

export function dateInputValue(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const uid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

/* ---------- تصدير / استيراد ---------- */

export function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

const esc = (v: string | number): string => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows: (string | number)[][]): string =>
  "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n");

export function parseItemsCsv(text: string): { items: ImportRow[]; bad: number } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const items: ImportRow[] = [];
  let bad = 0;
  lines.forEach((line, i) => {
    const f = line.split(/[,،;؛]/).map((x) => x.trim().replace(/^"|"$/g, ""));
    if (i === 0 && /اسم|الكمية|unit|name/i.test(f[0])) return; // رأس الجدول
    const name = f[0] ?? "";
    const qty = Number(f[1]?.replace(/[^\d.]/g, ""));
    if (name.length < 2 || !Number.isFinite(qty) || qty < 0) {
      bad++;
      return;
    }
    items.push({
      name,
      qty,
      unit: f[2] || "قطعة",
      price: Number(f[3]?.replace(/[^\d.]/g, "")) || 0,
    });
  });
  return { items, bad };
}

export const IMPORT_TEMPLATE = [
  "الاسم,الكمية,الوحدة,السعر",
  "قلم جاف أزرق,48,علبة,14",
  "ورق طباعة A4,25,رزمة,18",
  "منظف أرضيات,12,جالون,22",
].join("\n");
