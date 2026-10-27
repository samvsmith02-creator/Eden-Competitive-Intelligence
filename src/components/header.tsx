"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/lib/content";
import { Arrow } from "./icons";

export function Wordmark() {
  return <span className="wordmark"><span className="wordmark-name">EDEN</span><span className="wordmark-subtitle">Competitive Intelligence</span></span>;
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && open) { setOpen(false); toggleRef.current?.focus(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" aria-label="EDEN Competitive Intelligence home" onClick={() => setOpen(false)}><Wordmark /></Link>
    <nav className="desktop-nav" aria-label="Main navigation">
      {navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined}>{item.label}</Link>)}
    </nav>
    <Link className="header-cta" href="/contact">Request a Consultation <Arrow diagonal /></Link>
    <button ref={toggleRef} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}><span className={open ? "menu-lines is-open" : "menu-lines"}><span /><span /></span></button>
  </div>
  <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation" hidden={!open}>
    <Link href="/" onClick={() => setOpen(false)} aria-current={pathname === "/" ? "page" : undefined}>Home</Link>
    {navigation.map(item => <Link key={item.href} href={item.href} aria-current={pathname.startsWith(item.href) ? "page" : undefined} onClick={() => setOpen(false)}>{item.label}<Arrow diagonal /></Link>)}
    <Link className="button button-light" href="/contact" onClick={() => setOpen(false)}>Request a Consultation <Arrow /></Link>
  </nav></header>;
}
