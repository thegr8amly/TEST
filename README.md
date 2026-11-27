# INTER Placement Test

Evaluación de inglés **adaptativa y alineada al MCER (CEFR)** del Instituto Interamericano de Lenguas (INTER). Mide las cuatro habilidades, entrega un puntaje 0–100 y nivel A0–C2 por habilidad, recomienda el módulo INTER de entrada y genera la **línea base T0** del Executive Learning Report (ELR).

| Sección | Formato | Calificación |
|---|---|---|
| Reading | 5 bloques adaptativos (A1→C2), 15 ítems, 20 min | IRT 3PL + estimación EAP |
| Listening | 5 audios adaptativos, 15 ítems, 15 min, máx. 2 reproducciones | IRT 3PL + estimación EAP |
| Writing | Correo (60–120 palabras) + ensayo (150–250), 25 min | Rúbrica MCER con Claude (4 criterios) · respaldo automático provisional |
| Speaking | 3 tareas grabadas con preparación | Transcripción en el navegador + rúbrica MCER con Claude (5 criterios) · audio para el docente |

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Vercel Blob (almacenamiento privado) · Anthropic SDK (calificación).

## Desarrollo

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev
```

Sin variables de entorno la app funciona completa: Writing/Speaking reciben puntuación provisional y el reporte se guarda solo en el navegador.

## Variables de entorno (Vercel)

| Variable | Para qué |
|---|---|
| `ANTHROPIC_API_KEY` | Calificación con IA de Writing y Speaking |
| `SCORING_MODEL` | Opcional, por defecto `claude-opus-5-5` |
| `BLOB_READ_WRITE_TOKEN` | Guardar resultados y audios (se crea al conectar un Blob store) |
| `ADMIN_KEY` | Acceso a `/admin` (sesión), CSV y API (Bearer) |
| `ID_SECRET` | Secreto estable para `candidateId` seudónimo |
| `RESULTS_WEBHOOK_URL` / `RESULTS_WEBHOOK_SECRET` | Enviar cada resultado al Campus Virtual / hoja ELR |

## Calidad

```bash
npm run lint        # ESLint (eslint-config-next)
npm run typecheck   # TypeScript
npm test            # unit tests + academic lock
npm run build
BASE=http://localhost:3000 npm run test:e2e        # full candidate journey
BASE=http://localhost:3000 node tests/e2e/a11y.cjs # WCAG 2.2 A/AA (axe)
```

Documentación: `docs/AUDIT.md` · `docs/INTEGRATION.md` · `docs/PENDING-ACADEMIC-APPROVAL.md` · `CHANGELOG.md`.
Skills de proyecto (reutilizables en otros proyectos INTER): `.claude/skills/inter-design-system`, `inter-assessment-standards`, `inter-learning-analytics`.

## Rutas

- `/` portada · `/test` examen (`?org=&cohort=&sid=` para enlaces institucionales) · `/report/{id}` reporte (PDF) · `/admin` panel (sesión segura)
- `POST /api/section/next` motor adaptativo (las claves nunca salen del servidor)
- `POST /api/results` califica todo y guarda el Baseline Record
- `GET /api/results/{id}` (Bearer `ADMIN_KEY`) · `GET /api/admin/export?org=&cohort=&period=` CSV para ELR (sesión admin)

## Dónde editar

- Banco de ítems: `src/lib/bank/reading.ts`, `listening.ts`, `productive.ts`
- Mapa de módulos INTER y reglas de ubicación: `src/lib/placement.ts`
- Escala y bandas MCER: `src/lib/cefr.ts`
- Rúbricas de IA: `src/lib/ai-scoring.ts`
- Contrato de datos e integración: `src/lib/record.ts` y [`docs/INTEGRATION.md`](docs/INTEGRATION.md)

`npm run simulate` corre 300 candidatos simulados por nivel para verificar la precisión del motor adaptativo (error típico ≈ ±4 puntos).
