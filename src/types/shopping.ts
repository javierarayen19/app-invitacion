export const SHOPPING_CATEGORIES = [
  "Comida Fuerte",
  "Comida para Picar",
  "Dulces y Torta",
  "Decoracion",
  "Mesa y Servicio",
  "Liquidos",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

export const BUDGET_TOTAL = 350000;

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: ShoppingCategory;
  bought: boolean;
  responsible: string;
  urgent: boolean;
  link: string;
  createdAt: string;
}
