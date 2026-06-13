import type { Metadata } from "next";
import "./globals.css";
import { CartDrawer } from "./components/CartDrawer";

export const metadata: Metadata = {
  title: "Pet Circle — Shop",
  description: "Pet e-commerce shopping cart",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="lofi">
      <body>
        <CartDrawer>{children}</CartDrawer>
      </body>
    </html>
  );
}