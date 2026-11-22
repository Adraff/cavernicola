# 🪨 cavernicola

> **Fork de / Fork of [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman).** Adaptación al español del plugin *caveman* para Claude Code. / Spanish adaptation of the *caveman* Claude Code plugin.

[Español](#español) · [English](#english)

---

## Español

**cavernicola** es un plugin para Claude Code que hace que Claude responda en español **breve y directo**: respuesta primero, sin relleno, con todo el contenido técnico intacto. Además trae herramientas para commits, revisiones de código, compresión de archivos de memoria y agentes que devuelven resultados comprimidos.

### Origen y autoría

Este proyecto es un **fork de [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman)** (versión 4.1.0), con licencia Apache-2.0. Todo el crédito de la idea y del código original es de Julius Brussee. El porteo al español lo hizo Claude (Anthropic).

Qué se tomó del original:
- Las skills de voz, commit, revisión, ayuda, estadísticas, compresión y exploración, y la skill de la cuadrilla.
- Los 3 agentes de la cuadrilla.
- Los hooks de Node.js que activan el modo al abrir la sesión y guardan el modo de cada sesión, y los scripts de la barra de estado.
- El script de compresión en Python, con su validación y su detección de secretos.
- Los tests correspondientes, adaptados.

Qué cambió:
- Todos los textos de las skills y los agentes están reescritos en español, con reglas y ejemplos pensados para el español (artículos, muletillas, rodeos).
- Los hooks entienden frases en español: "modo cavernícola", "sé conciso", "sin relleno", "basta cavernícola", "modo normal"... También siguen entendiendo las frases en inglés.
- El modo `megacave` (chino clásico) se quitó porque no aplica al español.
- Los nombres cambiaron para no chocar con caveman: archivos `.cavernicola-*`, variables `CAVERNICOLA_*` y config en `~/.config/cavernicola/`.

Qué **no** se incluye: el proxy, el motor, la CLI, la extensión de navegador, el servicio en la nube (Caveman Cloud), las integraciones con otros editores (Cursor, Codex, Gemini, opencode…) ni el instalador independiente. Son infraestructura, no texto, y no tiene sentido traducirlos.

### Instalación (Claude Code)

Requiere [Node.js](https://nodejs.org) 18 o superior para los hooks, y Python 3 para `/cavernicola-comprimir`.

En Claude Code:

```
/plugin marketplace add Adraff/cavernicola
/plugin install cavernicola@cavernicola
```

Reinicia la sesión. El modo cavernícola se activa solo al empezar.

> Si también tienes **caveman** instalado, desactívalo. Si no, los dos plugins le dan instrucciones al modelo al mismo tiempo.

### Comandos

| Comando | Qué hace |
|---|---|
| `/cavernicola` | Activa la voz cavernícola (por defecto) |
| `/cavernicola extremo` o `/cavernicola-extremo` | Compresión máxima: fragmentos, cada dato una vez |
| `/cavernicola status` (o `estado`) | Muestra el modo activo |
| `/cavernicola off` | Apaga el modo (también: "basta cavernícola", "modo normal") |
| `/cavernicola-commit` | Mensaje de commit breve (Conventional Commits, en español) |
| `/cavernicola-revision` | Revisión de código: una línea por hallazgo |
| `/cavernicola-comprimir <archivo>` | Comprime un `.md` (por ejemplo `CLAUDE.md`) y guarda una copia legible |
| `/cavernicola-stats` | Tokens de salida registrados en la sesión, por modo |
| `/cavernicola-ayuda` | Tarjeta de referencia |

También se activa con frases como "modo cavernícola", "habla como cavernícola", "sé conciso" o "sin relleno".

**Agentes de la cuadrilla:** `cuadrilla-investigador` busca código y devuelve `ruta:línea`. `cuadrilla-constructor` hace ediciones de 1 o 2 archivos. `cuadrilla-revisor` revisa diffs. Los tres responden comprimido, así que gastan menos contexto.

### Configuración

Modo por defecto: variable `CAVERNICOLA_DEFAULT_MODE`, `.cavernicola.json` en el repo o `~/.config/cavernicola/config.json` (`%APPDATA%\cavernicola\config.json` en Windows):

```json
{ "defaultMode": "cavernicola-extremo" }
```

Valores: `cavernicola`, `cavernicola-extremo`, `manual` (arranca apagado; se activa con `/cavernicola`) u `off`.

### Ejemplo

- **Normal:** "Lo que ocurre es que cada vez que el componente se renderiza se crea un objeto nuevo, y por eso React piensa que la prop cambió y vuelve a renderizar el hijo. Para solucionarlo puedes envolver el valor en useMemo."
- **Cavernícola:** "Objeto nuevo en cada render, así que React re-renderiza el hijo. Envuelve el valor en `useMemo`."
- **Extremo:** "Objeto nuevo por render, re-render del hijo. Usar `useMemo`."

### Tests

```bash
node --test tests/*.js tests/hooks/*.mjs
python -m pytest tests
```

En Windows fallan algunos tests que crean symlinks o que quitan `node` del `PATH` de bash. Esos mismos tests también fallan en el repo original en Windows.

### Licencia

Apache-2.0. Ver [`LICENSE`](LICENSE) y [`NOTICE`](NOTICE).

---

## English

**cavernicola** is a Claude Code plugin that makes Claude answer in **short, direct Spanish**: answer first, no filler, every technical detail kept. It also ships tools for commits, code reviews, memory-file compression, and agents that return compressed results.

### Origin and authorship

This project is a **fork of [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman)** (version 4.1.0), licensed under Apache-2.0. All credit for the original idea and code goes to Julius Brussee. The Spanish port was done by Claude (Anthropic).

Taken from upstream: the voice, commit, review, help, stats, compress and explore skills, the crew skill and its 3 agents, the Node.js hooks (session-start activation, per-session mode tracking, statusline), the Python compression script with its validation and secret detection, and the matching tests (adapted).

Changed: every skill and agent text is rewritten in Spanish, with Spanish-specific rules and examples. The hooks understand Spanish phrases ("modo cavernícola", "sé conciso", "basta cavernícola", "modo normal"…) as well as the English ones. The `megacave` (Classical Chinese) mode was removed. Names were changed so they don't collide with caveman: `.cavernicola-*` files, `CAVERNICOLA_*` env vars, and config in `~/.config/cavernicola/`.

**Not** included: the proxy, engine, CLI, browser extension, Caveman Cloud, the integrations for other editors and the standalone installer.

### Install (Claude Code)

Requires Node.js 18+ (hooks) and Python 3 (`/cavernicola-comprimir`).

```
/plugin marketplace add Adraff/cavernicola
/plugin install cavernicola@cavernicola
```

If caveman is also installed, disable it so the two plugins don't both instruct the model.

### License

Apache-2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
