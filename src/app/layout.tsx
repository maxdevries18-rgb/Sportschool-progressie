import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { UserProvider } from "@/contexts/user-context";
import { UserGate } from "@/components/user-gate";
import { RegisterSW } from "@/components/pwa/register-sw";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Sportschool Tracker",
  description: "Track je sportschool sessies en progressie",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sportschool Tracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.className} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 dark:text-gray-100">
        <ThemeProvider>
          <UserProvider>
            <Header />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
              <UserGate>
                {children}
              </UserGate>
            </main>
            <RegisterSW />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
