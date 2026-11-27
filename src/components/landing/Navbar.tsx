"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Emblem, Wordmark } from "../Brand";

const LINKS = [
  { id: "habilidades", label: "Habilidades", icon: "M4 6h16M4 12h16M4 18h10" },
  { id: "proceso", label: "Cómo funciona", icon: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "escala", label: "Escala MCER", icon: "M4 20V10M10 20V4M16 20v-7M22 20H2" },
  { id: "requisitos", label: "Requisitos", icon: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    LINKS.forEach((l) => { const el = document.getElementById(l.id); if (el) io.observe(el); });
    const hero = document.getElementById("inicio");
    if (hero) io.observe(hero);
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        className={`flex w-full max-w-[76rem] items-center justify-between gap-3 rounded-2xl px-3 py-2 transition-all duration-500 sm:px-4 ${
          scrolled ? "bg-navy/95 shadow-2xl shadow-black/30 ring-1 ring-white/10 backdrop-blur-2xl" : "bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-md"
        }`}
      >
        <Link href="/" className="group flex items-center gap-2.5" aria-label="INTER — inicio">
          <span className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-gold/30 blur-md transition group-hover:bg-gold/50" />
            <Emblem size={38} className="relative animate-spin-slow" />
          </span>
          <Wordmark dark className={`w-auto transition-all duration-500 ${scrolled ? "h-6" : "h-7"}`} />
        </Link>

        <ul className="relative hidden items-center gap-1 rounded-xl bg-white/[0.06] p-1 ring-1 ring-white/10 lg:flex">
          {LINKS.map((l) => {
            const on = active === l.id;
            return (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  className={`group relative flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-all duration-300 ${on ? "bg-white text-navy shadow-lg shadow-black/20" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
                >
                  <svg className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${on ? "text-royal" : "text-gold/80"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={l.icon} /></svg>
                  {l.label}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/test"
            className="group relative hidden overflow-hidden rounded-xl bg-gold px-5 py-2.5 font-display text-sm font-bold text-navy-950 shadow-lg shadow-gold/30 transition hover:-translate-y-0.5 hover:bg-gold-300 sm:inline-flex sm:items-center sm:gap-2"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent" />
            <span className="relative">Iniciar evaluación</span>
            <svg className="relative h-4 w-4 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
          </Link>
          <button onClick={() => setOpen((o) => !o)} className="flex h-10 w-10 items-center justify-center rounded-xl text-white ring-1 ring-white/15 lg:hidden" aria-label="Menú" aria-expanded={open}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="absolute inset-x-3 top-[4.6rem] animate-rise rounded-2xl bg-navy-950/95 p-2 shadow-2xl ring-1 ring-white/10 backdrop-blur-2xl lg:hidden">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
              <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={l.icon} /></svg>
              {l.label}
            </a>
          ))}
          <Link href="/test" className="mt-1 flex items-center justify-center rounded-xl bg-gold py-3 font-display text-sm font-bold text-navy-950">Iniciar evaluación</Link>
        </div>
      )}
    </div>
  );
}
