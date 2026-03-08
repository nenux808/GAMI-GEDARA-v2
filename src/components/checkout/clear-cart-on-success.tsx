"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/cart-context";

export default function ClearCartOnSuccess() {
  const { clearCart } = useCart();
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (hasClearedRef.current) return;

    clearCart();
    hasClearedRef.current = true;
  }, [clearCart]);

  return null;
}