export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type PaymentStatus =
  | "pending"
  | "paid"
  | "unpaid"
  | "paid_counter"
  | "failed"
  | "cancelled"
  | "refunded";

export type FulfilmentStatus =
  | "new"
  | "pending_verification"
  | "awaiting_counter_payment"
  | "preparing"
  | "ready_for_pickup"
  | "dispatched"
  | "completed"
  | "cancelled"
  | "expired"
  | "no_show";

export type PaymentMethod = "online" | "counter";

export type VerificationStatus =
  | "not_required"
  | "pending"
  | "verified"
  | "expired"
  | "failed";

export type Order = {
  id: string;
  order_number: number | string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_address: string | null;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  currency: string;

  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  verification_status: VerificationStatus;
  fulfilment_status: FulfilmentStatus;

  pickup_time: string | null;
  verification_token: string | null;
  verification_expires_at: string | null;
  verified_at: string | null;

  risk_flag: boolean;
  no_show_flag: boolean;
  counter_paid_at: string | null;
  active_for_kitchen: boolean;

  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;

  order_items?: OrderItem[];
};