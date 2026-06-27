import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FaceSense AI | Premium Face Analysis, Skincare & Grooming Guide",
  description: "Discover your best look instantly. Upload a photo or take a live selfie. Our privacy-first AI analyzes your face shape, skin, symmetry, features, and generates personalized recommendations for skincare, hairstyle, beard, colors, and clothing.",
  keywords: ["Face Analysis", "Skincare AI", "Hair Recommendation", "Color Analysis", "Glow-up Planner", "Face Symmetry", "Fashion Stylist", "Apple Design", "Privacy-first AI"],
  authors: [{ name: "FaceSense AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans select-none">{children}</body>
    </html>
  );
}
