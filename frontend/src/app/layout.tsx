import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "AutoResearch Agent — AI-Powered Research",
  description: "Autonomous multi-agent AI research system powered by LangGraph + LLaMA 3.3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} bg-mesh min-h-screen font-sans`}>
        {children}
      </body>
    </html>
  );
}
