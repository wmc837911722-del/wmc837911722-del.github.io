import type { Metadata } from "next";
import Home from "../../home";
import { absoluteSiteUrl } from "../../seo";
import { siteCopy } from "../../site-copy";

const { title, description } = siteCopy.en.seo;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteSiteUrl("/en/"),
    languages: {
      "zh-CN": absoluteSiteUrl("/"),
      en: absoluteSiteUrl("/en/"),
      "x-default": absoluteSiteUrl("/"),
    },
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: absoluteSiteUrl("/en/"),
    siteName: "Fengyu FDE",
    locale: "en_US",
    alternateLocale: ["zh_CN"],
    images: [{
      url: absoluteSiteUrl("/og-fde-brand.png"),
      alt: title,
      width: 1734,
      height: 907,
    }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [absoluteSiteUrl("/og-fde-brand.png")],
  },
};

export default function EnglishHomePage() {
  return <Home initialLocale="en" />;
}
