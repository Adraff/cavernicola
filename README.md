# 🪨 cavernicola

[Español](#español) · [English](#english)

---

## Español

**cavernicola** es una skill para Claude que hace que responda en español **breve y directo**, para gastar menos tokens sin perder contenido técnico.

### Origen y autoría

Este proyecto es una **adaptación derivada (fork) de [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman)**, licenciado bajo Apache-2.0. El **porteo al español está hecho 100 % por Claude** (Anthropic).

Aclaraciones:
- No es un fork de GitHub con historial compartido: es una reescritura independiente.
- Se hizo a partir de la descripción pública del README del proyecto original. **No se leyó su `SKILL.md`**, así que las reglas son una interpretación y pueden diferir de las originales.
- Todo el crédito de la idea original es de su autor. Este repo conserva la licencia Apache-2.0 (ver `LICENSE` y `NOTICE`).
- Solo se porta la parte de la voz concisa ("say less"). Las demás herramientas del proyecto original (compresión de logs, proxy, CLI, etc.) **no** están incluidas.

### Instalación

Copia la carpeta `skills/cavernicola` a tu carpeta de skills. En Claude Code, por ejemplo:

```bash
git clone https://github.com/<tu-usuario>/cavernicola
mkdir -p ~/.claude/skills
cp -r cavernicola/skills/cavernicola ~/.claude/skills/
```

### Uso

| Comando | Qué hace |
|---|---|
| `/cavernicola` | Activa el modo estándar |
| `/cavernicola extremo` | Activa el modo extremo |
| `/cavernicola status` | Muestra el nivel activo |
| `/cavernicola off` | Vuelve al estilo normal (también: "modo normal") |

También se activa con frases como "modo cavernícola", "sé conciso" o "sin relleno".

### Reglas principales

1. Respuesta primero, sin saludos ni resumen final.
2. Una idea por oración, voz activa.
3. Se pueden omitir artículos, pero nunca negaciones ni cifras.
4. Código, comandos, rutas y errores se copian tal cual.
5. Sin narración entre pasos de herramientas.
6. Frases completas en advertencias de seguridad, acciones irreversibles o si el usuario está confundido.

### Ejemplo

- **Normal:** "Lo que ocurre es que cada vez que el componente se renderiza se crea un objeto nuevo, y por eso React piensa que la prop cambió y vuelve a renderizar el hijo. Para solucionarlo puedes envolver el valor en useMemo."
- **Estándar:** "Objeto nuevo en cada render, así que React re-renderiza el hijo. Envolver el valor en `useMemo`."
- **Extremo:** "Objeto nuevo por render → re-render del hijo. Usar `useMemo`."

### Licencia

Apache-2.0. Ver [`LICENSE`](LICENSE) y [`NOTICE`](NOTICE).

---

## English

**cavernicola** is a Claude skill that makes it answer in **short, direct Spanish** to spend fewer tokens without losing technical content.

### Origin and authorship

This project is a **derivative adaptation (fork) of [juliusbrussee/caveman](https://github.com/juliusbrussee/caveman)**, licensed under Apache-2.0. The **Spanish port was made 100% by Claude** (Anthropic).

Notes:
- It is not a GitHub fork with shared history: it is an independent rewrite.
- It was written from the original project's public README description. **Its `SKILL.md` was not read**, so the rules are an interpretation and may differ from the original.
- All credit for the original idea goes to its author. This repo keeps the Apache-2.0 license (see `LICENSE` and `NOTICE`).
- Only the concise-voice part ("say less") is ported. The original project's other tools (log compression, proxy, CLI, etc.) are **not** included.

### Installation

Copy the `skills/cavernicola` folder into your skills folder. For example, in Claude Code:

```bash
git clone https://github.com/<your-username>/cavernicola
mkdir -p ~/.claude/skills
cp -r cavernicola/skills/cavernicola ~/.claude/skills/
```

### Usage

| Command | What it does |
|---|---|
| `/cavernicola` | Turns on standard mode |
| `/cavernicola extremo` | Turns on extreme mode |
| `/cavernicola status` | Shows the active level |
| `/cavernicola off` | Back to normal style (also: "modo normal") |

It also activates with phrases such as "modo cavernícola", "sé conciso" or "sin relleno". The skill's output is in Spanish.

### Main rules

1. Answer first, no greetings or closing recap.
2. One idea per sentence, active voice.
3. Articles may be dropped, but never negations or numbers.
4. Code, commands, paths and errors are copied exactly.
5. No narration between tool calls.
6. Full sentences for security warnings, irreversible actions, or a confused user.

### Example

- **Normal:** "Lo que ocurre es que cada vez que el componente se renderiza se crea un objeto nuevo, y por eso React piensa que la prop cambió y vuelve a renderizar el hijo. Para solucionarlo puedes envolver el valor en useMemo."
- **Standard:** "Objeto nuevo en cada render, así que React re-renderiza el hijo. Envolver el valor en `useMemo`."
- **Extreme:** "Objeto nuevo por render → re-render del hijo. Usar `useMemo`."

### License

Apache-2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
