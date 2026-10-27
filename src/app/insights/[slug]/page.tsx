import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClosingCTA, Eyebrow } from "@/components/shared";
import { insights } from "@/lib/content";
export function generateStaticParams() { return insights.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = insights.find(a => a.slug === slug);
  return { title: article ? `${article.title} — Editorial draft` : "Insight not found", description: article?.excerpt, robots: { index: false, follow: true } };
}
export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = insights.find(a => a.slug === slug);
  if (!article) notFound();
  return <><section className="article-hero"><div className="container"><Link className="article-back" href="/insights">← All perspectives</Link><Eyebrow light>{article.category}</Eyebrow><h1>{article.title}</h1><p>{article.excerpt}</p><span className="draft-label">Unpublished editorial draft</span></div></section><article className="section section-ivory"><div className="article-body"><aside className="draft-notice"><strong>For editorial review</strong><p>This is original sample commentary, not a published article, research finding, or account of client work. No publication date is implied.</p></aside><div className="prose">{article.sections.map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text}</p></section>)}</div><div className="article-end"><p className="small-label">EDEN Competitive Intelligence / Editorial draft</p><Link className="text-link" href="/insights">← Return to insights</Link></div></div></article><ClosingCTA /></>;
}
