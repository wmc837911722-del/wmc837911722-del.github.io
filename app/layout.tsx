import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteCopy } from "./site-copy";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { title, description } = siteCopy.zh.seo;
const siteUrl = "https://fengyu-product-tech.mystic-ox-8159.chatgpt.site";
const scrollBootScript = `(function(){try{var reset=function(){if(location.hash){return;}history.scrollRestoration='manual';var root=document.documentElement;var behavior=root.style.scrollBehavior;root.style.scrollBehavior='auto';try{scrollTo(0,0);}finally{root.style.scrollBehavior=behavior;}};reset();addEventListener('pageshow',function(){reset();if(!location.hash){history.scrollRestoration='auto';}});}catch(e){}})();`;
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
        <script dangerouslySetInnerHTML={{ __html: scrollBootScript }} />
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
