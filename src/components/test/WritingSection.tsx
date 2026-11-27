"use client";
import { useState } from "react";
import { WRITING_TASKS } from "@/lib/bank/productive";
import { Button, Card, useCountdown } from "./shared";

const count = (t: string) => (t.match(/\S+/g) ?? []).length;

export function WritingSection({ values, deadline, onChange, onPaste, onDone }: {
  values: Record<string, string>;
  deadline: number;
  onChange: (taskId: string, text: string) => void;
  onPaste: () => void;
  onDone: (timedOut: boolean) => void;
}) {
  const [tab, setTab] = useState(0);
  const [confirm, setConfirm] = useState(false);
  useCountdown(deadline, () => onDone(true));
  const task = WRITING_TASKS[tab];
  const text = values[task.id] ?? "";
  const words = count(text);
  const inRange = words >= task.minWords && words <= task.maxWords;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.16em] text-royal">Writing</p>
          <div role="tablist" aria-label="Tareas de escritura" className="mt-2 inline-flex rounded-xl border border-line bg-white p-1">
            {WRITING_TASKS.map((t, i) => {
              const w = count(values[t.id] ?? "");
              return (
                <button
                  key={t.id}
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={tab === i}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setTab(i)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-royal ${tab === i ? "bg-navy text-white" : "text-slate-700 hover:text-navy"}`}
                >
                  Tarea {i + 1} · {t.title}
                  <span className={`rounded px-1.5 text-xs tabular-nums ${tab === i ? "bg-white/15" : "bg-mist"}`}>{w}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div key={task.id} id={`panel-${task.id}`} role="tabpanel" aria-labelledby={`tab-${task.id}`} className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-md bg-mist px-2.5 py-1 text-xs font-bold text-navy ring-1 ring-line">{task.title}</span>
            <span className="text-sm text-slate-600">{task.minWords}–{task.maxWords} palabras</span>
          </div>
          <p id={`prompt-${task.id}`} className="mt-5 text-[16px] font-medium leading-7 text-navy">{task.prompt}</p>
          {task.bullets && (
            <ul className="mt-4 space-y-2">
              {task.bullets.map((b) => <li key={b} className="flex gap-2.5 text-[15px] text-slate-700"><span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" />{b}</li>)}
            </ul>
          )}
          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-slate-600">Se evalúan el cumplimiento de la tarea, la organización, el vocabulario y la gramática. Escribe en inglés con tus propias palabras. Pegar texto está deshabilitado.</p>
        </Card>

        <Card className="!p-0 overflow-hidden">
          <label htmlFor={`ta-${task.id}`} className="sr-only">Tu respuesta para la tarea {tab + 1}</label>
          <textarea
            id={`ta-${task.id}`}
            aria-describedby={`prompt-${task.id} wc-${task.id}`}
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
            className="block min-h-[440px] w-full resize-y border-0 bg-transparent p-6 text-[16px] leading-7 text-slate-900 outline-none placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-royal/30 sm:p-8"
          />
          <div className="flex items-center gap-4 border-t border-line bg-mist px-6 py-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
              <div className="h-full rounded-full bg-navy transition-[width]" style={{ width: `${Math.min(1, words / task.maxWords) * 100}%` }} />
            </div>
            <span id={`wc-${task.id}`} className="text-sm font-semibold tabular-nums text-slate-700">
              {words} palabras{inRange ? "" : words < task.minWords ? ` · mínimo ${task.minWords}` : ` · máximo sugerido ${task.maxWords}`}
            </span>
          </div>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
        {tab === 0 && <Button variant="secondary" onClick={() => setTab(1)}>Ir a la tarea 2</Button>}
        {!confirm ? (
          <Button onClick={() => setConfirm(true)}>Enviar sección</Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white px-4 py-2" role="alertdialog" aria-label="Confirmar envío">
            <span className="text-sm text-slate-700">¿Enviar ambas tareas? No podrás editarlas después.</span>
            <Button variant="secondary" onClick={() => setConfirm(false)}>Cancelar</Button>
            <Button onClick={() => onDone(false)}>Sí, enviar</Button>
          </div>
        )}
      </div>
    </div>
  );
}
