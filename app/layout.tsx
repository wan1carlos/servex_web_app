'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  // Hide Header/Footer for store owner dashboard pages, but show for user-facing store product pages (/store/[id])
  const isStoreOwnerPage = pathname?.startsWith('/store') && !pathname?.match(/^\/store\/\d+/);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ServEx - On-Demand Services & Delivery</title>
        <meta name="description" content="Order from your favorite stores and get delivery to your doorstep" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster position="top-center" />
        {!isStoreOwnerPage && <Header />}
        <main className="min-h-screen">{children}</main>
        {!isStoreOwnerPage && <Footer />}
      </body>
    </html>
  );
}

