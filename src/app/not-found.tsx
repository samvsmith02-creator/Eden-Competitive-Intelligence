import Link from "next/link";
import { Eyebrow } from "@/components/shared";
import { Arrow } from "@/components/icons";
export default function NotFound() { return <section className="section section-ivory"><div className="container error-page"><Eyebrow>404 / Page not found</Eyebrow><h1>A different path<br /><em>forward.</em></h1><p>The page you’re looking for is unavailable. Explore our services or return to the homepage.</p><div className="flex flex-wrap gap-5"><Link className="button button-navy" href="/">Return Home <Arrow /></Link><Link className="text-link" href="/services">Explore Services <Arrow /></Link></div></div></section>; }
