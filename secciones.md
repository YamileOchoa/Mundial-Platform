# Mundialito — Mapa de Secciones Frontend

> Base: FastAPI backend en `/backend`. Cada sección está justificada por endpoints reales.
> Las rutas marcadas con `[AUTH]` requieren JWT. Las marcadas `[ADMIN]` requieren `es_admin_global = true`.

---

## Mapa de rutas

| Ruta | Página | Auth |
|------|--------|------|
| `/` | Landing | Pública |
| `/login` | Login | Pública |
| `/register` | Register | Pública |
| `/home` | Dashboard | [AUTH] |
| `/rooms` | Mis Salas | [AUTH] |
| `/rooms/:id` | Detalle de Sala | [AUTH] |
| `/rooms/:roomId/matches/:matchId` | Detalle de Partido | [AUTH] |
| `/predictions` | Mis Predicciones | [AUTH] |
| `/leaderboard` | Ranking Global | [AUTH] |
| `/rewards` | Mis Recompensas | [AUTH] |
| `/profile` | Mi Perfil | [AUTH] |
| `/chat` | Chat IA | [AUTH] |
| `/admin` | Panel Admin | [AUTH][ADMIN] |

---

## 1. Landing — `/`

Página pública. Objetivo: explicar la app y llevar al usuario a registrarse.

### S1 — Navbar pública
- Logo + nombre "Mundialito"
- Botones: `Iniciar sesión` → `/login` | `Registrarse` → `/register`

### S2 — Hero
- Título: "Predice el Mundial 2026"
- Subtítulo + CTA principal → `/register`
- Visual: equipos o trofeo

### S3 — Cómo funciona
- 3 pasos: Crea una sala → Predice los resultados → Acumula puntos y gana sobres

### S4 — Sistema de puntuación
- Tabla visual de las 8 reglas con sus puntos (sacadas directamente de `services/scoring.py`)

| Regla | Puntos |
|-------|--------|
| Resultado exacto | 5 |
| Ganador correcto | 3 |
| Goleador acertado | 3 |
| Diferencia de goles | 2 |
| Tarjeta correcta (jugador + tipo) | 2 |
| Minuto del primer gol ±5 | 2 |
| Bonus racha 3 consecutivos | 2 |
| Predicción con +24h de anticipación | 1 |

### S5 — Recompensas
- Preview de los 4 tipos de sobres: Bronce (50 pts) / Plata (100 pts) / Oro (200 pts) / Sorpresa (racha ≥5)

### S6 — Footer
- Links: Inicio de sesión, Registrarse
- Copyright

---

## 2. Login — `/login`

### S1 — Navbar mínima
- Logo + link "¿No tienes cuenta? Regístrate"

### S2 — Card de formulario
- Campos: email, password
- Botón submit → `POST /api/auth/login`
- Link "¿Olvidaste tu contraseña?" (UI only, sin endpoint)
- Link "Crear cuenta" → `/register`

---

## 3. Register — `/register`

### S1 — Navbar mínima
- Logo + link "¿Ya tienes cuenta? Inicia sesión"

### S2 — Card de formulario
- Campos: nombre, email, password, confirmar password (validación client-side)
- Botón submit → `POST /api/auth/register`
- Link "Iniciar sesión" → `/login`

---

## 4. Dashboard — `/home` `[AUTH]`

Vista central después del login. Consolida todo lo relevante para el usuario.

### S1 — Topbar (componente global en todas las páginas AUTH)
- Logo + links: Salas | Predicciones | Ranking | Recompensas | Chat
- Avatar + menú desplegable: Mi Perfil → `/profile` | Cerrar sesión
- Badge "Admin" si `es_admin_global = true` con link a `/admin`

### S2 — Saludo + fecha
- "Hola, {nombre}" + fecha actual

### S3 — Mis Salas (resumen)
- Cards de hasta 4 salas → `GET /api/rooms/`
- Cada card: nombre, código, nro de partidos pendientes
- Botón "Ver todas" → `/rooms`

### S4 — Próximos Partidos
- Partidos `pendiente` de todas mis salas (obtenidos iterando salas + `GET /api/matches/?room_id=`)
- Cada item: equipos, sala, countdown a fecha_inicio, badge "Ya predije" / botón "Predecir" → `/rooms/:roomId/matches/:matchId`

### S5 — Mi Posición Global
- Card con mi ranking en el leaderboard global → `GET /api/leaderboard/global`
- Datos: posición #N, puntos totales, racha actual

### S6 — Últimas Recompensas
- Los sobres obtenidos recientemente → `GET /api/rewards/my`
- Si no hay, mostrar "Aún no tienes sobres — ¡sigue prediciendo!"

---

## 5. Mis Salas — `/rooms` `[AUTH]`

### S1 — Topbar

### S2 — Header de sección
- Título "Mis Salas"
- Botón "Crear sala" → abre Modal Crear
- Botón "Unirse con código" → abre Modal Unirse

### S3 — Grid de Salas
- Cards: nombre, código de invitación (con botón copiar), admin badge si eres el admin, nro de miembros, nro de partidos
- Cada card es clickeable → `/rooms/:id`
- Fuente: `GET /api/rooms/`

### S4 — Modal: Crear Sala
- Campo: nombre de la sala
- Submit → `POST /api/rooms/`
- Al crear, la card nueva aparece en el grid

### S5 — Modal: Unirse a Sala
- Campo: código de invitación (PRED-XXXXXX)
- Submit → `POST /api/rooms/join`
- Al unirse, la sala aparece en el grid

---

## 6. Detalle de Sala — `/rooms/:id` `[AUTH]`

### S1 — Topbar

### S2 — Header de Sala
- Nombre de la sala
- Código de invitación con botón "Copiar"
- Badge "Admin de sala" si el usuario es el `admin_id`
- Fuente: `GET /api/rooms/:id`

### S3 — Tabs: Partidos | Leaderboard | Miembros

#### Tab: Partidos
- Botón "Agregar partido" (visible solo si eres admin de la sala) → abre Modal Crear Partido
- Sub-sección **Pendientes**: partidos con estado `pendiente`, countdown, btn "Predecir" o badge "Ya predijiste"
- Sub-sección **En Curso**: partidos con estado `en_curso` (solo visual, no se puede predecir)
- Sub-sección **Terminados**: partidos con marcador final + mis puntos ganados en ese partido
- Fuente: `GET /api/matches/?room_id=:id`
- Modal Crear Partido: equipo_local, equipo_visita, fecha_inicio → `POST /api/matches/`

#### Tab: Leaderboard de Sala
- Tabla: posición, nombre, puntos, racha
- Fuente: `GET /api/leaderboard/room/:id`

#### Tab: Miembros
- Lista de miembros: avatar (inicial del nombre), nombre, badge "Admin" si es admin_id
- Botón "Salir de la sala" (solo para miembros no-admin) → `POST /api/rooms/:id/leave` ⚠️
- Fuente: `GET /api/rooms/:id/members` ⚠️

---

## 7. Detalle de Partido — `/rooms/:roomId/matches/:matchId` `[AUTH]`

### S1 — Topbar

### S2 — Header del Partido
- Equipos: bandera + nombre equipo local | VS | bandera + nombre equipo visita
- Fecha y hora del partido
- Badge de estado: `pendiente` / `en_curso` / `terminado`
- Marcador final si `terminado`
- Fuente: `GET /api/matches/:matchId` ⚠️

### S3A — Formulario de Predicción (solo si estado = `pendiente` y faltan >10 min)
- Score picker: goles local — goles visita (botones +/−)
- Goleador: input con autocomplete → `GET /api/players/?q=` ⚠️
- Jugador tarjeta: input con autocomplete → `GET /api/players/?q=` ⚠️
- Tipo tarjeta: selector Amarilla / Roja
- Minuto del primer gol: input numérico
- Botón "Confirmar predicción" → `POST /api/predictions/`
- Si ya existe predicción del usuario: mostrar predicción existente + botón "Editar" → `PUT /api/predictions/:id` ⚠️

### S3B — Partido en Curso (estado = `en_curso`)
- "Ventana de predicciones cerrada"
- Mostrar mi predicción si la hice

### S3C — Resultado Final (estado = `terminado`)
- Marcador real
- Mi predicción vs resultado real (comparativa visual)
- Desglose de puntos ganados por regla → `GET /api/score-history/?match_id=:id` ⚠️
- Total de puntos ganados en este partido

### S4 — Panel Admin de Partido (visible solo si `es_admin_global = true` y estado ≠ `terminado`)
- Botón "Marcar como En Curso" → `PATCH /api/admin/matches/:id/status` ⚠️
- Formulario registrar resultado: goles_local, goles_visita, goleador_real, jugador_tarjeta_real, tipo_tarjeta_real, minuto_primer_gol
- Botón "Registrar resultado" → `PUT /api/admin/matches/:id/result`

---

## 8. Mis Predicciones — `/predictions` `[AUTH]`

### S1 — Topbar

### S2 — Header + Filtros
- Título "Mis Predicciones"
- Filtro por sala (dropdown con mis salas)
- Filtro por estado del partido: Pendiente | En Curso | Terminado

### S3 — Lista de Predicciones
- Cada item: equipos, sala, mi predicción de score, resultado real (si terminó), puntos ganados, reglas que aplicaron
- Fuente: `GET /api/predictions/my` + match data
- Fuente desglose: `GET /api/score-history/my` ⚠️

---

## 9. Leaderboard Global — `/leaderboard` `[AUTH]`

### S1 — Topbar

### S2 — Mi Posición (card destacada)
- Mi posición #N, mis puntos, mi racha actual
- Resaltado visualmente del resto de la tabla

### S3 — Tabla General
- Posición, avatar (inicial), nombre, puntos totales, racha actual
- La fila del usuario actual queda resaltada aunque se scrollee
- Fuente: `GET /api/leaderboard/global`

---

## 10. Mis Recompensas — `/rewards` `[AUTH]`

### S1 — Topbar

### S2 — Sobres Obtenidos
- Cards para cada sobre ganado: ícono por tipo, fecha obtenida, botón "Descargar PDF"
- Botón PDF → `GET /api/rewards/:id/pdf`
- Fuente: `GET /api/rewards/my`

### S3 — Progreso hacia Próximos Sobres
- Barra de progreso: mis puntos / 50 pts → Bronce
- Barra de progreso: mis puntos / 100 pts → Plata
- Barra de progreso: mis puntos / 200 pts → Oro
- Indicador de racha: mi racha actual / 5 → Sorpresa
- Los sobres ya obtenidos aparecen como "desbloqueados"
- Fuente de puntos/racha: `GET /api/leaderboard/global` (filtrando mi entry)

---

## 11. Mi Perfil — `/profile` `[AUTH]`

### S1 — Topbar

### S2 — Card de Perfil
- Avatar (inicial del nombre o foto_url si existe)
- Nombre, email, fecha de registro
- Fuente: `GET /api/users/me`

### S3 — Formulario Editar Perfil
- Campo nombre, campo foto_url (URL de imagen)
- Botón "Guardar cambios" → `PUT /api/users/me`

### S4 — Mis Stats
- Total predicciones realizadas
- Partidos con ganador correcto (% de aciertos)
- Puntos totales acumulados
- Racha actual
- Fuente: `GET /api/users/me/stats` ⚠️

---

## 12. Chat IA — `/chat` `[AUTH]`

### S1 — Topbar

### S2 — Header del Chat
- Título "Asistente Mundial IA"
- Contador: "X mensajes restantes hoy" (actualizado con cada respuesta del campo `usos_restantes`)

### S3 — Área de Conversación
- Burbujas de mensajes: usuario (derecha) | IA (izquierda)
- Scroll automático al último mensaje
- Estado vacío: "Pregúntame sobre equipos, jugadores o predicciones del Mundial"

### S4 — Selector de Contexto (opcional)
- Dropdown: "¿Sobre qué partido quieres preguntar?" → llena el campo `match_id` del request
- Fuente: `GET /api/matches/?room_id=` de mis salas

### S5 — Input
- Campo de texto + botón enviar → `POST /api/chat/message`
- Deshabilitado si `usos_restantes = 0` con mensaje "Límite diario alcanzado"

---

## 13. Panel Admin — `/admin` `[AUTH][ADMIN]`

### S1 — Topbar (con badge "Admin Global")

### S2 — Tabs: Partidos | Usuarios | Salas

#### Tab: Partidos
- Filtro por estado: Todos | Pendiente | En Curso | Terminado
- Tabla: sala, equipos, fecha, estado, acción
- Acción "Marcar en curso" → `PATCH /api/admin/matches/:id/status` ⚠️
- Acción "Registrar resultado" (modal): goles, goleador, tarjeta, minuto → `PUT /api/admin/matches/:id/result`
- Fuente: `GET /api/admin/matches/`

#### Tab: Usuarios
- Tabla: id, nombre, email, es_admin_global, fecha registro
- Acción "Promover a Admin" → `PUT /api/admin/users/:id/make-admin`
- Acción "Eliminar" (con confirmación) → `DELETE /api/admin/users/:id`
- Fuente: `GET /api/admin/users/`

#### Tab: Salas
- Tabla: id, nombre, código, admin, fecha creación
- Acción "Eliminar" (con confirmación) → `DELETE /api/admin/rooms/:id`
- Fuente: `GET /api/admin/rooms/`

---

## Endpoints faltantes en el backend

Estos endpoints **no existen** en el backend actual pero son necesarios para que el frontend quede completo y limpio. Sin ellos hay secciones que no se pueden implementar o quedan incompletas.

### Bloquea funcionalidad crítica

| # | Método + Ruta | Para qué sección | Descripción |
|---|---------------|------------------|-------------|
| 1 | `GET /api/matches/{match_id}` | Detalle de Partido (S2) | Obtener un partido por ID. Actualmente solo existe `GET /matches/?room_id=`. La página de detalle necesita un partido individual. |
| 2 | `GET /api/rooms/{room_id}/members` | Detalle de Sala — Tab Miembros | Listar los miembros de una sala. La tabla `room_members` existe pero no tiene endpoint GET. |
| 3 | `POST /api/rooms/{room_id}/leave` | Detalle de Sala — Tab Miembros | Salir de una sala. El usuario no puede abandonar una sala desde el frontend. |
| 4 | `GET /api/score-history/my` | Mis Predicciones (S3) | Historial de puntos del usuario autenticado. Necesario para mostrar qué reglas aplicaron en cada partido. |
| 5 | `GET /api/users/me/stats` | Perfil (S4) | Stats calculados: total predicciones, % aciertos, puntos, racha. Actualmente `GET /users/me` solo devuelve datos básicos del modelo. |

### Mejora experiencia de usuario

| # | Método + Ruta | Para qué sección | Descripción |
|---|---------------|------------------|-------------|
| 6 | `GET /api/players/?q={texto}` | Detalle de Partido — Form Predicción | Autocompletar jugadores para `goleador_pred` y `jugador_tarjeta_pred`. La tabla `Player` existe en la DB pero no tiene ningún endpoint. Sin esto el usuario escribe a mano y hay riesgo de errores de coincidencia con el `goleador_real`. |
| 7 | `PUT /api/predictions/{prediction_id}` | Detalle de Partido — Form Predicción | Editar predicción existente. Actualmente si ya existe una predicción el backend devuelve 400 y el usuario no puede corregirla. Solo debe permitirse si `estado = pendiente` y faltan >10 min. |
| 8 | `GET /api/score-history/?match_id={id}` | Detalle de Partido (S3C) | Desglose de puntos de un partido específico para el usuario autenticado. Para mostrar "ganaste 5 pts por resultado exacto + 1 pt por anticipación" en la vista de partido terminado. |
| 9 | `PATCH /api/admin/matches/{match_id}/status` | Detalle de Partido (S4) + Admin Tab Partidos | Cambiar estado a `en_curso`. El enum `MatchStatus` tiene ese valor pero nunca se usa porque actualmente el partido pasa directo de `pendiente` a `terminado`. Esto bloquea la barra de progreso visual del partido. Body: `{ "estado": "en_curso" }` |

### Robustez

| # | Método + Ruta | Para qué sección | Descripción |
|---|---------------|------------------|-------------|
| 10 | `POST /api/auth/refresh` | Global | Refresh del JWT antes de que expire (TTL actual: 24h). Sin esto el usuario es expulsado cada día. Body: `{ "refresh_token": "..." }` — requiere también emitir un refresh token en el login. |

---

## Notas de consistencia

- **Leaderboard global con multi-sala**: `GET /api/leaderboard/global` devuelve un row por `(user, sala)`. Si un usuario está en 3 salas aparece 3 veces. El backend debe sumar los puntos de todas las salas del usuario antes de devolver el ranking. Esto es un bug en `leaderboard.py` que hay que corregir antes de construir la UI de ranking.

- **`MatchResponse` no expone campos de resultado**: El schema actual no devuelve `goleador_real`, `jugador_tarjeta_real`, `tipo_tarjeta_real`, `minuto_primer_gol`. La página de Detalle de Partido necesita esos campos para mostrar el resultado real. Hay que ampliar `MatchResponse` o crear un `MatchDetailResponse`.

- **Foto de perfil**: `foto_url` es una URL libre. Si se quiere subir imágenes reales hace falta un endpoint `POST /api/users/me/avatar` con `multipart/form-data` y almacenamiento (similar al `/media` que ya existe para PDFs). Por ahora se puede dejar como URL externa sin bloquear el desarrollo.
