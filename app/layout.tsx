import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteCopy } from "./site-copy";
import { PRIMARY_SITE_URL, absoluteSiteUrl } from "./seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const { title, description } = siteCopy.zh.seo;
const scrollBootScript = `(function(){try{var reset=function(){if(location.hash){return;}history.scrollRestoration='manual';var root=document.documentElement;var behavior=root.style.scrollBehavior;root.style.scrollBehavior='auto';try{scrollTo(0,0);}finally{root.style.scrollBehavior=behavior;}};reset();addEventListener('pageshow',function(){reset();if(!location.hash){history.scrollRestoration='auto';}});}catch(e){}})();`;
const themeBootScript = `(function(){try{var key='fengyu:theme:v1';var saved=localStorage.getItem(key);var theme=saved==='light'||saved==='dark'?saved:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme='dark';}})();`;
const localeBootScript = `(function(){try{document.documentElement.lang=location.pathname.replace(/\\/+$/,'')==='/en'?'en':'zh-CN';}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(PRIMARY_SITE_URL),
  title,
  description,
  applicationName: "风雨 FDE",
  authors: [{ name: "风雨", url: absoluteSiteUrl("/") }],
  creator: "风雨",
  publisher: "风雨",
  category: "AI product delivery",
  keywords: ["前沿部署工程师", "FDE", "AI 产品落地", "AI Agent", "RAG", "系统集成", "生产部署"],
  alternates: {
    canonical: absoluteSiteUrl("/"),
    languages: {
      "zh-CN": absoluteSiteUrl("/"),
      en: absoluteSiteUrl("/en/"),
      "x-default": absoluteSiteUrl("/"),
    },
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title,
    description,
    type: "website",
    url: absoluteSiteUrl("/"),
    siteName: "风雨 FDE",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    images: [{ url: "/og-fde-brand.png", alt: title, width: 1734, height: 907 }],
  },
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
        <script dangerouslySetInnerHTML={{ __html: localeBootScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
