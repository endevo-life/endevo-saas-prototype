import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ENDevo - Employee Legacy Readiness Platform",
  description: "B2B SaaS platform for employee legacy readiness education",
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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
