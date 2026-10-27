import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Eyebrow, PageHero } from "@/components/shared";
import { getInquiryConfig } from "@/lib/inquiries";
import { services } from "@/lib/content";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact", description: "Discuss your strategic priorities with EDEN. Tell us about the competitive questions, market opportunities, or business challenges you are evaluating." };
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const selected = services.some(s => s.id === service) ? service! : "";
  return <><PageHero eyebrow="Contact EDEN" title="Let’s Discuss Your Strategic Priorities." description="Tell us about the challenges, competitive questions, or market opportunities your organization is evaluating." /><section className="section section-ivory"><div className="container contact-layout"><aside className="contact-aside"><Eyebrow>A conversation with purpose</Eyebrow><h2>Every engagement<br />begins with<br /><em>a good question.</em></h2><p>Share what you’re considering and what you need to understand. We can discuss where independent research and analysis may be useful.</p><div className="contact-expect"><span className="small-label">What happens next</span><ol><li><span>01</span>We review your strategic priorities.</li><li><span>02</span>We explore the questions and scope.</li><li><span>03</span>We discuss an appropriate research approach.</li></ol></div><p className="contact-config-note">Direct business contact details will be available here once confirmed.</p></aside><ContactForm available={!!getInquiryConfig()} initialService={selected} /></div></section></>;
}
