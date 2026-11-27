import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/Brand";
import { ScaleCycler } from "@/components/landing/ScaleCycler";
import { HeroOrbit } from "@/components/landing/HeroOrbit";
import { Navbar } from "@/components/landing/Navbar";
import { Reveal } from "@/components/Reveal";

const SKILLS = [
  { key: "Reading", es: "Lectura", min: "20 min", color: "from-sdg-blue to-navy-600", glow: "group-hover:shadow-sdg-blue/25", desc: "Correos, artículos e informes reales que se adaptan a tu nivel en tiempo real.", icon: "M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M14 3v5h5 M8 13h8 M8 17h5" },
  { key: "Listening", es: "Comprensión auditiva", min: "15 min", color: "from-sdg-teal to-sdg-blue", glow: "group-hover:shadow-sdg-teal/25", desc: "Llamadas, reuniones y conferencias con distintos acentos y velocidades.", icon: "M3 14v-2a9 9 0 0118 0v2 M3 14a2 2 0 012-2h1v7H5a2 2 0 01-2-2v-3z M21 14a2 2 0 00-2-2h-1v7h1a2 2 0 002-2v-3z" },
  { key: "Writing", es: "Escritura", min: "25 min", color: "from-gold to-sdg-orange", glow: "group-hover:shadow-gold/30", desc: "Un correo profesional y un ensayo de opinión, evaluados con rúbrica MCER.", icon: "M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
  { key: "Speaking", es: "Expresión oral", min: "6 min", color: "from-sdg-magenta to-sdg-red", glow: "group-hover:shadow-sdg-magenta/25", desc: "Tres tareas grabadas: presentación, narración y argumentación.", icon: "M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v3" },
];

const STEPS = [
  { n: "01", t: "Registro y prueba técnica", d: "Datos del estudiante, audio y micrófono.", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { n: "02", t: "Examen adaptativo", d: "Cada respuesta ajusta la dificultad, de A1 a C2.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { n: "03", t: "Calificación objetiva", d: "Modelo psicométrico IRT y rúbrica MCER.", icon: "M9 12l2 2 4-4m5.6-4.4A11.9 11.9 0 0112 2.9 11.9 11.9 0 013.4 5.6 12 12 0 0012 21.1a12 12 0 008.6-15.5z" },
  { n: "04", t: "Reporte y ubicación", d: "Nivel por habilidad, módulo INTER y línea base T0 del ELR.", icon: "M9 17v-2m3 2v-4m3 4v-6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" },
];

const REQS = [
  { t: "Chrome o Edge en computadora", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
  { t: "Audífonos y micrófono", icon: "M3 14v-2a9 9 0 0118 0v2 M3 14a2 2 0 012-2h1v7H5a2 2 0 01-2-2v-3z M21 14a2 2 0 00-2-2h-1v7h1a2 2 0 002-2v-3z" },
  { t: "Lugar tranquilo · ~60 min", icon: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { t: "Pantalla completa, sin cambiar de pestaña", icon: "M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section id="inicio" className="relative isolate overflow-hidden bg-navy text-white">
        {/* photo backdrop, tinted into the brand navy */}
        <div aria-hidden className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[84%]">
          <Image src="/images/hero-student.webp" alt="" fill priority sizes="(max-width: 1024px) 100vw, 84vw" className="object-cover object-[55%_25%] opacity-40 mix-blend-luminosity lg:opacity-60" />
        </div>
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0f1d36_0%,rgba(19,37,68,0.93)_30%,rgba(19,37,68,0.45)_52%,rgba(19,37,68,0.6)_66%,rgba(19,37,68,0.88)_84%,#0f1d36_100%)]" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,29,54,0.75)_0%,transparent_22%,transparent_70%,#0f1d36_100%)]" />
        <div className="grid-bg absolute inset-0 -z-10 opacity-60" />
        <div className="absolute -top-40 -right-40 -z-10 h-[38rem] w-[38rem] animate-glow rounded-full bg-royal/30 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-4 lg:px-8 lg:pb-14">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy-950/40 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-gold ring-1 ring-gold/50 backdrop-blur">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-gold" /></span>
              INTER Placement Test
            </span>
            <h1 className="mt-5 font-display text-[2.05rem] font-extrabold leading-[1.08] tracking-tight drop-shadow-[0_2px_18px_rgba(0,0,0,0.35)] sm:text-[2.8rem] lg:text-[2.6rem] xl:text-[3.1rem]">
              Descubre tu nivel real de inglés.
              <br />
              <span className="text-gradient-gold whitespace-nowrap">Cuatro habilidades.</span>
              <br />
              <span className="text-[0.86em] lg:whitespace-nowrap">Un perfil lingüístico completo.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Evaluación adaptativa alineada al Marco Común Europeo de Referencia (MCER). Mide lectura, comprensión auditiva, escritura y expresión oral, y te ubica en el módulo INTER ideal para empezar.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/test" className="group relative inline-flex items-center gap-3 overflow-hidden rounded-2xl bg-gold px-7 py-4 font-display text-base font-bold text-navy-950 shadow-xl shadow-gold/25 transition hover:-translate-y-0.5 hover:bg-gold-300 sm:text-lg">
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <span className="relative">Comenzar evaluación</span>
                <svg className="relative h-5 w-5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
              <span className="flex items-center gap-2 text-sm text-white/75">
                <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ≈ 60 minutos · Resultado rápido
              </span>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-white/75">
              <svg className="h-5 w-5 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 12l2 2 4-4m5.6-4.4A11.9 11.9 0 0112 2.9 11.9 11.9 0 013.4 5.6 12 12 0 0012 21.1a12 12 0 008.6-15.5z" /></svg>
              Evaluación individual · Alineada al MCER · Resultados confidenciales
            </p>
            <dl className="mt-7 grid max-w-xl grid-cols-3 gap-3">
              {[["Pre-A1–C2", "Rango medido"], ["4", "Habilidades"], ["T0", "Punto de partida"]].map(([v, l], i) => (
                <div key={l} className="glass-dark animate-rise rounded-2xl px-4 py-3.5 transition hover:-translate-y-0.5 hover:bg-white/10" style={{ animationDelay: `${300 + i * 120}ms` }}>
                  <dt className="font-display text-xl font-extrabold text-white sm:text-[1.7rem]">{v}</dt>
                  <dd className="text-xs text-white/65 sm:text-sm">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-rise [animation-delay:200ms]">
            <HeroOrbit />
          </div>
        </div>
        <div className="sdg-bar h-1.5 w-full" />
      </section>

      {/* ── SKILLS ───────────────────────────────────────── */}
      <section id="habilidades" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-xl">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">Las cuatro habilidades</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Una radiografía completa de tu inglés</h2>
          </div>
          <p className="max-w-md text-sm text-slate-600">Cada habilidad recibe su puntuación de 0 a 100 y su nivel MCER. El promedio define tu nivel global y tu módulo de entrada.</p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s, i) => (
            <Reveal key={s.key} delay={i * 110} as="article">
              <div className={`group relative h-full overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-line transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${s.glow}`}>
                <div className={`absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r ${s.color} transition-transform duration-500 group-hover:scale-x-100`} />
                <div className="flex items-start justify-between">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg transition duration-500 group-hover:-rotate-6 group-hover:scale-110`}>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                  </div>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-line">{s.min}</span>
                </div>
                <h3 className="mt-4 font-display text-xl font-bold text-navy">{s.key}</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.es}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{s.desc}</p>
                <div className={`absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${s.color} opacity-0 blur-2xl transition duration-500 group-hover:opacity-30`} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────── */}
      <section id="proceso" className="scroll-mt-20 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">Cómo funciona</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Diseñado como línea base de tu progreso</h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Tu resultado es el punto de partida (T0) del <strong className="text-navy">Executive Learning Report</strong>: desde aquí el Campus Virtual dibuja tu curva de aprendizaje.
            </p>
          </Reveal>
          <ol className="relative mt-10 grid gap-4 md:grid-cols-4">
            <div className="absolute left-[12%] right-[12%] top-7 hidden h-0.5 md:block">
              <Reveal className="h-full"><div className="h-full origin-left animate-draw bg-gradient-to-r from-gold via-royal to-sdg-teal" /></Reveal>
            </div>
            {STEPS.map((s, i) => (
              <Reveal key={s.n} as="li" delay={i * 140} className="relative">
                <div className="group flex h-full flex-col items-center rounded-3xl bg-mist p-5 text-center ring-1 ring-line transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-gold shadow-lg shadow-navy/30 transition duration-500 group-hover:rotate-6 group-hover:scale-110">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                  </span>
                  <span className="mt-3 font-display text-xs font-extrabold tracking-widest text-gold">PASO {s.n}</span>
                  <h3 className="mt-1 font-display text-base font-bold text-navy">{s.t}</h3>
                  <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── SCALE ────────────────────────────────────────── */}
      <section id="escala" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">Escala INTER · MCER</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">De 0 a 100, del A0 al C2</h2>
        </Reveal>
        <Reveal delay={150} className="mt-8"><ScaleCycler /></Reveal>
        <p className="mx-auto mt-4 max-w-2xl text-center text-xs text-slate-500">Evaluación diagnóstica interna alineada a los descriptores del MCER. No constituye una certificación oficial externa.</p>
      </section>

      {/* ── REQUIREMENTS + CTA ───────────────────────────── */}
      <section id="requisitos" className="scroll-mt-20 px-4 pb-16 sm:px-6">
        <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-navy px-6 py-10 text-white sm:px-12">
          <div className="grid-bg absolute inset-0" />
          <div className="absolute -right-20 -top-20 h-72 w-72 animate-glow rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Antes de empezar</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {REQS.map((r) => (
                  <li key={r.t} className="glass-dark flex items-center gap-3 rounded-2xl p-3.5 text-sm text-white/85 transition hover:bg-white/10">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold ring-1 ring-gold/30">
                      <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={r.icon} /></svg>
                    </span>
                    {r.t}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/test" className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gold px-8 py-5 font-display text-lg font-bold text-navy-950 shadow-xl shadow-gold/20 transition hover:-translate-y-0.5 hover:bg-gold-300">
              <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              <span className="relative">Estoy listo · Comenzar</span>
              <svg className="relative h-5 w-5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:px-6">
          <BrandLockup />
          <p>© {new Date().getFullYear()} Instituto Interamericano de Lenguas · INTER Classrooms</p>
        </div>
      </footer>
    </main>
  );
}
