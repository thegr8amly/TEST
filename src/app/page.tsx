import Image from "next/image";
import Link from "next/link";
import { BrandLockup } from "@/components/Brand";
import { CefrScale } from "@/components/CefrScale";
import { HeroOrbit } from "@/components/landing/HeroOrbit";
import { Navbar } from "@/components/landing/Navbar";
import { Reveal } from "@/components/Reveal";

const SKILLS = [
  { key: "Reading", es: "Comprensión lectora", min: "20 min", color: "#0a79b8", desc: "Correos, artículos e informes. La dificultad se ajusta a cada respuesta, de A1 a C2.", icon: "M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M14 3v5h5 M8 13h8 M8 17h5" },
  { key: "Listening", es: "Comprensión auditiva", min: "15 min", color: "#138a6b", desc: "Llamadas, reuniones y conferencias. Cada audio se escucha como máximo dos veces.", icon: "M3 14v-2a9 9 0 0118 0v2 M3 14a2 2 0 012-2h1v7H5a2 2 0 01-2-2v-3z M21 14a2 2 0 00-2-2h-1v7h1a2 2 0 002-2v-3z" },
  { key: "Writing", es: "Expresión escrita", min: "25 min", color: "#b45309", desc: "Un correo profesional y un ensayo de opinión, evaluados con rúbrica alineada al MCER.", icon: "M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
  { key: "Speaking", es: "Expresión oral", min: "≈ 6 min", color: "#b4325a", desc: "Tres respuestas grabadas: presentación, narración y argumentación.", icon: "M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v3" },
];

const STEPS = [
  { t: "Registro y verificación", d: "Identificación, instrucciones y prueba de audio y micrófono." },
  { t: "Evaluación adaptativa", d: "Cuatro secciones cronometradas en condiciones estandarizadas." },
  { t: "Calificación", d: "Modelo IRT para Reading y Listening; rúbrica MCER para Writing y Speaking." },
  { t: "Perfil y ubicación", d: "Nivel por habilidad, módulo INTER recomendado y línea base T0." },
];

const REQS = ["Computadora con Google Chrome o Microsoft Edge", "Audífonos y micrófono", "Un lugar tranquilo y unos 60 minutos", "Pantalla completa, sin cambiar de pestaña"];

const TRUST = [
  { t: "Alineado al MCER", d: "Descriptores del Marco Común Europeo de Referencia para las Lenguas." },
  { t: "Condiciones estandarizadas", d: "Mismos tiempos, reglas y criterios para todos los candidatos." },
  { t: "Resultados confidenciales", d: "Almacenamiento privado; acceso solo para el equipo académico." },
  { t: "Línea base del ELR", d: "Punto de partida T0 para el seguimiento en INTERclassrooms." },
];

export default function Home() {
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-navy">Saltar al contenido</a>
      <Navbar />
      <main id="contenido" className="overflow-x-clip">
        {/* ── HERO ─────────────────────────────────────────── */}
        <section id="inicio" className="relative isolate overflow-hidden bg-navy text-white">
          <div aria-hidden className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[84%]">
            <Image src="/images/hero-student.webp" alt="" fill priority sizes="(max-width: 1024px) 100vw, 84vw" className="object-cover object-[55%_25%] opacity-35 mix-blend-luminosity lg:opacity-55" />
          </div>
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#0f1d36_0%,rgba(19,37,68,0.94)_32%,rgba(19,37,68,0.5)_54%,rgba(19,37,68,0.62)_68%,rgba(19,37,68,0.9)_86%,#0f1d36_100%)]" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(15,29,54,0.7)_0%,transparent_24%,transparent_72%,#0f1d36_100%)]" />

          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-28 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-6 lg:px-8 lg:pb-16 lg:pt-32">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-gold/50 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-gold">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />INTER Placement Test
              </p>
              <h1 className="mt-5 font-display text-[2.1rem] font-extrabold leading-[1.08] tracking-tight sm:text-[2.8rem] lg:text-[2.6rem] xl:text-[3.1rem]">
                Descubre tu nivel real de inglés.
                <br />
                <span className="whitespace-nowrap text-gold">Cuatro habilidades.</span>
                <br />
                <span className="text-[0.86em] lg:whitespace-nowrap">Un perfil lingüístico completo.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                Evaluación adaptativa alineada al Marco Común Europeo de Referencia (MCER). Mide lectura, comprensión auditiva, escritura y expresión oral, y recomienda el módulo INTER adecuado para empezar.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/test" className="group inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-gold px-6 font-display text-base font-bold text-navy-950 transition-colors hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                  Comenzar evaluación
                  <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                </Link>
                <span className="text-sm text-white/80">≈ 60 minutos · Resultado al finalizar</span>
              </div>
              <p className="mt-5 flex items-center gap-2 text-sm text-white/80">
                <svg className="h-4 w-4 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M9 12l2 2 4-4m5.6-4.4A11.9 11.9 0 0112 2.9 11.9 11.9 0 013.4 5.6 12 12 0 0012 21.1a12 12 0 008.6-15.5z" /></svg>
                Evaluación individual · Alineada al MCER · Resultados confidenciales
              </p>
              <dl className="mt-9 grid max-w-xl grid-cols-3 divide-x divide-white/15 border-y border-white/15">
                {[["Pre-A1–C2", "Rango medido"], ["4", "Habilidades"], ["T0", "Punto de partida"]].map(([v, l]) => (
                  <div key={l} className="px-4 py-4 first:pl-0">
                    <dt className="sr-only">{l}</dt>
                    <dd className="font-display text-xl font-extrabold text-white sm:text-2xl">{v}</dd>
                    <dd className="text-xs text-white/75 sm:text-sm">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <HeroOrbit />
          </div>
          <div aria-hidden className="sdg-bar h-1 w-full" />
        </section>

        {/* ── TRUST ──────────────────────────────────────── */}
        <section aria-label="Garantías de la evaluación" className="border-b border-line bg-white">
          <ul className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {TRUST.map((t) => (
              <li key={t.t} className="flex gap-3">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-royal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden><path d="M5 13l4 4L19 7" /></svg>
                <div><div className="font-display text-sm font-bold text-navy">{t.t}</div><div className="mt-0.5 text-sm leading-snug text-slate-600">{t.d}</div></div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── SKILLS ─────────────────────────────────────── */}
        <section id="habilidades" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-royal">Qué evaluamos</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Cuatro habilidades, un perfil</h2>
            </div>
            <p className="text-[15px] leading-relaxed text-slate-600 md:justify-self-end md:text-right">Cada habilidad recibe una puntuación de 0 a 100 y un nivel MCER. Juntas forman tu perfil lingüístico y la base de tu ubicación.</p>
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((s, i) => (
              <Reveal key={s.key} delay={i * 80} as="article" className="bg-white">
                <div className="h-full p-6 transition-colors duration-200 hover:bg-mist">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${s.color}14`, color: s.color }}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={s.icon} /></svg>
                    </span>
                    <span className="text-sm tabular-nums text-slate-600">{s.min}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-navy">{s.key}</h3>
                  <p className="text-sm font-medium text-slate-600">{s.es}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-slate-700">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── PROCESS ────────────────────────────────────── */}
        <section id="proceso" className="scroll-mt-20 border-y border-line bg-white py-16 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <Reveal>
              <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-royal">Cómo funciona</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Del registro a tu ubicación</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate-600">Tu resultado se convierte en la línea base (T0) del <strong className="font-semibold text-navy">Executive Learning Report</strong>. Desde allí, INTERclassrooms traza tu curva de aprendizaje a lo largo del programa.</p>
            </Reveal>
            <ol className="relative border-l border-line pl-8">
              {STEPS.map((s, i) => (
                <Reveal key={s.t} as="li" delay={i * 90} className="relative pb-7 last:pb-0">
                  <span className="absolute -left-[45px] flex h-7 w-7 items-center justify-center rounded-full bg-navy font-display text-xs font-bold text-white ring-4 ring-white">{i + 1}</span>
                  <h3 className="font-display text-base font-bold text-navy">{s.t}</h3>
                  <p className="mt-1 text-[15px] text-slate-600">{s.d}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* ── SCALE ──────────────────────────────────────── */}
        <section id="escala" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20">
          <Reveal className="text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-royal">Escala INTER · MCER</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">De 0 a 100, de Pre-A1 a C2</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] text-slate-600">Cada rango de puntuación corresponde a un nivel del Marco Común Europeo de Referencia.</p>
          </Reveal>
          <Reveal delay={120} className="mt-8"><CefrScale /></Reveal>
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm text-slate-600">Evaluación diagnóstica interna de INTER, alineada conceptualmente al MCER. No constituye una certificación oficial.</p>
        </section>

        {/* ── REQUIREMENTS + CTA ─────────────────────────── */}
        <section id="requisitos" className="scroll-mt-20 px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
          <Reveal className="mx-auto grid max-w-7xl items-center gap-8 rounded-2xl bg-navy px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Antes de empezar</h2>
              <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {REQS.map((r) => (
                  <li key={r} className="flex items-center gap-3 text-[15px] text-white/90">
                    <svg className="h-5 w-5 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden><path d="M5 13l4 4L19 7" /></svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/test" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-gold px-7 font-display text-base font-bold text-navy-950 transition-colors hover:bg-gold-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              Comenzar evaluación
            </Link>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-slate-600 sm:flex-row sm:px-6 lg:px-8">
          <BrandLockup />
          <p>© {new Date().getFullYear()} Instituto Interamericano de Lenguas · República Dominicana</p>
        </div>
      </footer>
    </>
  );
}
