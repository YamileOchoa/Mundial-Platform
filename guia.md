# PREDIX — Guia de Instalacion y Uso

Plataforma de predicciones del Mundial de Futbol 2026. Stack: Next.js 16 + FastAPI + PostgreSQL, todo contenerizado con Docker.

---

## Requisitos previos

| Herramienta | Version minima | Descarga |
|---|---|---|
| **Docker Desktop** | 24.x | https://www.docker.com/products/docker-desktop |
| **Git** | cualquiera | https://git-scm.com |

> En Linux/Mac asegurate de que Docker Compose v2 este disponible (`docker compose version`).  
> En Windows usa Docker Desktop con WSL 2 habilitado.

---

## 1. Clonar el repositorio

```bash
git clone https://github.com/YamileOchoa/Mundial-Platform.git
cd Mundial-Platform
```

La estructura del proyecto es:

```
Mundial-Platform/          <- directorio raiz tras clonar
  backend/                 <- API (FastAPI + PostgreSQL)
  predix-frontend/         <- UI (Next.js)
  docker-compose.yml
  .env                     <- variables de entorno (ya incluido)
  guia.md                  <- este archivo
```

---

## 2. Variables de entorno

El archivo `.env` ya viene incluido con valores por defecto para desarrollo:

```env
SECRET_KEY=predix-dev-secret-key-2026-mundialito
GEMINI_API_KEY=          # opcional — chat IA con Google Gemini
```

**No necesitas modificar nada para levantar el proyecto localmente.**

> Si quieres el chat con IA, obten una clave gratuita en https://aistudio.google.com/ y pegala en `GEMINI_API_KEY`.

---

## 3. Levantar el proyecto

```bash
docker compose up --build -d
```

Este comando:
1. Descarga las imagenes base (PostgreSQL, Python, Node)
2. Construye el backend (FastAPI) y el frontend (Next.js)
3. Levanta los 3 contenedores en segundo plano

**La primera vez tarda entre 3 y 5 minutos** (descarga de imagenes + build).

### Verificar que todo este corriendo

```bash
docker compose ps
```

Deberias ver los 3 contenedores con estado `Up` o `healthy`:

```
NAME               STATUS
predix-postgres    Up (healthy)
predix-backend     Up
predix-frontend    Up
```

### Ver logs en tiempo real (opcional)

```bash
docker compose logs -f
```

---

## 4. Acceder a la aplicacion

| Servicio | URL |
|---|---|
| **Aplicacion web** | http://localhost:3000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **API ReDoc** | http://localhost:8000/redoc |

---

## 5. Crear tu cuenta y probar el sistema

### Paso 1 — Registrarse

1. Abre http://localhost:3000
2. Haz clic en **Registrarse** en la pagina de inicio
3. Completa: nombre, correo electronico y contrasena (minimo 8 caracteres)
4. Haz clic en **Crear cuenta** — seras redirigido al dashboard automaticamente

### Paso 2 — Explorar el dashboard

Una vez dentro veras:

- **Inicio** `/home` — estadisticas personales y resumen de tus salas
- **Mis Salas** `/rooms` — crea o unete a salas de prediccion
- **Predicciones** `/predictions` — historial de todas tus predicciones
- **Ranking** `/leaderboard` — clasificacion global de todos los jugadores
- **Recompensas** `/rewards` — logros desbloqueados por tus predicciones
- **Chat IA** `/chat` — asistente con contexto del Mundial (requiere GEMINI_API_KEY)
- **Perfil** `/profile` — edita tu nombre y foto de perfil

### Paso 3 — Crear una sala y predecir

1. Ve a **Mis Salas** y haz clic en **Nueva sala**
2. Ponle un nombre y crea la sala — seras el admin
3. Comparte el **codigo de invitacion** con tus amigos para que se unan
4. Como admin, puedes agregar partidos desde el detalle de la sala via la API (ver seccion 6)
5. Entra a un partido y haz tu prediccion: marcador, goleador, tarjeta, minuto del primer gol

---

## 6. Agregar partidos como administrador

Los partidos se agregan a traves de la API. Tienes dos opciones:

### Opcion A — Swagger UI (recomendado para probar)

1. Abre http://localhost:8000/docs
2. Ve a `POST /api/auth/login`, haz clic en **Try it out** e ingresa tus credenciales
3. Copia el `access_token` de la respuesta
4. Haz clic en **Authorize** (candado arriba) y pega el token con formato: `Bearer <token>`
5. Ve a `POST /api/matches/` y crea un partido:

```json
{
  "room_id": 1,
  "equipo_local": "Argentina",
  "equipo_visita": "Brasil",
  "fecha_inicio": "2026-06-15T20:00:00",
  "fase": "Grupos"
}
```

### Opcion B — curl / PowerShell

```bash
# 1. Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tu@correo.com","password":"tupassword"}'

# 2. Usar el access_token recibido para crear partido
curl -X POST http://localhost:8000/api/matches/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"room_id":1,"equipo_local":"Argentina","equipo_visita":"Brasil","fecha_inicio":"2026-06-15T20:00:00","fase":"Grupos"}'
```

---

## 7. Detener el proyecto

```bash
# Detener contenedores (mantiene los datos)
docker compose stop

# Detener y eliminar contenedores (mantiene la base de datos)
docker compose down

# Eliminar todo incluyendo la base de datos
docker compose down -v
```

---

## 8. Solucion de problemas

### Puerto 3000 o 8000 ya en uso

```bash
# Ver que proceso usa el puerto (Linux/Mac)
lsof -i :3000

# Windows
netstat -ano | findstr :3000
```

Detener el proceso o cambiar el puerto en `docker-compose.yml`.

### El frontend tarda en cargar la primera vez

Es normal — Next.js standalone puede tardar 10-15 segundos en iniciar dentro del contenedor. Espera y recarga la pagina.

### Error de base de datos al arrancar

El backend espera que PostgreSQL este listo antes de iniciar (healthcheck configurado). Si ves errores de conexion, espera 30 segundos y ejecuta:

```bash
docker compose restart backend
```

### Ver logs de un servicio especifico

```bash
docker compose logs frontend
docker compose logs backend
docker compose logs postgres
```

---

## Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Python 3.12 |
| Base de datos | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| IA | Google Gemini (opcional) |
| Contenedores | Docker + Docker Compose |
