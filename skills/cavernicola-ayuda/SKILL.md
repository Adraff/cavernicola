---
name: cavernicola-ayuda
description: >
  Tarjeta de referencia rápida de las skills de cavernicola y sus comandos.
  Usar con /cavernicola-ayuda o "ayuda cavernícola".
---

# Ayuda cavernícola

Muestra esta tarjeta al invocarla. Una sola vez: NO cambies de modo, no escribas archivos de estado, no guardes nada. Responde en estilo cavernícola.

## Modos

| Modo | Comando | Qué cambia |
|------|---------|------------|
| **cavernicola** | `/cavernicola` | La voz. Respuesta primero, sin relleno, todo dato intacto. Por defecto. |
| **cavernicola-extremo** | `/cavernicola-extremo` (alias `/cavernicola extremo`) | Sin gramática. Fragmentos, una palabra cuando basta, cada dato una vez. |

El modo dura hasta que se cambie o termine la sesión.
`/cavernicola status` (o `estado`) informa el modo actual sin cambiarlo. En Claude Code lo leen los hooks; en otros hosts se responde según la conversación y se marca `(este host no lo registra)`.

## Skills

| Skill | Comando | Qué hace |
|-------|---------|----------|
| **cavernicola-commit** | `/cavernicola-commit` | Mensajes de commit breves. Conventional Commits. Asunto ≤50 caracteres. |
| **cavernicola-revision** | `/cavernicola-revision` | Comentarios de PR de una línea: `L42: bug: user null. Agregar guarda.` |
| **cavernicola-comprimir** | `/cavernicola-comprimir <archivo>` | Comprime archivos .md a prosa cavernícola. Guarda copia legible. |
| **cavernicola-stats** | `/cavernicola-stats` | Tokens de salida registrados en la sesión, por modo. |
| **cavernicola-explorar** | — | Explorador de repo de solo lectura. Devuelve citas `ruta:línea`. |
| **cuadrilla** | — | Cuándo delegar en los agentes `cuadrilla-investigador`, `cuadrilla-constructor`, `cuadrilla-revisor`. |
| **cavernicola-ayuda** | `/cavernicola-ayuda` | Esta tarjeta. |

## Apagar

Di "basta cavernícola", "/cavernicola off" o "modo normal". Vuelve cuando quieras con `/cavernicola`.

## Idioma

Siempre en español, aunque el texto citado o el contexto esté en otro idioma. Términos técnicos, código, comandos, tipos de commit y errores exactos quedan tal cual, salvo que el usuario pida traducirlos.

## Modo por defecto

Por defecto = `cavernicola`. Para cambiarlo:

**Variable de entorno** (máxima prioridad):
```bash
export CAVERNICOLA_DEFAULT_MODE=cavernicola-extremo
```

**Archivo de configuración** (`~/.config/cavernicola/config.json`; en Windows `%APPDATA%\cavernicola\config.json`):
```json
{ "defaultMode": "cavernicola-extremo" }
```

Para activación manual en Claude Code, pon `defaultMode` en `manual`. Las sesiones arrancan apagadas; `/cavernicola` o "modo cavernícola" lo activan. `manual` es una política de arranque, no un modo.

Pon `"off"` para impedir la activación automática y la del comando sin argumento. Usa `"manual"` cuando `/cavernicola` solo deba activarlo.

Resolución: variable de entorno > config del repo (`.cavernicola.json`) > config del usuario > `cavernicola`.

## Más

Repo: https://github.com/Adraff/cavernicola (fork de https://github.com/JuliusBrussee/caveman)
