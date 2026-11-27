import Link from "next/link";
import Image from "next/image";
import { BrandLockup } from "@/components/Brand";
import { CefrScale } from "@/components/CefrScale";

const SKILLS = [
  { key: "Reading", es: "Lectura", min: "20 min", color: "from-sdg-blue to-navy-600", desc: "Textos reales — correos, artículos, informes — que se adaptan a tu nivel en tiempo real.", icon: "M4 5a2 2 0 012-2h9l5 5v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M14 3v5h5 M8 13h8 M8 17h5" },
  { key: "Listening", es: "Comprensión auditiva", min: "15 min", color: "from-sdg-teal to-sdg-blue", desc: "Conversaciones, llamadas, reuniones y conferencias con distintos acentos y velocidades.", icon: "M3 14v-2a9 9 0 0118 0v2 M3 14a2 2 0 012-2h1v7H5a2 2 0 01-2-2v-3z M21 14a2 2 0 00-2-2h-1v7h1a2 2 0 002-2v-3z" },
  { key: "Writing", es: "Escritura", min: "25 min", color: "from-gold to-sdg-orange", desc: "Un correo profesional y un ensayo de opinión, evaluados con rúbrica MCER asistida por IA.", icon: "M12 20h9 M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" },
  { key: "Speaking", es: "Expresión oral", min: "6 min", color: "from-sdg-magenta to-sdg-red", desc: "Tres tareas orales grabadas: presentación, narración y argumentación.", icon: "M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v3" },
];

const STEPS = [
  { n: "01", t: "Registro y prueba técnica", d: "Datos del estudiante, prueba de audio y micrófono." },
  { n: "02", t: "Examen adaptativo", d: "Cada respuesta ajusta la dificultad: A1 → C2 sin preguntas de relleno." },
  { n: "03", t: "Calificación objetiva", d: "Modelo psicométrico IRT para lectura y audio; rúbrica MCER con IA para escritura y oral." },
  { n: "04", t: "Reporte y ubicación", d: "Puntuación por habilidad, nivel MCER y módulo INTER recomendado — la línea base T0 de tu ELR." },
];

export default function Home() {
  return (
    <main className="overflow-x-clip">
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative isolate bg-navy text-white">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="absolute -top-40 -right-40 -z-10 h-[38rem] w-[38rem] rounded-full bg-royal/40 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 -z-10 h-[30rem] w-[30rem] rounded-full bg-gold/15 blur-3xl" />

        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-8">
          <BrandLockup dark />
          <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#habilidades" className="hover:text-white">Habilidades</a>
            <a href="#proceso" className="hover:text-white">Cómo funciona</a>
            <a href="#escala" className="hover:text-white">Escala MCER</a>
          </nav>
          <Link href="/test" className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20">
            Iniciar
          </Link>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-24 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-32 lg:pt-16">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gold ring-1 ring-gold/30">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" /> INTER Placement Test
            </span>
            <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Tu nivel real de inglés.
              <br />
              <span className="text-gradient-gold">Cuatro habilidades.</span>
              <br />
              Un solo resultado.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              Evaluación adaptativa alineada al Marco Común Europeo de Referencia (MCER). Mide lectura, comprensión auditiva, escritura y expresión oral, y te ubica en el módulo INTER ideal para empezar.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/test" className="group inline-flex items-center gap-3 rounded-2xl bg-gold px-7 py-4 font-display text-base font-bold text-navy-950 shadow-xl shadow-gold/25 transition hover:-translate-y-0.5 hover:bg-gold-300">
                Comenzar evaluación
                <svg className="h-5 w-5 transition group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
              <span className="text-sm text-white/50">≈ 60 minutos · Resultado inmediato</span>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4">
              {[["A0–C2", "Rango medido"], ["4", "Habilidades"], ["T0", "Línea base ELR"]].map(([v, l]) => (
                <div key={l} className="glass-dark rounded-2xl px-4 py-3">
                  <dt className="font-display text-2xl font-extrabold text-white">{v}</dt>
                  <dd className="text-xs text-white/55">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-md animate-rise [animation-delay:150ms]">
            <div className="absolute inset-6 rounded-full bg-gradient-to-tr from-gold/30 via-royal/30 to-sdg-teal/20 blur-2xl" />
            <Image src="/brand/inter-emblem.png" alt="" fill sizes="(max-width: 1024px) 80vw, 420px" className="animate-spin-slow object-contain drop-shadow-2xl" priority />
            {/* floating result preview */}
            <div className="glass absolute -bottom-4 left-0 w-56 animate-float rounded-2xl p-4 text-navy shadow-2xl sm:-left-10">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Resultado global</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold">58</span>
                <span className="text-sm text-slate-400">/100</span>
                <span className="ml-auto rounded-lg bg-navy px-2 py-0.5 font-display text-xs font-bold text-gold">B2</span>
              </div>
              <div className="mt-3 space-y-1.5">
                {[["Reading", 64, "#0a79b8"], ["Listening", 61, "#31d0a1"], ["Writing", 52, "#faac26"], ["Speaking", 55, "#cf4b77"]].map(([k, v, c]) => (
                  <div key={k as string} className="flex items-center gap-2 text-[11px]">
                    <span className="w-16 text-slate-500">{k}</span>
                    <span className="h-1.5 flex-1 rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${v}%`, background: c as string }} /></span>
                    <span className="w-6 text-right font-semibold tabular-nums">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass absolute -right-2 top-6 animate-float rounded-2xl px-4 py-3 text-navy shadow-xl [animation-delay:-4s] sm:-right-8">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Ubicación sugerida</div>
              <div className="font-display text-sm font-bold">Intermediate Master</div>
            </div>
          </div>
        </div>
        <div className="sdg-bar h-1.5 w-full" />
      </section>

      {/* ── SKILLS ───────────────────────────────────────── */}
      <section id="habilidades" className="mx-auto max-w-7xl px-4 py-24 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-royal">Las cuatro habilidades</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Una radiografía completa de tu inglés</h2>
          <p className="mt-4 text-slate-600">Cada habilidad recibe su propia puntuación de 0 a 100 y su nivel MCER. El promedio define tu nivel global y tu módulo de entrada.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SKILLS.map((s, i) => (
            <article key={s.key} className="group relative overflow-hidden rounded-3xl bg-white p-6 ring-1 ring-line transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-lg`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
              </div>
              <h3 className="mt-5 font-display text-xl font-bold text-navy">{s.key}</h3>
              <p className="text-sm font-medium text-slate-400">{s.es} · {s.min}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              <div className={`absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-gradient-to-br ${s.color} opacity-0 blur-2xl transition group-hover:opacity-30`} />
            </article>
          ))}
        </div>
      </section>

      {/* ── PROCESS ──────────────────────────────────────── */}
      <section id="proceso" className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-royal">Cómo funciona</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">Diseñado como línea base para tu progreso</h2>
            <p className="mt-4 text-slate-600">
              Tu resultado se convierte en el punto de partida (T0) del <strong className="text-navy">Executive Learning Report</strong>: a partir de aquí, el Campus Virtual dibuja tu curva de aprendizaje y alerta cuando tu desempeño necesita atención.
            </p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-3xl bg-mist p-6 ring-1 ring-line">
                <span className="font-display text-3xl font-extrabold text-gold">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-navy">{s.t}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── SCALE ────────────────────────────────────────── */}
      <section id="escala" className="mx-auto max-w-5xl px-4 py-24 sm:px-8">
        <div className="text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-royal">Escala INTER · MCER</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">De 0 a 100, del A0 al C2</h2>
        </div>
        <div className="mt-10"><CefrScale active="B2" /></div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-slate-500">
          Evaluación diagnóstica interna alineada a los descriptores del MCER. No constituye una certificación oficial externa.
        </p>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="px-4 pb-24 sm:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-navy px-6 py-14 text-center text-white sm:px-16">
          <div className="grid-bg absolute inset-0" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Antes de empezar</h2>
            <ul className="mx-auto mt-8 grid max-w-4xl gap-3 text-left text-sm sm:grid-cols-4">
              {["Computadora con Google Chrome o Microsoft Edge", "Audífonos y micrófono funcionando", "Un lugar tranquilo y ~60 minutos", "No cierres ni cambies de pestaña"].map((t) => (
                <li key={t} className="glass-dark flex items-start gap-2 rounded-2xl p-4 text-white/80">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/test" className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-gold px-8 py-4 font-display font-bold text-navy-950 shadow-xl shadow-gold/20 transition hover:bg-gold-300">
              Estoy listo · Comenzar
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-slate-500 sm:flex-row sm:px-8">
          <BrandLockup />
          <p>© {new Date().getFullYear()} Instituto Interamericano de Lenguas · INTER Classrooms</p>
        </div>
      </footer>
    </main>
  );
}
