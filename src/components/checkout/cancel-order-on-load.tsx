"use client";

import { useEffect, useRef } from "react";

export default function CancelOrderOnLoad({
  orderId,
}: {
  orderId: string | null;
}) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!orderId || ranRef.current) return;

    ranRef.current = true;

    fetch("/api/orders/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    }).catch((error) => {
      console.error("Failed to cancel order on load:", error);
    });
  }, [orderId]);

  return null;
}