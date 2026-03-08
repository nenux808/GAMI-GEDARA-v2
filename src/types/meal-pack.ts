export type MealPackMenu = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  week_of: string;
  available_from: string;
  order_cutoff_at: string;
  pickup_date: string | null;
  is_active: boolean;
};

export type MealPackOption = {
  id: string;
  meal_pack_menu_id: string;
  name: string;
  description: string | null;
  category: string | null;
  sort_order: number;
  price: number;
  is_active: boolean;
};