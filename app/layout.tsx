import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ad Clarity Next",
  description:
    "AI ad creative review app for clarity scoring, attention flow, CTA visibility, and conversion readiness."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink text-paper font-sans">
        {children}
      </body>
    </html>
  );
}
