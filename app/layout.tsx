import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Chamber Events Newsletter",
  description: "Scrape public chamber of commerce events and generate polished newsletter previews with PDF export."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
