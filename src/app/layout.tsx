import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import { Lora } from 'next/font/google'; // Use next/font/google for Lora

import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ["400", "700"], // Add weights as needed
});

export const metadata: Metadata = {
  title: 'Photo Poet',
  description: 'Generate poems from your photos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
