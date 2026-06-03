import type { Metadata } from "next";
import { Anton, Condiment, Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-dashboard",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--font-anton",
  weight: "400",
  display: "swap",
});

const condiment = Condiment({
  subsets: ["latin"],
  variable: "--font-condiment-google",
  weight: "400",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MediNova AI | Futuristic Healthcare",
  description:
    "AI-assisted doctor consultations, smart appointments, and modern digital healthcare — all in one platform.",
  keywords: "healthcare AI, doctor consultation, telemedicine, MediNova",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${anton.variable} ${condiment.variable} ${inter.variable} ${plusJakarta.variable} font-sans bg-background text-cream`}
      >
        {children}
      </body>
    </html>
  );
}
