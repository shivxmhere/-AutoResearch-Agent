import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentVerse — The internet of agents",
  description: "AI Agents Marketplace — where every task finds its mind.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
