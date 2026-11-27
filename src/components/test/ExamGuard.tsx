"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLatest } from "./shared";

export type GuardEvent = "copy" | "screenshot" | "blur" | "fullscreenExit" | "print" | "devtools";

export async function enterFullscreen() {
  try {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen({ navigationUI: "hide" });
  } catch { /* user/browser declined */ }
}

const isEditable = (t: EventTarget | null) => t instanceof HTMLTextAreaElement || (t instanceof HTMLInputElement && t.type !== "radio" && t.type !== "checkbox");

/**
 * Deterrence layer for the timed sections. A web page cannot technically forbid OS screenshots
 * or a phone camera; what it can do — and does here — is:
 *  • block selection, copy/cut, right-click, drag, print and common shortcuts
 *  • hide (blur) the questions whenever the window loses focus or a screenshot shortcut is pressed
 *  • overwrite the clipboard after PrintScreen
 *  • stamp a personal watermark (name · email · attempt) so any leaked image is traceable
 *  • keep the exam in full screen and log every incident in the result's integrity record.
 */
export function ExamGuard({ active, who, attemptId, onEvent, children }: { active: boolean; who: string; attemptId: string; onEvent: (e: GuardEvent) => void; children: React.ReactNode }) {
  const [shield, setShield] = useState<null | "focus" | "shot">(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fsOut, setFsOut] = useState(false);
  const cb = useLatest(onEvent);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active) return;
    const warn = (msg: string) => {
      setToast(msg);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    };
    const block = (e: Event, msg: string, ev: GuardEvent = "copy") => {
      e.preventDefault();
      e.stopPropagation();
      cb.current(ev);
      warn(msg);
    };
    const onCopy = (e: ClipboardEvent) => block(e, "Copiar está deshabilitado durante el examen.");
    const onCtx = (e: MouseEvent) => { if (!isEditable(e.target)) block(e, "El menú contextual está deshabilitado."); else e.preventDefault(); };
    const onDrag = (e: DragEvent) => e.preventDefault();
    const onSelect = (e: Event) => { if (!isEditable(e.target)) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "PrintScreen") { setShield("shot"); block(e, "Las capturas de pantalla no están permitidas. Quedó registrado.", "screenshot"); return; }
      if (e.metaKey && e.shiftKey) { setShield("shot"); return; } // macOS ⌘⇧3/4/5 · Windows ⊞⇧S
      if (e.key === "F12" || (mod && e.shiftKey && ["i", "j", "c"].includes(k)) || (mod && k === "u")) { block(e, "Herramientas de desarrollador deshabilitadas.", "devtools"); return; }
      if (mod && ["c", "x"].includes(k)) { block(e, "Copiar está deshabilitado durante el examen."); return; }
      if (mod && k === "a" && !isEditable(e.target)) { e.preventDefault(); return; }
      if (mod && ["p", "s"].includes(k)) { block(e, "Imprimir o guardar la página no está permitido.", "print"); return; }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        navigator.clipboard?.writeText("Contenido protegido · INTER Placement Test").catch(() => {});
        setTimeout(() => setShield(null), 900);
      }
      if (!e.metaKey || !e.shiftKey) setShield((s) => (s === "shot" ? null : s));
    };
    const onBlur = () => { setShield("focus"); cb.current("blur"); };
    const onFocus = () => setShield(null);
    const onVis = () => { if (document.visibilityState === "hidden") setShield("focus"); };
    const onPrint = () => { cb.current("print"); warn("Imprimir no está permitido."); };
    const onFs = () => {
      const out = !document.fullscreenElement;
      setFsOut(out);
      if (out) cb.current("fullscreenExit");
    };
    document.addEventListener("copy", onCopy, true);
    document.addEventListener("cut", onCopy, true);
    document.addEventListener("contextmenu", onCtx, true);
    document.addEventListener("dragstart", onDrag, true);
    document.addEventListener("selectstart", onSelect, true);
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("keyup", onKeyUp, true);
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("fullscreenchange", onFs);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("beforeprint", onPrint);
    // sync with the browser's fullscreen state once listeners are attached
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFsOut(!document.fullscreenElement && typeof document.documentElement.requestFullscreen === "function");
    return () => {
      document.removeEventListener("copy", onCopy, true);
      document.removeEventListener("cut", onCopy, true);
      document.removeEventListener("contextmenu", onCtx, true);
      document.removeEventListener("dragstart", onDrag, true);
      document.removeEventListener("selectstart", onSelect, true);
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("keyup", onKeyUp, true);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("fullscreenchange", onFs);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("beforeprint", onPrint);
    };
  }, [active, cb]);

  const watermark = useMemo(() => {
    const text = `${who} · ${attemptId}`.replace(/[<>&"]/g, "");
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='260'><text x='40' y='150' transform='rotate(-22 320 130)' fill='%23132544' fill-opacity='0.07' font-family='Arial' font-size='14' font-weight='700'>${encodeURIComponent(text)}</text></svg>`;
    return `url("data:image/svg+xml;utf8,${svg}")`;
  }, [who, attemptId]);

  if (!active) return <>{children}</>;
  return (
    <div className={`exam-protected relative ${shield ? "shield-on" : ""}`}>
      <div className="exam-content">{children}</div>
      {/* personal watermark */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-20" style={{ backgroundImage: watermark }} />

      {/* shield when focus is lost / screenshot shortcut */}
      {shield && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-navy/80 backdrop-blur-xl">
          <div role="dialog" aria-modal="true" aria-labelledby="shield-t" className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-gold">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 id="shield-t" className="mt-4 font-display text-lg font-extrabold text-navy">{shield === "shot" ? "Captura bloqueada" : "Contenido protegido"}</h3>
            <p className="mt-1 text-sm text-slate-600">{shield === "shot" ? "Las capturas de pantalla no están permitidas y quedan registradas en tu reporte." : "Las preguntas se ocultan cuando sales de la ventana del examen. Haz clic aquí para continuar."}</p>
            <button autoFocus onClick={() => setShield(null)} className="mt-5 min-h-11 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal">Volver al examen</button>
          </div>
        </div>
      )}

      {/* full-screen nudge */}
      {fsOut && !shield && (
        <div role="status" className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-navy px-4 py-3 text-sm text-white shadow-lg">
          <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" /></svg>
          El examen debe hacerse en pantalla completa.
          <button onClick={enterFullscreen} className="rounded-lg bg-gold px-3 py-1.5 font-bold text-navy-950">Activar</button>
        </div>
      )}

      {toast && (
        <div role="status" aria-live="polite" className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white shadow-lg motion-safe:animate-toast">
          {toast}
        </div>
      )}

      <div className="print-block fixed inset-0 z-50 hidden items-center justify-center bg-white text-2xl font-bold text-navy">Contenido protegido · INTER Placement Test</div>
    </div>
  );
}
