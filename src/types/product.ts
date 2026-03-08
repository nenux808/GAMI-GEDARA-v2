export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string | null;
  spice_level: string | null;
  serves: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};