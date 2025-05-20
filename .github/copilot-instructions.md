# Copilot Project Instructions

Este proyecto es un juego de ajedrez online con el siguiente stack:

- **Frontend:** TypeScript, React (`frontend/`)
- **Backend:** NestJS con WebSockets (`backend/`)

## Directrices Generales
- Usa TypeScript en todo el código (frontend y backend).
- Sigue buenas prácticas de estructura, modularidad y reutilización de código.
- Utiliza Prettier y ESLint para formateo y linting.
- Escribe tests unitarios e integrados para la lógica crítica.

## Frontend (React)
- Usa componentes funcionales y hooks de React.
- Implementa una UI de tablero de ajedrez que permita mover piezas (drag-and-drop o click).
- Conéctate al backend usando WebSockets para actualizaciones en tiempo real.
- Gestiona el estado del juego (tablero, movimientos, temporizadores, etc.) con React state o una librería de gestión de estado si es necesario.
- Muestra información de jugadores, historial de movimientos y estado de la partida.
- Asegura diseño responsivo para escritorio y móvil.
- Las imagenes de las piezas y tablero estan en `frontend/src/assets/` y deben ser usadas desde ahí.

## Backend (NestJS)
- Usa módulos, controladores y servicios de NestJS para una arquitectura limpia.
- Implementa gateways de WebSocket para comunicación en tiempo real.
- Gestiona el estado de la partida, sesiones de jugadores y validación de movimientos en el servidor.
- Usa una librería de ajedrez para la lógica y validación de movimientos.
- Soporta múltiples partidas concurrentes y emparejamiento de jugadores.
- Proporciona endpoints REST para gestión de usuarios, historial de partidas, etc. si es necesario.

## Comunicación WebSocket
- Define tipos de mensajes claros para la comunicación cliente-servidor (unirse a partida, mover pieza, actualizar estado, etc.).
- Maneja eventos de conexión, desconexión y errores de forma robusta.

## Testing
- Escribe tests unitarios para servicios backend y componentes frontend.
- Añade tests end-to-end para los flujos críticos.

## Notas Adicionales
- Documenta las APIs públicas y los formatos de mensajes WebSocket.
- Usa variables de entorno para configuración (URLs, puertos, etc.).
- Mantén el código y dependencias actualizados.
