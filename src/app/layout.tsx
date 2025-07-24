import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creator Agent Campaign Dashboard",
  description: "Manage your creator campaigns and conversations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Navigation />
        <main className="pt-4">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
