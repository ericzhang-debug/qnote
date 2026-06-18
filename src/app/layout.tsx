import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const dynamic = 'force-dynamic'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  let siteTitle = "QNote - 微语";
  try {
    const { prisma } = await import('@/lib/prisma');
    const settings = await prisma.setting.findUnique({ where: { id: 1 } });
    if (settings?.siteTitle) siteTitle = settings.siteTitle;
  } catch {}
  return {
    title: siteTitle,
    description: "记录生活中的每一句微语",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {children}
      </body>
    </html>
  );
}
