# INTER Placement Test — Guía de integración

Este documento explica cómo el Placement Test alimenta al **Campus Virtual** (app y web) y al **Executive Learning Report (ELR)**.

## 1. Idea central

Cada examen produce un único objeto JSON: el **INTER Baseline Record** (`schema: "inter.placement.v1"`). Es la medición **T0** del estudiante. A partir de él:

1. El Campus Virtual crea o actualiza el expediente del estudiante y le asigna el módulo recomendado.
2. El ELR registra la línea base por habilidad (Reading, Listening, Writing, Speaking).
3. Cada evaluación posterior (midterm, final, oral, re-test) se añade como T1, T2, …: así se dibuja la curva de aprendizaje y se disparan las alertas.

```
Placement Test ──(Baseline Record T0)──► Campus Virtual DB ──► ELR (tendencias, alertas)
        │                                       ▲
        └──── webhook / API / CSV ──────────────┘
```

## 2. El contrato: Baseline Record

Referencia completa de identificadores y convenciones: `.claude/skills/inter-learning-analytics/SKILL.md`.

**Enlaces institucionales:** `/test?org=<slug>&cohort=<slug>&sid=<studentId>` asignan `organizationId`, `cohortId` y `studentId` de forma consistente.

Definido en `src/lib/record.ts`. Campos clave:

| Campo | Descripción |
|---|---|
| `id` | ID del intento (`ipt_xxxxxxxxxx`) |
| `candidate` | nombre, email, teléfono, `studentId`, organización, cohorte, objetivo |
| `skills.{reading,listening,writing,speaking}` | `score` 0–100, `cefr`, `status` (`scored` / `provisional` / `pending_review`), `method` (`irt-eap`, `ai-rubric`, `heuristic`), `sem` (error estándar) |
| `overall` | promedio de las habilidades calificadas + nivel MCER |
| `placement` | `moduleId`, `moduleName`, `cefrTarget`, `index`, `rationale`, `focusAreas`, `reviewRequired` |
| `elr` | `measurement: "T0"`, `baselineCefr`, puntuación por habilidad, `alerts[]` |
| `integrity` | cambios de pestaña, intentos de pegar, navegador |
| `responses` | respuestas ítem a ítem, textos escritos, transcripciones y ruta a los audios |

Escala: A0 0–20 · A1 21–30 · A2 31–40 · B1 41–50 · B2 51–60 · C1 61–70 · C2 71–100.

## 3. Formas de obtener los resultados (de hoy en adelante)

### a) Webhook en tiempo real (recomendado)
Define `RESULTS_WEBHOOK_URL` en Vercel. Al terminar cada examen se hace `POST` con el Baseline Record.
Si defines `RESULTS_WEBHOOK_SECRET`, se envía la cabecera `X-Inter-Signature` = HMAC-SHA256 (hex) del cuerpo, para que el receptor verifique el origen.

### b) API de consulta
`GET /api/results/{attemptId}` con `Authorization: Bearer <ADMIN_KEY>` → Baseline Record completo.

### c) Exportación CSV
`/api/admin/export?org=&cohort=&period=&level=&status=` (requiere sesión de administrador) — incluye `attempt_id`, `candidate_id`, `organization_id`, `cohort_id`, versiones y columnas alineadas con *ELR_INTER › 01_SETUP › Lista de participantes* (Student ID, nombres, correo, teléfono, **Baseline CEFR**) + T0 por habilidad, módulo y alertas.

### d) Panel
`/admin` (inicio de sesión con la clave; sesión segura de 8 h) — listado, distribución MCER, reporte con evidencias (textos, transcripciones y audios).

## 4. Conexión inmediata con la hoja ELR_INTER (Google Sheets)

Mientras el Campus Virtual está en desarrollo, los resultados pueden caer directo en la hoja:

1. Abre la hoja → *Extensiones › Apps Script* y pega:

```js
function doPost(e) {
  const r = JSON.parse(e.postData.contents);
  const sh = SpreadsheetApp.getActive().getSheetByName('00_PLACEMENT') ||
             SpreadsheetApp.getActive().insertSheet('00_PLACEMENT');
  if (sh.getLastRow() === 0) sh.appendRow(['Fecha','Result ID','Student ID','Nombre','Email','Institución','Cohorte',
    'Baseline CEFR','Global','Reading','Listening','Writing','Speaking','Módulo recomendado','Revisión','Alertas','Reporte']);
  sh.appendRow([r.completedAt, r.id, r.candidate.studentId || '', r.candidate.fullName, r.candidate.email,
    r.candidate.organization || '', r.candidate.cohort || '', r.elr.baselineCefr, r.overall.score,
    r.skills.reading.score, r.skills.listening.score, r.skills.writing.score, r.skills.speaking.score,
    r.placement.moduleName, r.placement.reviewRequired ? 'SI' : 'NO',
    r.elr.alerts.map(a => a.code).join(' | '), 'https://<tu-dominio>/report/' + r.id]);
  return ContentService.createTextOutput('ok');
}
```

2. *Implementar › Nueva implementación › Aplicación web* (ejecutar como tú, acceso "Cualquiera").
3. Copia la URL y ponla en `RESULTS_WEBHOOK_URL` en Vercel.

## 5. Integración con el Campus Virtual (propuesta)

Opción recomendada — **servicio independiente + webhook** (lo que ya existe):

- El Placement Test sigue desplegado como app propia (`placement.<dominio>`).
- El Campus Virtual expone `POST /api/placements` que recibe el Baseline Record, verifica la firma HMAC, busca al estudiante por `email`/`studentId` y guarda:
  - tabla `assessments` (`student_id`, `type='placement'`, `measurement='T0'`, `taken_at`, `overall`, `cefr`, `raw_json`)
  - tabla `skill_scores` (`assessment_id`, `skill`, `score`, `cefr`, `status`)
- El ELR calcula tendencias sobre `skill_scores` ordenados por fecha y genera alertas (p. ej. caída > 8 puntos o paso a categoría *Intervention*).
- Enlace profundo desde el Campus: `https://placement.<dominio>/test?sid=<studentId>` (pre-rellenado — siguiente iteración).

Cuando la plataforma tenga su base de datos, basta con reemplazar las 4 funciones de `src/lib/storage.ts` (`saveResult`, `getResult`, `listResults`, `saveAudio`) — la interfaz no cambia.

## 6. Calibración y próximos pasos

- **Audio**: v1 usa síntesis de voz del navegador. Para producción, grabar los 12 guiones de `src/lib/bank/listening.ts` y colocar `public/audio/{testletId}.mp3`; el reproductor los usa automáticamente.
- **Banco de ítems**: 36 ítems de Reading + 36 de Listening (2 bloques por nivel). Ampliar a ≥4 bloques por nivel para seguridad del examen; las dificultades deben recalibrarse con datos reales (~200 respuestas por ítem).
- **Módulos**: los nombres "Advanced I / II" son provisionales; ajustar en `src/lib/placement.ts`.
- **Speaking**: la transcripción automática funciona en Chrome/Edge. En otros navegadores el audio se guarda y queda `pending_review`.
- **Aviso**: es una evaluación diagnóstica interna alineada al MCER, no una certificación oficial externa.
