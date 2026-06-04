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
  title: "ClinicSuite | AI Clinic Automation",
  description:
    "Automate patient chat, reviews, bookings, and health content for modern Indian clinics — all in one platform.",
  keywords: "ClinicSuite, clinic automation, healthcare AI, patient booking, telemedicine India",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
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
