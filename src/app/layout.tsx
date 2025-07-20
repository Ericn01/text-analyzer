import type { Metadata } from "next";
import { Inter, Roboto_Mono } from 'next/font/google'
import "./globals.css";



const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: "TextAnalyzer - Doc Analysis",
  description: "Harness the power of NLP to explore meaningful insights from your documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${mono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
