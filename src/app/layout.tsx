import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/common/Toast";

// Use Playfair for major headings and Inter for all body/labels for readability.
const readableDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-italiana",
  display: "swap",
});

const readableLabel = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jura",
  display: "swap",
});

const readableBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

const readableMono = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legacy Readiness OS — Powered by Endevo",
  description:
    "Legacy Readiness OS — the platform for modern, dignified life-readiness across Legal, Financial, Digital, and Physical domains.",
  icons: {
    icon: "/asset/dark_theme/SVG-02.svg",
    shortcut: "/asset/dark_theme/SVG-02.svg",
    apple: "/asset/dark_theme/SVG-02.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${readableDisplay.variable} ${readableLabel.variable} ${readableBody.variable} ${readableMono.variable}`}
    >
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
