---
name: cavernicola-commit
description: >
  Escribe un mensaje de commit Conventional Commits comprimido a la intención.
  Usar para "escribe un commit", "mensaje de commit", /commit o
  /cavernicola-commit.
---

Mensajes de commit breves y exactos. Formato Conventional Commits. Sin relleno. El porqué antes que el qué.

## Idioma

El resumen y el cuerpo van en español, salvo que el historial del repo (`git log`) esté en otro idioma: entonces sigue la convención del repo. Tipos (`feat`, `fix`...) y scopes quedan en inglés: son parte del formato.

## Reglas

**Línea de asunto:**
- `<tipo>(<scope>): <resumen>` — `<scope>` opcional
- Tipos: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `build`, `ci`, `style`, `revert`
- Verbo en infinitivo: "agregar", "corregir", "quitar" — no "agregado", "agrega", "agregando". Si el repo ya usa otra forma, sigue la del repo
- ≤50 caracteres si se puede, tope duro 72
- Sin punto final
- Mayúscula después de los dos puntos según la convención del proyecto

**Cuerpo (solo si hace falta):**
- Omitirlo si el asunto se explica solo
- Agregarlo solo para: porqué no obvio, cambios incompatibles, notas de migración, issues vinculados
- Cortar líneas a 72 caracteres
- Viñetas con `-`, no `*`
- Referencias a issues/PRs al final: `Closes #42`, `Refs #17`

**Lo que NUNCA va:**
- "Este commit hace X", "yo", "nosotros", "ahora", "actualmente" — el diff dice el qué
- "Como pidió..." — usar trailer Co-authored-by
- "Generado con Claude Code" ni ninguna atribución a IA — salvo que una regla propia del usuario pida un trailer `Assisted-by` o de atribución a IA; entonces agregarlo como trailer
- Emojis (salvo que la convención del proyecto los pida)
- Repetir el nombre del archivo cuando el scope ya lo dice

## Ejemplos

Diff: endpoint nuevo para el perfil de usuario, con cuerpo que explica el porqué
- ❌ "feat: se agregó un nuevo endpoint para obtener la información del perfil del usuario desde la base de datos"
- ✅
  ```
  feat(api): agregar GET /users/:id/profile

  El cliente móvil necesita datos de perfil sin el payload completo
  del usuario, para gastar menos datos LTE en el arranque en frío.

  Closes #128
  ```

Diff: cambio incompatible de API
- ✅
  ```
  feat(api)!: renombrar /v1/orders a /v1/checkout

  BREAKING CHANGE: los clientes de /v1/orders deben migrar a
  /v1/checkout antes del 2026-06-01. Después la ruta vieja da 410.
  ```

## Claridad automática

Siempre incluir cuerpo para: cambios incompatibles, arreglos de seguridad, migraciones de datos, cualquier cosa que revierta un commit anterior. Nunca comprimir esto a solo asunto: quien depure después necesita el contexto.

## Límites

Solo genera el mensaje. No ejecuta `git commit`, no agrega archivos al stage, no hace amend. Entrega el mensaje en un bloque de código listo para pegar. "basta cavernicola-commit" o "modo normal": vuelve al estilo de commit extenso.
