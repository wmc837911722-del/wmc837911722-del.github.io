import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "风雨 — Forward Deployed Engineer";
const description = "深入业务现场，从 AI 机会定义、原型验证到系统集成与生产部署，完成解决方案落地的最后一公里。";
const siteUrl = "https://fengyu-product-tech.mystic-ox-8159.chatgpt.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: { icon: "/favicon.svg" },
  openGraph: { title, description, type: "website", locale: "zh_CN", images: [{ url: "/og-fde-brand.png", alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: ["/og-fde-brand.png"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-motion="pending">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
