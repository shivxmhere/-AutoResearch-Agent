import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";
import ParticleCanvas from "./components/ParticleCanvas";
import { ToastProvider } from "./components/ToastContext";

export const metadata: Metadata = {
  title: "AutoResearch Agent — AI-Powered Research",
  description: "Autonomous multi-agent AI research system powered by LangGraph + LLaMA 3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ParticleCanvas />
          <CustomCursor />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
