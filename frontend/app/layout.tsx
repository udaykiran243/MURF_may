import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "SereneMind AI - Emotional Support Companion",
  description: "AI-powered emotional support and therapy companion with natural voice conversations",
  keywords: ["AI", "therapy", "mental health", "emotional support", "wellness"],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="bg-slate-950 text-slate-50 overflow-x-hidden">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

