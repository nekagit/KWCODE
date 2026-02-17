import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Next.js admin dashboard starter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
