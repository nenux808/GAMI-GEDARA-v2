import "./globals.css";
import { CartProvider } from "@/components/cart/cart-context";
import { ToastProvider } from "@/components/ui/toast-context";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <CartProvider>{children}</CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}