import type { Metadata } from "next";
import RootDocument from "../root-document";
import { GITHUB_PROFILE_URL, PRIMARY_SITE_URL } from "../seo";

export const metadata: Metadata = {
  metadataBase: new URL(PRIMARY_SITE_URL),
  applicationName: "Fengyu FDE",
  authors: [{ name: "Fengyu", url: GITHUB_PROFILE_URL }],
  creator: "Fengyu",
  publisher: "Fengyu",
  category: "AI product delivery",
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
