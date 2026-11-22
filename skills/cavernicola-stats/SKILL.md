---
name: cavernicola-stats
description: >
  Muestra los tokens de salida y de lectura de caché registrados en la sesión
  actual de Claude Code, con su atribución por modo. Usar con /cavernicola-stats.
---

En Claude Code, `src/hooks/cavernicola-mode-tracker.js` busca `src/hooks/cavernicola-stats.js` a su lado y lo ejecuta al recibir `/cavernicola-stats`. El hook no bloquea el prompt: entrega el informe por `hookSpecificOutput.additionalContext` con la instrucción de imprimirlo tal cual dentro de un bloque de código. Haz exactamente eso. No calcules, recalcules ni redondees los números por tu cuenta.

En otros hosts, usa el informe de uso propio del host si existe; si no, di que el uso de la sesión actual no está disponible. El lector de transcripciones de Claude y su historial solo aplican a Claude Code.

El informe muestra tokens de salida y de lectura de caché registrados, cantidad de respuestas y atribución por modo cuando existe. El ahorro es desconocido: la transcripción no tiene una comparación medida sin cavernícola. No deduzcas tokens ahorrados, porcentajes, dinero ni un resultado neto a partir de los conteos o del modo actual.

Opciones:
- `--all`: suma el último conteo registrado de cada sesión.
- `--since 7d` (o `12h`): igual, limitado a ese período.
- `--share`: una línea para compartir, con el ahorro marcado como desconocido.

Los pares de archivo de memoria original/actual (de `/cavernicola-comprimir`) se informan por su tamaño medido en bytes. Esa diferencia de tamaño no prueba ahorro de tokens ni de facturación.
