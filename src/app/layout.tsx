import type { Metadata } from "next";
import { Playfair_Display, Jura, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/components/common/Toast";

// Display serif — Playfair Display replaces Italiana for readability.
// Variable name kept as --font-italiana to avoid touching 59 references.
const italiana = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-italiana",
  display: "swap",
});

const jura = Jura({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jura",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-instrument",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Legacy Readiness OS — Powered by Endevo",
  description:
    "Legacy Readiness OS — the platform for modern, dignified life-readiness across Legal, Financial, Digital, and Physical domains.",
  icons: {
    icon: "/asset/favicon-logo.png",
    shortcut: "/asset/favicon-logo.png",
    apple: "/asset/favicon-logo-large.png",
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
      className={`${italiana.variable} ${jura.variable} ${instrumentSans.variable} ${jetBrainsMono.variable}`}
    >
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
