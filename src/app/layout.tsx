import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GDD — Global Direct Debit",
  description: "Mandate management and direct debit orchestration platform",
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
