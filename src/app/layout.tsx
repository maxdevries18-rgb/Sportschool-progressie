import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { RegisterSW } from "@/components/pwa/register-sw";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

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
          <Header />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
          <RegisterSW />
        </ThemeProvider>
      </body>
    </html>
  );
}
