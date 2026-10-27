import Link from "next/link";
import { Arrow } from "./icons";
import { Wordmark } from "./header";
import { navigation } from "@/lib/content";

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`eyebrow${light ? " eyebrow-light" : ""}`}><span />{children}</p>;
}

export function TextLink({ children, href, light = false }: { children: React.ReactNode; href: string; light?: boolean }) {
  return <Link className={`text-link${light ? " text-link-light" : ""}`} href={href}>{children}<Arrow /></Link>;
}

export function PageHero({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <section className="page-hero"><div className="container"><Eyebrow light>{eyebrow}</Eyebrow><h1>{title}</h1>{description && <p className="page-description">{description}</p>}<div className="page-hero-rule"><span>Independent perspective. Informed decisions.</span><span>EDEN / {eyebrow}</span></div></div></section>;
}

export function ClosingCTA() {
  return <section className="closing-cta"><div className="container closing-grid"><div><Eyebrow light>A clearer path forward</Eyebrow><h2>Know More.<br /><em>Move Strategically.</em></h2></div><div><p>Whether evaluating a new market, monitoring competitors, or navigating strategic uncertainty, EDEN helps bring clarity to complex decisions.</p><Link className="button button-light" href="/contact">Start a Conversation <Arrow /></Link></div></div></section>;
}

export function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-top"><div><Link href="/" aria-label="EDEN Competitive Intelligence home"><Wordmark /></Link><p>Independent intelligence.<br />Strategic advantage.</p></div><nav aria-label="Footer navigation"><Link href="/">Home</Link>{navigation.map(item => <Link key={item.href} href={item.href}>{item.label}</Link>)}</nav><div className="footer-note"><span className="small-label">Our commitment</span><p>Ethical research. Disciplined analysis.<br />A clearer perspective.</p><TextLink light href="/contact">Let’s discuss your priorities</TextLink></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} EDEN Competitive Intelligence</span><Link href="/privacy">Privacy & inquiry information</Link><span>Intelligence Creates Advantage.</span></div></div></footer>;
}
