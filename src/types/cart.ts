export type CartItem = {
  id: string;
  type: "regular" | "meal_pack";
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image_url?: string | null;
  selections?: string[];
  meal_pack_menu_id?: string;
};