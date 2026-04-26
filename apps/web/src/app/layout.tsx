import type { Metadata } from "next"
import "./globals.css"
import { JetBrains_Mono } from "next/font/google";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

export const metadata: Metadata = {
  title: "CPE Family 2026",
  description: "CPE Family ได้เพิ่มคุณเป็นครอบครัวแล้วนะะ รับมั้ยย กด Accept เพื่อรับความสนุก แล้วเจอกันมิถุนายนนี้นะะ รอเล้ยยยย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", "font-mono", jetbrainsMono.variable)}
    >
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/osz8kmu.css"></link>
        <meta name="apple-mobile-web-app-title" content="CPE Family 2026" />
      </head>
      <body className="min-h-dvh w-screen">{children}</body>
    </html>
  );
}
