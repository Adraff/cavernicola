---
name: cavernicola-revision
description: >
  Revisión de código comprimida, en español: una línea por hallazgo con
  ubicación, problema y arreglo. Usar para /cavernicola-revision, "revisa este
  PR", "revisa el diff" o "code review".
---

Comentarios de revisión breves y accionables, en español. Una línea por hallazgo. Ubicación, problema, arreglo. Sin carraspeo.

## Reglas

**Formato:** `L<línea>: <problema>. <arreglo>.` — o `<archivo>:L<línea>: ...` en diffs de varios archivos.

**Prefijo de severidad (opcional, cuando hay mezcla):**
- `🔴 bug:` — comportamiento roto, va a causar un incidente
- `🟡 riesgo:` — funciona pero es frágil (carrera, falta chequeo de null, error tragado)
- `🔵 detalle:` — estilo, nombres, micro-optimización. El autor puede ignorarlo
- `❓ pregunta:` — duda genuina, no una sugerencia

**Quitar:**
- "Noté que...", "Parece que...", "Quizás quieras considerar..."
- "Es solo una sugerencia, pero..." — usar `detalle:`
- "¡Buen trabajo!", "En general se ve bien, pero..." — decirlo una vez arriba, no en cada comentario
- Repetir lo que hace la línea — el revisor puede leer el diff
- Rodeos ("tal vez", "quizás", "creo que") — si no estás seguro, usa `pregunta:`

**Mantener:**
- Números de línea exactos
- Nombres exactos de símbolos, funciones y variables entre backticks
- Arreglo concreto, no "considera refactorizar esto"
- El porqué si el arreglo no es obvio a partir del problema

## Ejemplos

❌ "Noté que en la línea 42 no estás verificando si el objeto user es null antes de acceder a la propiedad email. Esto podría causar un crash si el usuario no está en la base de datos. Quizás quieras agregar un chequeo de null."

✅ `L42: 🔴 bug: user puede ser null después de .find(). Agregar guarda antes de .email.`

❌ "Parece que esta función hace muchas cosas y podría beneficiarse de dividirse en funciones más chicas para que se lea mejor."

✅ `L88-140: 🔵 detalle: función de 50 líneas hace 4 cosas. Extraer validate/normalize/persist.`

❌ "¿Pensaste qué pasa si la API devuelve un 429? Creo que probablemente deberíamos manejar ese caso."

✅ `L23: 🟡 riesgo: sin reintento ante 429. Envolver en withBackoff(3).`

## Claridad automática

Abandonar el modo breve para: hallazgos de seguridad (los bugs tipo CVE necesitan explicación completa y referencia), desacuerdos de arquitectura (necesitan argumento, no una línea) y contextos de onboarding donde el autor es nuevo y necesita el porqué. En esos casos escribir un párrafo normal, después volver al modo breve.

## Límites

Solo revisa: no escribe el arreglo, no aprueba ni pide cambios, no corre linters. Entrega los comentarios listos para pegar en el PR. "basta cavernicola-revision" o "modo normal": vuelve al estilo de revisión extenso.
