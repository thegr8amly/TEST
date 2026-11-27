"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Emblem, Wordmark } from "../Brand";

const LINKS = [
  { id: "habilidades", label: "Habilidades" },
  { id: "proceso", label: "Cómo funciona" },
  { id: "escala", label: "Escala MCER" },
  { id: "requisitos", label: "Requisitos" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    ["inicio", ...LINKS.map((l) => l.id)].forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => { window.removeEventListener("scroll", onScroll); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? "border-b border-white/10 bg-navy-900/95 backdrop-blur-md" : "bg-transparent"}`}>
      <nav aria-label="Principal" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold" aria-label="INTER — inicio">
          <Emblem size={34} className="motion-safe:animate-spin-slow" />
          <Wordmark dark className="h-6 w-auto" />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => {
            const on = active === l.id;
            return (
              <li key={l.id}>
                <a
                  href={`#${l.id}`}
                  aria-current={on ? "true" : undefined}
                  className={`relative block rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-gold ${on ? "text-white" : "text-white/75 hover:text-white"}`}
                >
                  {l.label}
                  <span aria-hidden className={`absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-gold transition-transform duration-300 ${on ? "scale-x-100" : "scale-x-0"}`} />
                </a>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/test" className="hidden min-h-10 items-center rounded-lg bg-gold px-4 font-display text-sm font-bold text-navy-950 transition-colors hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex">
            Iniciar evaluación
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white ring-1 ring-white/20 focus-visible:outline-2 focus-visible:outline-gold lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 px-4 pb-4 lg:hidden">
          <ul className="py-2">
            {LINKS.map((l) => (
              <li key={l.id}><a href={`#${l.id}`} onClick={() => setOpen(false)} className="block rounded-md px-2 py-3 text-base font-medium text-white/90 hover:bg-white/5">{l.label}</a></li>
            ))}
          </ul>
          <Link href="/test" className="flex min-h-12 items-center justify-center rounded-lg bg-gold font-display text-sm font-bold text-navy-950">Iniciar evaluación</Link>
        </div>
      )}
    </header>
  );
}
