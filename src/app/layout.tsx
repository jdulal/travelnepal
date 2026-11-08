import type { Metadata } from "next";
import { Jost, Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";

const jost = Jost({ subsets: ["latin"], variable: "--font-jost", weight: ["400", "500", "600", "700"] });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["400", "500", "600", "700", "800"] });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", weight: ["500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Nepal Travel — Treks, Tours & AI Trip Planning",
    template: "%s · Nepal Travel",
  },
  description:
    "Plan your Nepal adventure with local experts. Small-group Himalayan treks, cultural tours, wildlife safaris, AI itineraries and 24/7 support from Kathmandu.",
  keywords: ["Nepal travel", "Nepal trekking", "Everest Base Camp", "Annapurna trek", "Nepal tours", "Kathmandu"],
  openGraph: {
    title: "Nepal Travel — Trek higher. Travel deeper.",
    description: "Small-group treks, local tours and AI trip planning across Nepal.",
    type: "website",
    images: ["/images/hero/hero.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jost.variable} ${jakarta.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
