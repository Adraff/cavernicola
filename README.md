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

### Instalación rápida

Pega esto en el chat de Claude Code:

> Instala el plugin de este repositorio: https://github.com/Adraff/cavernicola

Claude sigue las instrucciones de la sección de abajo.

### Instrucciones de instalación (para Claude)

> Claude: sigue estos pasos al pie de la letra cuando el usuario te pida instalar cavernicola. La persona que lo instala puede no saber nada técnico: háblale simple y no le pidas que haga nada que puedas hacer tú.

**Importante: esto es un plugin, no una skill suelta.** Trae 9 skills, 3 agentes y 4 hooks que activan el modo al abrir cada sesión. **No copies la carpeta `skills/cavernicola` a `~/.claude/skills/`:** quedaría solo la voz, sin activación automática, sin los demás comandos y sin los agentes. Instálalo siempre como plugin, con uno de los caminos de abajo.

**Qué necesita:**

| Requisito | Para qué | ¿Obligatorio? |
|---|---|---|
| Claude Code (CLI, app de escritorio o extensión de IDE) | Todo | Sí |
| [Node.js](https://nodejs.org) 18 o superior | Los hooks: activar el modo al abrir la sesión, seguir el modo, estadísticas | Sí. Sin Node, el plugin se instala, pero el modo no se activa solo y **no muestra ningún error** |
| En Windows: Git for Windows (Git Bash) | Claude Code ejecuta los hooks con bash | Sí, en Windows. Claude Code normalmente ya lo exige |
| Python 3 | Solo `/cavernicola-comprimir` | No |
| La CLI `claude` en el PATH, o `ANTHROPIC_API_KEY` más `pip install anthropic` | Solo `/cavernicola-comprimir`, que envía el archivo a un modelo para comprimirlo | No |

No hay dependencias de npm ni de pip que instalar para el uso normal.

#### Reglas durante toda la instalación
- **Nunca actúes a ciegas.** Primero revisa el entorno (paso A, que solo lee). Antes de cambiar algo, di en una frase qué vas a hacer y pregunta: **"¿Quieres que lo haga por ti?"**. Actúa solo con un sí explícito.
- **Pide confirmación aparte** antes de instalar cualquier programa (Node.js, Python) o cambiar configuraciones del sistema operativo.
- **Si un paso pide permisos de administrador o una contraseña, detente** y pídele al usuario que lo haga él. Nunca escribas contraseñas.
- **No modifiques nada fuera de lo necesario.** Antes de editar un archivo de configuración, guarda una copia de respaldo y agrega solo lo indicado, sin borrar lo que ya tenga.
- **Informa cada paso y su resultado** en una línea.
- **Terminas cuando** el usuario confirma que funciona (ver **Verificar**), o cuando le explicas en lenguaje simple qué falló y qué falta.

#### A. Revisa el entorno (solo lectura, sin preguntar)
1. `node --version`: ¿existe y es 18 o superior? Si no, ve al **paso B** antes de instalar el plugin.
2. Solo en Windows: ¿existe Git Bash (por ejemplo `where bash` o `C:\Program Files\Git\bin\bash.exe`)?
3. `python --version` o `python3 --version`: anótalo. Solo hace falta para `/cavernicola-comprimir`.
4. ¿Hay otro plugin **caveman** activado? Búscalo en `enabledPlugins` dentro de `~/.claude/settings.json`. Si está, avísale al usuario que conviene desactivarlo, porque los dos plugins darían instrucciones al mismo tiempo, y desactívalo solo si acepta.
5. Elige el camino de instalación: si funciona `claude --version`, el **camino 1**; si puedes leer y escribir archivos en `~/.claude/` (`%USERPROFILE%\.claude\` en Windows), el **camino 2**; si tienes herramientas para controlar la computadora (*computer use*, por ejemplo `mcp__computer-use__*`), el **camino 3**; si no, el **camino 4**.

Prueba los caminos en ese orden. Si uno falla, pasa al siguiente y explícale al usuario por qué en una frase.

#### B. Si falta Node.js
Explícale que sin Node.js el modo cavernícola no se activa solo y pregunta: *"¿Quieres que instale Node.js por ti? Es un programa gratuito y oficial, y puede pedirte permisos de administrador."* Con su sí:
- Windows: `winget install OpenJS.NodeJS.LTS`
- macOS: `brew install node` (si no hay Homebrew, usa el instalador de https://nodejs.org)
- Linux: el gestor de paquetes de la distribución, o el instalador de https://nodejs.org

Si pide contraseña o permisos de administrador, detente y deja que el usuario lo haga. Después comprueba `node --version`. Puede hacer falta abrir una sesión nueva para que aparezca en el PATH.

#### Camino 1 — Con el comando `claude`
Pregunta si quieres hacerlo por él y, con su sí, ejecuta:
```bash
claude plugin marketplace add Adraff/cavernicola
claude plugin install cavernicola@cavernicola
```
Como alcance, elige **user**. Después ve a **Verificar**.

#### Camino 2 — Editando la configuración de Claude Code (no necesita terminal)
1. Pregunta: *"¿Quieres que lo haga por ti? Voy a agregar cavernicola a la configuración de Claude Code (archivo `~/.claude/settings.json`), con una copia de respaldo."*
2. Con su sí, guarda una copia en `~/.claude/settings.json.bak-cavernicola`. Si el archivo no existe, créalo con `{}`.
3. Agrega estas entradas **conservando todo lo demás**. Si `extraKnownMarketplaces` o `enabledPlugins` ya existen, agrégale la clave nueva a cada uno:
   ```json
   {
     "extraKnownMarketplaces": {
       "cavernicola": { "source": { "source": "github", "repo": "Adraff/cavernicola" } }
     },
     "enabledPlugins": { "cavernicola@cavernicola": true }
   }
   ```
4. Comprueba que el archivo sigue siendo un JSON válido. Si no lo es, restaura la copia y pasa al camino 3.
5. Pídele al usuario que abra una **sesión nueva** de Claude Code: al arrancar, Claude Code descarga e instala el plugin. Después ve a **Verificar**.

#### Camino 3 — Controlando la computadora (solo con permiso)
1. Pregunta: *"No puedo instalarlo directamente desde aquí. ¿Quieres que lo haga por ti controlando tu computadora? Voy a abrir la app de Claude y hacer los clics, contándote cada paso."*
2. Con su sí, pide acceso solo a la app de Claude (si tus herramientas lo requieren) y haz los pasos de la **guía manual** de abajo uno por uno. Antes de cada clic, toma una captura para confirmar que estás donde corresponde.
3. Si aparece algo inesperado (un permiso del sistema, una contraseña o una pantalla distinta a la guía), detente y pregúntale al usuario. Después ve a **Verificar**.

#### Camino 4 — Guía manual para el usuario
Explícale que tú no puedes instalarlo desde aquí y dale estos pasos, de a uno:
- **App de escritorio de Claude:** haz clic en **+** junto a la caja del prompt → **Plugins** → **Add marketplace** → escribe `Adraff/cavernicola` → **Add plugin** → elige `cavernicola`.
- **Claude Code en una terminal:** escribe `/plugin marketplace add Adraff/cavernicola` y después `/plugin install cavernicola@cavernicola`.

#### Verificar
En una **sesión nueva** de Claude Code:
1. Al arrancar debería aparecer brevemente *"Cargando modo cavernícola..."*, y las respuestas ya deberían ser breves.
2. El usuario escribe `/cavernicola status`: debería mostrar el modo activo.
3. Al escribir `/cavernicola-` deberían aparecer los demás comandos (`-ayuda`, `-commit`, `-revision`, `-comprimir`, `-stats`, `-extremo`, `-explorar`).

Si el paso 1 falla pero el 3 funciona, casi siempre falta Node.js o, en Windows, Git Bash (vuelve al paso A). Al terminar, avísale al usuario que puede ver todos los comandos con `/cavernicola-ayuda` y apagar el modo con "basta cavernícola".

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

### Versiones

Cada versión se publica como un [release](https://github.com/Adraff/cavernicola/releases) con la lista de cambios. El historial completo está en [CHANGELOG.md](CHANGELOG.md). Para actualizar, pídele a Claude que vuelva a instalarlo desde este repositorio.

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

Paste this into Claude Code: *"Install the plugin from this repository: https://github.com/Adraff/cavernicola"*. Claude follows the step-by-step section **Instrucciones de instalación (para Claude)** above.

This is a **plugin, not a standalone skill**: install it as a plugin, never by copying `skills/cavernicola` alone. It requires Node.js 18+ for the hooks, which fail silently without it, and Git Bash on Windows. Python 3 is optional and only needed for `/cavernicola-comprimir`.

```
/plugin marketplace add Adraff/cavernicola
/plugin install cavernicola@cavernicola
```

If caveman is also installed, disable it so the two plugins don't both instruct the model.

### Versions

Every version is published as a [release](https://github.com/Adraff/cavernicola/releases); see [CHANGELOG.md](CHANGELOG.md).

### License

Apache-2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
