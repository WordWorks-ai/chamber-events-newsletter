import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chamber Events Newsletter",
  description: "Scrape public chamber of commerce events and generate polished newsletter previews with PDF export.",
  openGraph: {
    title: "Chamber Events Newsletter",
    description: "80+ chambers across 35 states. Select a chamber, generate a branded newsletter, and download as PDF.",
    type: "website",
    siteName: "Chamber Events Newsletter"
  },
  twitter: {
    card: "summary_large_image",
    title: "Chamber Events Newsletter",
    description: "80+ chambers across 35 states. Select a chamber, generate a branded newsletter, and download as PDF."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
