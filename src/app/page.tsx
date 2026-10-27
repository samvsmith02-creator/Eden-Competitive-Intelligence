import Link from "next/link";
import Image from "next/image";
import { Arrow } from "@/components/icons";
import { ClosingCTA, Eyebrow, TextLink } from "@/components/shared";
import { services } from "@/lib/content";

const pillars = [
  { number: "01", title: "Understand the Landscape", text: "Gain a clearer picture of competitors, industry trends, and changing market conditions." },
  { number: "02", title: "Anticipate Change", text: "Identify emerging risks, competitive threats, and opportunities before they become obvious." },
  { number: "03", title: "Act with Confidence", text: "Turn research into practical recommendations that inform decisions and strategic priorities." },
];
export default function Home() {
  return <>
    <section className="home-hero"><div className="container hero-grid">
      <div className="hero-copy"><Eyebrow light>Clarity in a competitive world</Eyebrow><h1>Intelligence<br />Creates<br /><em>Advantage.</em></h1><p className="hero-lead">Understand your competition. Anticipate market shifts. Make decisions with confidence.</p><p className="hero-description">Independent market research, competitive analysis, and strategic intelligence for organizations navigating uncertainty and pursuing opportunity.</p><div className="hero-actions"><Link className="button button-light" href="/contact">Request a Consultation <Arrow /></Link><TextLink light href="/services">Explore Our Services</TextLink></div></div>
      <div className="hero-visual"><Image src="/architecture.webp" alt="An architectural study of intersecting towers, viewed from below against a deep navy sky" width={760} height={880} sizes="(max-width: 640px) calc(100vw - 48px), (max-width: 1440px) 44vw, 620px" priority className="architecture-image" /><div className="visual-topline"><span>Perspective / 01</span><span className="visual-cross">+</span></div><div className="visual-caption"><span className="caption-rule" /><span>A different perspective.<br />A decisive advantage.</span></div><div className="visual-coordinate">RESEARCH / ANALYSIS / STRATEGY</div></div>
    </div><div className="container hero-bottom"><span>Independent thinking. Actionable intelligence.</span><a href="#advantage">Discover the EDEN approach <span aria-hidden="true">↓</span></a></div></section>

    <section id="advantage" className="section section-ivory"><div className="container"><div className="section-intro"><div><Eyebrow>The EDEN advantage</Eyebrow><h2>Better Intelligence.<br /><em>Better Decisions.</em></h2></div><p>In increasingly competitive markets, the organizations that succeed are those that understand their environments before making critical decisions. EDEN transforms publicly available information, market developments, and competitive signals into structured intelligence that supports smarter strategy.</p></div><div className="pillar-grid">{pillars.map(p => <article key={p.number} className="pillar"><span className="index-number">{p.number}</span><h3>{p.title}</h3><p>{p.text}</p></article>)}</div></div></section>

    <section className="section services-overview"><div className="container"><div className="section-heading"><div><Eyebrow>Our expertise</Eyebrow><h2>Insight that informs<br /><em>your next move.</em></h2></div><TextLink href="/services">Explore Our Services</TextLink></div><div className="service-card-grid">{services.map(s => <Link key={s.id} href={`/services#${s.id}`} className="service-card"><div className="service-card-top"><span className="index-number">{s.number}</span><Arrow diagonal /></div><h3>{s.title}</h3><p>{s.description}</p><span className="service-card-link">Explore service <Arrow /></span></Link>)}</div><p className="research-note"><span aria-hidden="true">+</span> Disciplined research. Publicly available and properly licensed sources. A focus on your strategic questions.</p></div></section>

    <section className="section approach-section"><div className="container"><div className="section-heading"><div><Eyebrow light>Our approach</Eyebrow><h2>From Information<br /><em>to Intelligence.</em></h2></div><p className="section-heading-copy">A clear question. A disciplined process.<br />A perspective you can put to work.</p></div><ol className="process-grid">{[
      ["Define", "We begin with the strategic question and the decision it needs to inform."],
      ["Discover", "We collect and evaluate relevant information from credible, ethical sources."],
      ["Analyze", "We connect the signals, examine implications, and assess competitive risks."],
      ["Deliver", "We translate findings into actionable intelligence and practical recommendations."],
    ].map(([title, text], i) => <li key={title}><div className="process-number"><span>0{i + 1}</span><span className="process-dot" /></div><h3>{title}</h3><p>{text}</p></li>)}</ol></div></section>

    <section className="section founder-preview"><div className="container founder-preview-grid"><div className="founder-art" aria-hidden="true"><div className="track track-one" /><div className="track track-two" /><div className="track track-three" /><span className="founder-art-label">Preparation. Perspective. Precision.</span><div className="founder-art-quote">The discipline<br />to see ahead.</div><span className="founder-art-index">EDEN / A competitive mindset</span></div><div className="founder-preview-copy"><Eyebrow>Our perspective</Eyebrow><h2>Built on intelligence.<br /><em>Shaped by competition.</em></h2><p>At the highest levels of competition, preparation and perspective make a difference.</p><p>Founder Sam Smith brings together a background in intelligence analysis, security and risk, and professional cycling—a perspective grounded in understanding competitors, recognizing patterns, and knowing when to act.</p><TextLink href="/about#founder">Meet the Founder</TextLink></div></div></section>
    <ClosingCTA />
  </>;
}
