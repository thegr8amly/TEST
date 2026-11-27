"use client";
import { useState } from "react";
import { WRITING_TASKS } from "@/lib/bank/productive";
import { Card, PrimaryButton, useCountdown } from "./shared";

const count = (t: string) => (t.match(/\S+/g) ?? []).length;

export function WritingSection({ values, deadline, totalMs, onChange, onPaste, onDone }: {
  values: Record<string, string>;
  deadline: number;
  totalMs: number;
  onChange: (taskId: string, text: string) => void;
  onPaste: () => void;
  onDone: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const left = useCountdown(deadline, onDone);
  const task = WRITING_TASKS[tab];
  const text = values[task.id] ?? "";
  const words = count(text);
  const pct = Math.min(1, words / task.maxWords);
  const ok = words >= task.minWords && words <= task.maxWords + 40;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.2em] text-royal">Writing</div>
          <div className="mt-2 inline-flex rounded-2xl bg-white p-1 ring-1 ring-line">
            {WRITING_TASKS.map((t, i) => {
              const w = count(values[t.id] ?? "");
              return (
                <button key={t.id} onClick={() => setTab(i)} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === i ? "bg-navy text-white" : "text-slate-500 hover:text-navy"}`}>
                  Tarea {i + 1} · {t.title}
                  <span className={`rounded-md px-1.5 text-[11px] tabular-nums ${tab === i ? "bg-white/15" : "bg-mist"}`}>{w}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div key={task.id} className="grid animate-rise gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="lg:self-start">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-gold-100 px-3 py-1 text-xs font-bold text-navy">{task.title}</span>
            <span className="text-xs text-slate-400">{task.minWords}–{task.maxWords} palabras</span>
          </div>
          <p className="mt-5 text-[15.5px] font-medium leading-7 text-navy">{task.prompt}</p>
          {task.bullets && (
            <ul className="mt-4 space-y-2">
              {task.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-slate-600"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />{b}</li>
              ))}
            </ul>
          )}
          <div className="mt-6 rounded-2xl bg-mist p-4 text-xs leading-relaxed text-slate-500">
            Se evalúa: cumplimiento de la tarea, organización, vocabulario y gramática. Escribe en inglés con tus propias palabras — pegar texto está deshabilitado.
          </div>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <textarea
            value={text}
            onChange={(e) => onChange(task.id, e.target.value)}
            onPaste={(e) => { e.preventDefault(); onPaste(); }}
            onDrop={(e) => e.preventDefault()}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="sentences"
            autoComplete="off"
            data-gramm="false"
            placeholder="Start writing here…"
            className="block min-h-[420px] w-full resize-y border-0 bg-transparent p-6 text-[15.5px] leading-7 text-slate-800 outline-none placeholder:text-slate-300 sm:p-8"
          />
          <div className="flex items-center gap-4 border-t border-line bg-mist/60 px-6 py-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
              <div className={`h-full rounded-full transition-all ${ok ? "bg-sdg-green" : words > task.maxWords + 40 ? "bg-sdg-red" : "bg-gold"}`} style={{ width: `${pct * 100}%` }} />
            </div>
            <span className={`text-sm font-semibold tabular-nums ${ok ? "text-sdg-green" : "text-slate-500"}`}>{words} palabras</span>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {tab === 0 && <PrimaryButton className="!bg-white !text-navy ring-1 ring-line !shadow-none" onClick={() => setTab(1)}>Ir a la tarea 2</PrimaryButton>}
        {!confirm ? (
          <PrimaryButton onClick={() => setConfirm(true)}>Enviar escritura</PrimaryButton>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 ring-1 ring-line">
            <span className="text-sm text-slate-600">¿Enviar ambas tareas? No podrás editarlas.</span>
            <button className="text-sm font-semibold text-slate-500" onClick={() => setConfirm(false)}>Cancelar</button>
            <PrimaryButton onClick={onDone}>Sí, enviar</PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
