import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "SuperNetworkAI - AI-Powered Networking",
  description:
    "Find your ideal cofounder, teammate, or client using AI-powered Ikigai matching.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg-warm)] antialiased">
        <AuthProvider>
          <div className="relative z-10">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
