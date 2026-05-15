import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Self Checkout",
  description: "Mobile-first 3D self-checkout retail app"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
