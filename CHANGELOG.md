# Changelog

Todas las versiones del plugin `cavernicola`. Cada una se publica también como release en GitHub.

## [2.0.1] — 2026-11-27

### Instalación corregida
- **Causa del problema:** al pegar el repositorio y pedirle a Claude que lo instale, no había instrucciones para Claude, y los comandos `/plugin` no funcionan en la app de escritorio. Claude terminaba copiando solo la carpeta de la skill principal: sin los hooks que activan el modo, sin las otras 8 skills y sin los 3 agentes. Además, si faltaba Node.js, los hooks no hacían nada y no avisaban.
- El README ahora tiene la sección **Instrucciones de instalación (para Claude)**:
  - Deja claro que es un plugin y prohíbe copiar la carpeta de la skill suelta.
  - Incluye una tabla de requisitos que separa lo obligatorio (Node.js 18 o superior; Git Bash en Windows) de lo opcional (Python 3 y un proveedor de modelo, solo para `/cavernicola-comprimir`).
  - Revisa el entorno (solo lectura) antes de hacer nada, y detecta si caveman está activo.
  - Si falta Node.js, ofrece instalarlo con confirmación explícita.
  - Prueba cuatro caminos de instalación en orden: el comando `claude`, editar la configuración de Claude Code (sin terminal, con copia de respaldo), controlar la computadora con permiso y una guía manual.
  - Pregunta "¿Quieres que lo haga por ti?" antes de cambiar algo, se detiene ante permisos de administrador o contraseñas e informa cada paso.
  - Incluye una verificación final de 3 pasos y el diagnóstico de la falla más común (falta Node.js o Git Bash).
- La funcionalidad del plugin no cambia.

## [2.0.0] — 2026-11-21

- Porteo al español de caveman 4.1.0 como plugin completo: 9 skills, 3 agentes de la cuadrilla, hooks de Node.js, scripts de barra de estado y compresión en Python, con sus tests.
