export type MovementType = "in" | "out";

export interface Category {
  id: string;
  name: string;
  color: string;
  skuPrefix: string;
}

export interface Resource {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  qty: number;
  minQty: number;
  unit: string;
  price: number;
  location: string;
  createdAt: number;
  updatedAt: number;
}

export interface Movement {
  id: string;
  resourceId: string;
  name: string;
  type: MovementType;
  qty: number;
  note?: string;
  beneficiary?: string;
  receiptSeq?: number;
  at: number;
}

export type View = "dashboard" | "inventory" | "movements" | "receipts" | "departments";

export type StockStatus = "ok" | "low" | "out";

export type ModalState =
  | { kind: "resource"; resource?: Resource }
  | { kind: "move"; resource?: Resource; type: MovementType; pick?: boolean }
  | { kind: "delete"; resource: Resource }
  | { kind: "department" }
  | { kind: "import" }
  | null;

export interface ImportRow {
  name: string;
  qty: number;
  unit: string;
  price: number;
}
