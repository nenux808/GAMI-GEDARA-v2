export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  currency: string;
  payment_status: "pending" | "paid" | "failed" | "cancelled";
  fulfilment_status:
    | "new"
    | "preparing"
    | "dispatched"
    | "completed"
    | "cancelled";
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  order_items?: OrderItem[];
};