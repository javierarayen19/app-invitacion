export const SHOPPING_CATEGORIES = [
  "Comida Fuerte",
  "Comida para Picar",
  "Decoracion",
  "Mesa y Servicio",
  "Liquidos",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category: ShoppingCategory;
  bought: boolean;
  createdAt: string;
}
