import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chamber Events Newsletter",
  description: "Deterministic chamber event scraping with polished newsletter previews and PDF export."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
