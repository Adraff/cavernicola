---
name: cavernicola-comprimir
description: >
  Comprime un archivo de memoria, como CLAUDE.md o una lista de tareas, a formato
  cavernícola para gastar menos tokens de entrada, y guarda una copia legible.
  Envía el texto del archivo al proveedor de modelo configurado. Usar con
  /cavernicola-comprimir.
---

# Cavernícola comprimir

## Para qué

> **Los datos salen de la máquina.** La compresión envía el texto completo del archivo al proveedor de modelo que tenga configurado `scripts/compress.py`: la CLI `claude`, la API de Anthropic o un endpoint compatible con OpenAI. Los archivos cuyo nombre parece de secretos (`.env`, `credentials`, `secrets`, `.netrc`, …) se rechazan antes de leerlos, y un archivo cuyo texto contiene una credencial (bloque de clave privada, token de nube, de host Git o de API de modelo) se rechaza antes de enviar nada. No comprimas un archivo que el proveedor no deba ver.

Comprime archivos de lenguaje natural (CLAUDE.md, tareas, preferencias) a prosa cavernícola para reducir tokens de entrada. La versión comprimida sobrescribe la original. La copia legible se guarda como `<archivo>.original.md`, pero NO al lado del original: vive en un directorio de datos fuera del proyecto (`$XDG_DATA_HOME/cavernicola-comprimir/backups/<carpeta-padre>/`, o `%LOCALAPPDATA%\cavernicola-comprimir\backups\<carpeta-padre>\` en Windows), para que los cargadores de skills no la vuelvan a leer como archivo activo.

## Disparador

`/cavernicola-comprimir <ruta>` o cuando el usuario pide comprimir un archivo de memoria.

**Requiere una ruta explícita.** Si el usuario pega texto en vez de nombrar un archivo, NO improvises una compresión en el chat: pide la ruta del archivo, u ofrece guardar primero el texto pegado en un archivo. Escribir tu propio razonamiento o comentario sobre el pedido dentro de la salida comprimida (por ejemplo "El usuario pasó texto directo, no una ruta...") es justo el fallo que esto evita: nunca dejes que eso llegue a un archivo guardado.

## Proceso

1. Los scripts de compresión están en `scripts/` (al lado de este SKILL.md). Si la ruta no está a mano, busca `scripts/__main__.py` junto a este SKILL.md.

2. Desde el directorio que contiene este SKILL.md, ejecuta (en Windows, `python` en lugar de `python3`):

python3 -m scripts <ruta_absoluta>

3. La CLI:
- detecta el tipo de archivo (sin tokens)
- llama a Claude para comprimir
- valida la salida (sin tokens)
- si hay errores: pide a Claude solo los arreglos puntuales, sin recomprimir
- reintenta hasta 2 veces
- si sigue fallando tras 2 reintentos: informa el error al usuario y deja el archivo original intacto

4. Devuelve el resultado al usuario, en español.

## Reglas de compresión

### Quitar
- Artículos: el, la, los, las, un, una, unos, unas (cuando la frase se sigue leyendo de una pasada)
- Relleno: simplemente, básicamente, realmente, en realidad, la verdad es que, de hecho, obviamente
- Cortesías: "claro", "por supuesto", "con gusto", "te recomiendo"
- Rodeos: "sería bueno", "podrías considerar", "conviene", "valdría la pena"
- Frases largas: "con el fin de" → "para", "asegúrate de" → acción directa, "debido al hecho de que" → "porque"
- Conectores de relleno: "sin embargo", "además", "por otro lado", "asimismo"

### Conservar EXACTO (nunca modificar)
- Bloques de código (con ``` y con sangría)
- Código en línea (`contenido entre backticks`)
- URLs y enlaces (URLs completas, enlaces markdown)
- Rutas de archivo (`/src/components/...`, `./config.yaml`)
- Comandos (`npm install`, `git commit`, `docker build`)
- Términos técnicos (nombres de librerías, APIs, protocolos, algoritmos)
- Nombres propios (proyectos, personas, empresas)
- Fechas, versiones, valores numéricos
- Variables de entorno (`$HOME`, `NODE_ENV`)
- Negaciones: no, nunca, ni, solo, salvo, sin

### Conservar estructura
- Todos los encabezados markdown (texto exacto; se comprime el cuerpo debajo)
- Jerarquía de viñetas (mismo nivel de anidado)
- Listas numeradas (misma numeración)
- Tablas (se comprime el texto de las celdas, se mantiene la estructura)
- Frontmatter YAML

### Comprimir
- Sinónimos cortos: "grande" y no "extenso", "arreglar" y no "implementar una solución para", "usar" y no "utilizar"
- Fragmentos valen: "Correr tests antes del commit" y no "Siempre deberías correr los tests antes de hacer commit"
- Quitar "deberías", "asegúrate de", "recuerda": decir la acción
- Unir viñetas que dicen lo mismo de otra forma
- Dejar un solo ejemplo cuando varios muestran el mismo patrón

REGLA CRÍTICA:
Todo lo que esté dentro de ``` ... ``` se copia EXACTO.
No:
- quitar comentarios
- quitar espacios
- reordenar líneas
- acortar comandos
- simplificar nada

El código en línea (`...`) se conserva EXACTO.
No modificar nada dentro de backticks.

Si el archivo tiene bloques de código:
- Tratarlos como zonas de solo lectura
- Comprimir solo el texto de fuera
- No fusionar secciones alrededor del código

## Patrón

Original:
> Siempre deberías asegurarte de correr la batería de tests antes de hacer push de cualquier cambio a la rama main. Esto es importante porque ayuda a detectar bugs temprano y evita que se desplieguen builds rotos a producción.

Comprimido:
> Correr tests antes de push a main. Detecta bugs temprano, evita deploys rotos en prod.

Original:
> La aplicación usa una arquitectura de microservicios con los siguientes componentes. El API gateway se encarga de todas las solicitudes entrantes y las envía al servicio correspondiente. El servicio de autenticación es responsable de gestionar las sesiones de usuario y los tokens JWT.

Comprimido:
> Arquitectura de microservicios. API gateway enruta todas las solicitudes a los servicios. Servicio de auth gestiona sesiones de usuario + tokens JWT.

## Límites

- SOLO comprimir archivos de lenguaje natural (.md, .txt, .typ, .typst, .tex, sin extensión)
- NUNCA modificar: .py, .js, .ts, .json, .yaml, .yml, .toml, .env, .lock, .css, .html, .xml, .sql, .sh
- Si el archivo mezcla prosa y código, comprimir SOLO la prosa
- Si no está claro si algo es código o prosa, dejarlo igual
- El original se respalda como ARCHIVO.original.md antes de sobrescribir, en el directorio de respaldos fuera del proyecto (ver "Para qué"), no al lado del original
- Nunca comprimir ARCHIVO.original.md (saltarlo)
