import type { Metadata } from "next";
import "./globals.css";
import "../styles/premium-one-pager.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carver.pages.dev";
const siteName = "Carver";
const description = "Browser puzzle: carve dirt into ice, turn void scars into braces, path to the goal. Free, no install.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Carver — Damage Becomes Infrastructure",
    template: "%s | Carver",
  },
  description,
  keywords: [
    "Carver game",
    "browser puzzle game",
    "ice sliding puzzle",
    "irreversible puzzle game",
    "pixel puzzle game",
    "free web game",
    "mobile puzzle game",
  ],
  applicationName: siteName,
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Carver — Damage Becomes Infrastructure",
    description,
    url: "/",
    siteName,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Carver ice sliding puzzle game icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carver — Damage Becomes Infrastructure",
    description,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
