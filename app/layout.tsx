import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Carver",
  description: "A browser-first pixel puzzle where every move carves the world into ice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">{children}</body>
    </html>
  );
}
