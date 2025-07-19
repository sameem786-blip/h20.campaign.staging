import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import "./globals.css";
import { gtAmerica } from './fonts/gt-america'

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
    <html lang="en" className={gtAmerica.variable}>
      <body className="bg-gray-50 min-h-screen">
        <Navigation />
        <main className="pt-4">
          {children}
        </main>
      </body>
    </html>
  );
}
