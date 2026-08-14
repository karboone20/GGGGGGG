export type MovementType = "in" | "out";

export interface Category {
  id: string;
  name: string;
  color: string;
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
  at: number;
}

export type View = "dashboard" | "inventory" | "movements";

export type StockStatus = "ok" | "low" | "out";

export type ModalState =
  | { kind: "resource"; resource?: Resource }
  | { kind: "move"; resource: Resource; type: MovementType }
  | { kind: "delete"; resource: Resource }
  | null;
