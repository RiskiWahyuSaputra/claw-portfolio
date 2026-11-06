import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riski Wahyu Saputra | Interactive Claw Machine Portfolio",
  description:
    "Explore the journey, projects, skills, and experiences of IT developer Riski Wahyu Saputra through an interactive arcade claw machine.",
  authors: [{ name: "Riski Wahyu Saputra" }],
  openGraph: {
    title: "Riski Wahyu Saputra | Claw Machine Portfolio",
    description: "A developer portfolio you play: grab a collectible, reveal a section.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#070a1f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
