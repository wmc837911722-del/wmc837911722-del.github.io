import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseDetail from "../../case-detail";
import { caseMetadata, getProject } from "../../seo";
import { siteCopy } from "../../site-copy";

type CasePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return siteCopy.zh.caseStudy.projects.map((project) => ({ slug: project.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { slug } = await params;
  const details = caseMetadata("zh", slug);
  if (!details) return {};

  return {
    title: details.title,
    description: details.description,
    alternates: {
      canonical: details.canonical,
      languages: {
        "zh-CN": details.canonical,
        "x-default": details.canonical,
      },
    },
    openGraph: {
      title: details.title,
      description: details.description,
      type: "article",
      url: details.canonical,
      siteName: "风雨 FDE",
      locale: "zh_CN",
      images: [{ url: details.image, alt: details.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: details.title,
      description: details.description,
      images: [details.image],
    },
  };
}

export default async function CasePage({ params }: CasePageProps) {
  const { slug } = await params;
  if (!getProject("zh", slug)) notFound();

  return <CaseDetail caseId={slug} locale="zh" />;
}
