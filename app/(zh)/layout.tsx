import type { Metadata } from "next";
import RootDocument from "../root-document";
import { PRIMARY_SITE_URL, absoluteSiteUrl } from "../seo";
import { siteCopy } from "../site-copy";

const { title, description } = siteCopy.zh.seo;

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

export default function ChineseRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="zh-CN">{children}</RootDocument>;
}
