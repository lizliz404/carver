import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://carver.pages.dev";
const siteName = "Carver";
const description =
  "Play Carver, a free browser puzzle game where every move changes the board: step off dirt, turn it into ice, slide with care, and carve a path to the goal.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Carver — Free Browser Ice Sliding Puzzle Game",
    template: "%s | Carver",
  },
  description,
  keywords: [
    "Carver game",
    "browser puzzle game",
    "ice sliding puzzle",
    "pixel puzzle game",
    "free web game",
    "mobile puzzle game",
  ],
  applicationName: siteName,
  creator: "Pixel Logic Solutions",
  publisher: "Pixel Logic Solutions",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Carver — Free Browser Ice Sliding Puzzle Game",
    description,
    url: "/",
    siteName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carver — Free Browser Ice Sliding Puzzle Game",
    description,
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
