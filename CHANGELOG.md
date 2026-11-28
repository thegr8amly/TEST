# Changelog

## [Unreleased] — `claude/inter-institutional-refinement`

Assessment version stays at **1.0.0**: no academic parameter has changed (see `docs/PENDING-ACADEMIC-APPROVAL.md`).

### Seguridad y privacidad
- El navegador ya no recibe las respuestas ítem a ítem, que permitían reconstruir las claves de corrección. El reporte público usa una vista saneada.
- Panel administrativo con sesión firmada en cookie `httpOnly`, `SameSite=Strict`, de 8 horas. La clave ya no viaja en la URL y se compara en tiempo constante.
- Cabeceras `X-Frame-Options: DENY`, HSTS y `noindex`/`no-store` en las rutas privadas.

### Datos e integración (ELR · INTERclassrooms)
- Identificadores aditivos: `candidateId` (seudónimo HMAC), `studentId`, `organizationId`, `cohortId`, `assessmentId`, `assessmentVersion`, `attemptId` y `period`.
- Trazabilidad del scoring: huellas del banco, del enrutamiento, de los cortes, de la ubicación y de la rúbrica guardadas en cada resultado.
- Enlaces institucionales `/test?org=…&cohort=…&sid=…`.
- Envío idempotente por `attemptId`: un reintento devuelve el resultado guardado sin volver a calificar.
- Segmentación en el panel y en el CSV por institución, cohorte, período, nivel y estado.

### Experiencia del candidato
- Flujo de 10 pasos: instrucciones generales, requisitos técnicos, prueba de audio y micrófono, y revisión y confirmación de entrega.
- Modo de concentración durante el examen, con temporizador accesible e indicador de guardado.
- Reintentos de red, aviso de conexión perdida, reenvío automático al volver la red y diálogo explícito de recuperación de sesión.
- Se eliminaron los elementos que condicionaban las respuestas. La selección de opciones es neutra.
- Las reproducciones de Listening solo cuentan si el audio realmente empieza.

### Resultados
- Perfil lingüístico institucional: nivel global, barras sobre las fronteras reales de las bandas MCER, margen de ±1 error estándar, textura para lo provisional, tabla T0 y nota metodológica.
- Evidencias (integridad, identificadores, respuestas, audios) visibles solo para la administración.

### Vista previa al compartir el enlace
- Tarjeta de marca 1200×630 (JPEG de 92 KB, apta para WhatsApp) con titular, habilidades y foto en duotono navy; etiquetas Open Graph y Twitter completas (`es_DO`, título, descripción, texto alternativo). Texto propio para `/test`. Se regenera con `npm run og` (`scripts/og/`).
- Se quitó el brillo animado de los botones de inicio.

### Portada
- Refinamiento institucional premium: se mantienen la foto, el emblema, la órbita de habilidades y la paleta. Se eliminan glassmorphism, degradados, brillos y tarjetas con datos ficticios. Se añaden indicadores de confianza veraces.

### Calidad
- ESLint sin errores; 16 pruebas unitarias, incluido el "candado académico"; E2E del flujo completo; auditoría WCAG 2.2 A/AA (axe) con 0 violaciones en 9 pantallas.
- Skills de proyecto: `inter-design-system`, `inter-assessment-standards` e `inter-learning-analytics`.
