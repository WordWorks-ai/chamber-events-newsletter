import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://127.0.0.1:3000"),
  title: "Chamber Events Newsletter",
  description:
    "Scrape public chamber of commerce events and generate polished newsletter previews with PDF export.",
  openGraph: {
    title: "Chamber Events Newsletter",
    description:
      "Select a chamber, generate a branded event newsletter, and download it as a PDF.",
    type: "website",
    siteName: "Chamber Events Newsletter"
  },
  twitter: {
    card: "summary_large_image",
    title: "Chamber Events Newsletter",
    description:
      "Select a chamber, generate a branded event newsletter, and download it as a PDF."
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
