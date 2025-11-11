import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthcare ROI Calculator",
  description: "ROI Calculator: Paper-Based vs E-Signature Solution for Indian Healthcare Sector",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
