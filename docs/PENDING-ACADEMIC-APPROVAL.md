# Asuntos pendientes de aprobación académica

Ninguno de estos puntos está implementado. Los parámetros vigentes (v1.0) siguen protegidos por las pruebas `tests/unit/assessment.test.ts`. Cada propuesta indica su justificación y su impacto. Si se aprueba, se implementa subiendo `ASSESSMENT_VERSION`.

| # | Propuesta | Justificación | Impacto | Estado |
|---|---|---|---|---|
| A1 | **Validar formalmente los parámetros v1.0**: tiempos (20/15/25 min), Speaking (15/45 · 25/75 · 30/90 s), 2 reproducciones, 5 bloques, inicio en B1, umbrales de enrutamiento 0.66/0.34 | Los fijó el equipo técnico en el diseño inicial. Falta el aval explícito de coordinación académica | Ninguno técnico; da respaldo institucional | Pendiente |
| A2 | **Nombres y contenido de los módulos avanzados** ("Advanced I", "Advanced II · Executive") y correspondencia definitiva de los 6 módulos con el MCER | La IAS Knowledge Base indica que el mapeo definitivo está pendiente | Cambia textos del reporte y quizá umbrales | Pendiente |
| A3 | **Ratificar los umbrales de ubicación** (27/37/47/57/66) mediante un panel de expertos (*standard setting*, p. ej. Bookmark) | Hoy siguen una regla práctica (60 % inferior de la banda consolida el nivel, 40 % superior avanza) | Puede mover candidatos limítrofes de módulo | Pendiente |
| A4 | **Calibración empírica IRT** de los 72 ítems cuando cada uno tenga ≥ 200 respuestas | Las dificultades actuales son estimaciones de expertos | Mayor precisión; recalibra puntuaciones futuras | Pendiente (requiere datos) |
| A5 | **Ampliar el banco** a ≥ 4 bloques por nivel y sección | Con 2 bloques por nivel la exposición de ítems es alta en grupos grandes | Mayor seguridad del examen | Pendiente |
| A6 | **Audio grabado en estudio** para los 12 guiones de Listening | Hoy se usa la síntesis de voz del navegador; la calidad varía entre equipos y el texto viaja al navegador | Estandarización y seguridad. El reproductor ya admite `public/audio/{id}.mp3` | Pendiente |
| A7 | **Doble calificación humana** de una muestra de Writing y Speaking para medir el acuerdo IA–docente | Respaldar el uso de la rúbrica asistida por IA | Define cuándo un resultado deja de ser provisional | Pendiente |
| A8 | **Política de integridad**: qué hacer ante incidentes (p. ej. ≥ 3 cambios de pestaña o capturas). Hoy solo se registran y generan alertas; nunca penalizan automáticamente | Decisión académica y disciplinaria | Puede invalidar intentos o exigir repetición | Pendiente |
| A9 | **Reintento de una tarea de Speaking tras recargar** la página. Hoy la tarea interrumpida vuelve a empezar y la reanudación queda registrada | Equilibrar la equidad ante fallos técnicos con el riesgo de uso indebido | Regla de administración | Pendiente |
| A10 | **Regla de alerta del ELR**: caída de más de 8 puntos en una habilidad respecto a T0 o a la medición anterior | Propuesta para las alertas de rendimiento de INTERclassrooms | Define cuándo se notifica al docente | Pendiente |

## Cambios técnicos realizados que preservan las reglas académicas

Se documentan por transparencia. No cambian ninguna regla académica:

1. **Conteo justo de reproducciones**: la regla de 2 reproducciones se mantiene; un fallo técnico de audio ya no consume un intento.
2. **Desempate reproducible**: entre bloques equivalentes del mismo nivel, la elección usa una semilla por intento. Las reglas de enrutamiento no cambian; solo se impide "re-sortear" un bloque recargando la página.
3. **Eliminación de elementos que condicionaban al candidato**: mensajes de elogio, la marca ✓ en la opción elegida y el confeti. Esto refuerza la estandarización.
