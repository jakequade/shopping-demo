import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}