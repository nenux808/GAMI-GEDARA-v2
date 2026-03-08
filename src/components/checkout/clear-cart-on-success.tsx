"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/cart-context";

export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();
  const clearedRef = useRef(false);

  useEffect(() => {
    if (clearedRef.current) return;
    clearCart();
    clearedRef.current = true;
  }, [clearCart]);

  return null;
}