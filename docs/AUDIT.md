# Auditoría integral — INTER Placement Test

**Fecha:** 27-11-2026 · **Base auditada:** `main` @ `753cf8b` (en producción) · **Rama de mejoras:** `claude/inter-institutional-refinement`

Prioridad: **P0** = riesgo de integridad, privacidad o seguridad · **P1** = afecta credibilidad, experiencia o estandarización · **P2** = mejora de calidad.

---

## 1. Estado general

| Área | Estado |
|---|---|
| Stack | Next.js 16 (App Router), React 19, Tailwind 4, Vercel Blob (privado), Anthropic SDK. Compila sin errores de tipos. |
| Motor académico | Reading/Listening con enrutamiento multietapa (5 bloques, inicio en B1) + IRT 3PL/EAP. Simulación: error típico ≈ ±4 puntos, sin sesgo. Writing/Speaking con rúbrica MCER asistida por IA y respaldo heurístico provisional. |
| Despliegue | Vercel, equipo `inter`. **La rama de producción de Vercel es `claude/stoic-archimedes-h71uqm`, no `main`.** Todo push a esa rama sale a producción. |
| Datos | Un JSON por intento en Blob privado (`results/{id}.json`) + audios en `audio/{id}/`. Sin base de datos relacional. |

## 2. Conservar

- **Identidad:** azul marino #132544 + amarillo #FAAC26, logotipo oficial, emblema girando, fotografía de la estudiante.
- **Órbita de las cuatro habilidades** alrededor del emblema: comunica el producto sin datos ficticios.
- **Motor adaptativo, banco de ítems, IRT, cut-offs, mapa de módulos, tiempos y regla de 2 reproducciones.** Todos se preservan sin cambios (ver §5).
- **Claves de corrección solo en el servidor** (`/api/section/next` no las envía al navegador).
- **Persistencia local del intento:** reanudación tras recargar, con plazos que siguen corriendo.
- **Registro de integridad y alertas ELR. Contrato `inter.placement.v1`** (webhook, API, CSV).

## 3. Corregir (defectos)

| # | Prioridad | Hallazgo | Impacto | Acción |
|---|---|---|---|---|
| C1 | P0 | `/api/results` devuelve al navegador el registro completo, con las respuestas ítem a ítem (`choice` + `correct`). El reporte público `/report/{id}` también serializa ese registro en el HTML. | Cualquiera con un reporte puede **reconstruir las claves** del banco y ver los textos y transcripciones del candidato. | Vista pública saneada; las evidencias solo se ven en el panel de administración. |
| C2 | P0 | La clave de administración viaja en la URL (`?key=`). | Queda en historial, logs y cabecera *referer*. | Inicio de sesión con cookie `httpOnly` firmada, `SameSite=Strict`; comparación en tiempo constante. |
| C3 | P1 | Elementos que **condicionan al candidato**: "¡Sección completada! Vas muy bien.", una ✓ en la opción elegida (puede leerse como "correcta") y confeti. | Rompe la estandarización: retroalimentación evaluativa durante el examen. | Eliminar. La opción elegida se marca de forma neutra. |
| C4 | P1 | Si la síntesis de voz falla, la reproducción fallida **igual consume** uno de los 2 intentos de audio. | Penaliza fallos técnicos y viola la regla de forma injusta. | Solo cuenta una reproducción que realmente empezó. La regla de 2 reproducciones no cambia. |
| C5 | P1 | Al recargar a mitad de bloque, el servidor puede **sortear otro bloque del mismo nivel**. | Permite "re-sortear" un texto difícil (exposición de ítems). | Desempate aleatorio con semilla por intento. Mismas reglas de enrutamiento; solo se vuelve reproducible. |
| C6 | P1 | Las etiquetas A0…C2 bajo el gráfico de perfil están **equiespaciadas**, pero las bandas no lo están (0–20, 21–30 … 71–100). | Escala visual incorrecta. | Ejes con las fronteras reales de cada banda. |
| C7 | P1 | Contraste insuficiente: `text-slate-400` (2.6:1) y textos de 10 px en 22 lugares. | Incumple WCAG 2.2 AA (1.4.3). | Subir a ≥ 4.5:1 y a un tamaño mínimo de 11–12 px. |
| C8 | P1 | Opciones de respuesta sin semántica de radio, sin `aria-live` en avisos de tiempo, sin enlace de salto, sin foco visible consistente. | Accesibilidad (1.3.1, 4.1.2, 2.4.1, 2.4.7). | `role="radiogroup"`/`radio`, `aria-checked`, regiones *live*, *skip link*, `focus-visible`. |
| C9 | P1 | Sin reintentos de red en `/api/section/next`, `/api/results` ni en la subida de audio. Sin indicador de conexión. | Una conexión inestable puede bloquear o perder el envío. | *Backoff* exponencial, banner sin conexión, envío idempotente por `attemptId`. |
| C10 | P2 | El contenido con animación de aparición queda invisible si JavaScript falla. | Robustez. | Mostrarlo visible cuando no hay scripting. |

## 4. Mejorar

| # | Prioridad | Tema | Propuesta |
|---|---|---|---|
| M1 | P1 | **Flujo del candidato** | Hoy son 6 pasos. Implementar los 10 del brief: Instrucciones generales, Requisitos técnicos y Revisión y confirmación de entrega como pasos explícitos, con un *stepper* único. |
| M2 | P1 | **Concentración durante el examen** | Quitar decoración (emblema girando en las intros, confeti, sombras grandes, brillos). La marca de agua se mantiene, sutil. |
| M3 | P1 | **Landing institucional** | Menos glassmorphism, degradados, brillos y halos. Jerarquía tipográfica más sobria, CTA único y claro, indicadores de confianza veraces, overlay de foto más controlado. |
| M4 | P1 | **Identificadores ELR / INTERclassrooms** | Añadir `candidateId` (seudónimo HMAC del correo), `studentId`, `organizationId`, `cohortId`, `assessmentId`, `assessmentVersion`, `attemptId` y versiones de banco, cut-offs y rúbrica. Enlaces por institución/cohorte (`/test?org=…&cohort=…`). |
| M5 | P1 | **Segmentación** | Filtros del panel por institución, cohorte, habilidad, nivel y período. CSV con los identificadores. |
| M6 | P1 | **Estados de guardado** | Indicador "Guardado · hh:mm" y recuperación explícita de sesión. |
| M7 | P2 | **Rendimiento** | Reducir pesos tipográficos cargados, imagen del hero responsiva (`sizes`), *preload* solo de lo necesario. |
| M8 | P2 | **Cabeceras de seguridad** | `X-Frame-Options: DENY`, `noindex` en `/test`, `/report` y `/admin`. |
| M9 | P2 | **Calidad** | ESLint, pruebas unitarias (escala, IRT, enrutamiento, placement, saneamiento) y prueba funcional E2E versionada. |

## 5. Elementos académicos preservados (sin cambios)

Banco de ítems (72 ítems, 24 bloques) · inicio en B1 · 5 bloques por sección · umbrales de enrutamiento (≥ 0.66 sube / ≤ 0.34 baja) · dificultades por nivel · modelo 3PL (a = 1.1, c = 0.2) y EAP con prior N(0, 2) · conversión θ→puntos (50 + 8.33θ) · bandas MCER · rúbricas (4 criterios Writing, 5 Speaking) · ponderación heurística · índices mínimos por módulo · tiempos (20/15/25 min; preparación/respuesta de Speaking 15/45, 25/75, 30/90 s) · máximo 2 reproducciones de audio · no volver a bloques anteriores.

Las propuestas académicas quedan en `docs/PENDING-ACADEMIC-APPROVAL.md`, **sin implementar**.

## 6. Limitaciones conocidas (no resolubles solo con front-end)

- **Capturas y cámara:** un navegador no puede impedir técnicamente una captura del sistema operativo ni una foto con el celular. Se aplican disuasión, ocultamiento y registro.
- **Guiones de Listening en el cliente:** la síntesis de voz necesita el texto en el navegador. Se resuelve con audio grabado (`public/audio/{testletId}.mp3`).
- **Confianza en el cliente:** el servidor califica lo que recibe. Un estado de sesión del lado del servidor (base de datos) eliminaría la posibilidad de fabricar respuestas. Recomendado al migrar a la base de datos del Campus.
- **Sin límite de tasa** en `/api/results` (costo de IA ante abuso). Requiere un almacén compartido (KV/DB).
- **Validez psicométrica:** parámetros fijados por expertos, sin calibración empírica. La alineación al MCER es conceptual, no una validación formal.
