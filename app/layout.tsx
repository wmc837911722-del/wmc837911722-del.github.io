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
const themeBootScript = `(function(){try{var key='fengyu:theme:v1';var saved=localStorage.getItem(key);var theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

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
    <html
      lang="zh-CN"
      data-theme="dark"
      data-motion="pending"
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#080b12" />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
