---
name: cuadrilla
description: >
  Cuándo delegar en `cuadrilla-investigador` (localizar código),
  `cuadrilla-constructor` (edición de 1-2 archivos) o `cuadrilla-revisor`
  (revisión de diff) en lugar de trabajar en el hilo principal o usar
  `Explore`. Su salida viene comprimida, así el contexto principal dura más.
---

Cuadrilla = tres agentes preconfigurados que responden en voz cavernícola extremo, en español (herramientas: una línea de estado al entrar, una al salir; nada entre llamadas rutinarias). Hacen el mismo trabajo que los agentes por defecto (`Explore`, agentes de edición, revisor); la diferencia es que el resultado que devuelven viene comprimido, así que el contexto principal crece menos por cada delegación.

## Cuándo usar la cuadrilla y cuándo otra cosa

| Tarea | Usar |
|---|---|
| "¿Dónde se define X? ¿Qué llama a Y? Lista los usos de Z" | `cuadrilla-investigador` |
| Lo mismo, pero además quieres sugerencias o comentarios de arquitectura | `Explore` (normal) |
| Edición quirúrgica, ≤2 archivos, alcance obvio | `cuadrilla-constructor` |
| Función nueva / 3+ archivos / refactor transversal | Hilo principal, o `feature-dev:code-architect` si está instalado |
| Revisar diff, rama o archivo en busca de bugs | `cuadrilla-revisor` |
| Revisión profunda con argumentos y alternativas | `Code Reviewer` (normal) si está instalado, si no el hilo principal |
| Respuesta de una línea que ya sabes | Hilo principal, sin subagente |

Regla práctica: **si quieres la salida del subagente en 1/3 de los tokens, elige la cuadrilla. Si quieres prosa, elige el normal.**

## Por qué existe (la ganancia real)

Los resultados de los subagentes entran al contexto principal tal cual. Un `Explore` normal que devuelve 2k tokens de prosa cuesta 2k tokens de contexto principal cada vez. El mismo hallazgo de `cuadrilla-investigador` vuelve como una tabla `ruta:línea` comprimida. En 20 delegaciones dentro de una sesión, esa es la diferencia entre quedarse sin contexto y terminar la tarea.

## Contratos de salida

Lo que el hilo principal puede esperar de cada agente:

**`cuadrilla-investigador`**
```
<Encabezado>:
- ruta:línea — `símbolo` — nota corta
<totales>.
```
O `Sin resultados.` Siempre ruta primero, número de línea pegado, símbolos entre backticks. Se puede buscar con el patrón `ruta:\d+`.

**`cuadrilla-constructor`**
```
<ruta:rango-de-líneas> — <cambio ≤10 palabras>.
verificado: <relectura OK | diferencia @ ruta:línea>.
```
O uno de: `muy-grande.` / `requiere-confirmar.` / `ambiguo.` / `regresion.` (primera palabra terminal).

**`cuadrilla-revisor`**
```
ruta:línea: <emoji> <severidad>: <problema>. <arreglo>.
totales: N🔴 N🟡 N🔵 N❓
```
O `Sin problemas.` Hallazgos ordenados por archivo y luego por línea ascendente.

## Patrones de encadenado

**Localizar → arreglar → verificar** (el más común):
1. `cuadrilla-investigador` devuelve la lista de sitios.
2. El hilo principal elige 1-2 sitios y pasa las rutas a `cuadrilla-constructor`.
3. `cuadrilla-revisor` audita el diff.

**Exploración en paralelo** (cuando la búsqueda es amplia):
Lanza 2-3 `cuadrilla-investigador` en un mismo mensaje (ángulos distintos: definiciones, llamadas, tests). Junta los resultados en el hilo principal.

**Edición directa** (cuando ya conoces el sitio):
Sáltate el investigador. Pasa la `ruta:línea` exacta a `cuadrilla-constructor`.

## Qué NO hacer

- No aceptes ni rechaces una afirmación de ausencia de un subagente (`Sin resultados.`, `Sin problemas.`, "falta la sección", "sin cambios") sin un chequeo puntual del archivo, el alcance de búsqueda o el diff. Comprueba que los números de línea citados existan en el archivo antes de actuar.
- No uses `cuadrilla-constructor` si no conoces el archivo. Lanza antes el investigador, o el hilo principal gastará tokens pasando contexto.
- No encadenes `cuadrilla-investigador → cuadrilla-constructor` para un refactor de 5 archivos. El constructor devolverá `muy-grande.` y habrás perdido un turno.
- No le pidas a `cuadrilla-revisor` "opinión general": devuelve solo hallazgos, sin opiniones de arquitectura. Usa `Code Reviewer` para eso si está instalado.
- No esperes prosa. La salida de la cuadrilla es estructurada y a veces muy escueta. Si la va a leer una persona, reformúlala.

## Claridad automática (heredada)

Los subagentes pasan de cavernícola a español normal en advertencias de seguridad, confirmaciones de acciones irreversibles y cualquier salida donde un fragmento ambiguo se pueda malinterpretar. Después retoman cavernícola.
