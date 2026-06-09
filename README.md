<div align="center">

# ⚽ PREDIX — Plataforma de Predicciones Mundial 2026

**Compite con tus amigos prediciendo los resultados del Mundial de Fútbol 2026.**  
Crea salas privadas, realiza predicciones detalladas, acumula puntos y desbloquea recompensas.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Ver Demo](#demo) · [Reportar Bug](https://github.com/YamileOchoa/Mundial-Platform/issues) · [Solicitar Feature](https://github.com/YamileOchoa/Mundial-Platform/issues)

</div>

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
  - [Con Docker (recomendado)](#con-docker-recomendado)
  - [Sin Docker (desarrollo local)](#sin-docker-desarrollo-local)
- [Variables de Entorno](#variables-de-entorno)
- [Uso](#uso)
- [Documentación de la API](#documentación-de-la-api)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Motor de Puntuación](#motor-de-puntuación)
- [Contribuir](#contribuir)
- [Equipo](#equipo)

---

## Descripción

**PREDIX** es una aplicación web full-stack orientada al Mundial de Fútbol 2026. Los usuarios se organizan en salas privadas, realizan predicciones completas de cada partido (marcador, goleador, tarjeta y minuto del primer gol) y compiten en tiempo real por los primeros puestos del ranking.

Un motor de puntuación basado en reglas calcula automáticamente los puntos al registrarse el resultado oficial de cada partido. El sistema también incluye un asistente de IA (Google Gemini) para consultas deportivas y un sistema de recompensas con sobres desbloqueables en PDF.

---

## Características

| Módulo | Descripción |
|---|---|
| **Salas privadas** | Crea salas con código de invitación único (UUID) y compite con quien quieras |
| **Predicciones completas** | Predice marcador, goleador, jugador con tarjeta, tipo de tarjeta y minuto del primer gol |
| **Motor de puntuación** | 8 reglas automáticas aplicadas al finalizar cada partido |
| **Leaderboard** | Ranking global y por sala en tiempo real |
| **Recompensas** | Sobres bronce / plata / oro / sorpresa desbloqueables con PDF descargable |
| **Chat con IA** | Asistente deportivo basado en Google Gemini (10 mensajes/día por usuario) |
| **Panel Admin** | Gestión completa de partidos, usuarios, salas y jugadores |
| **JWT + Refresh** | Autenticación segura con auto-refresh de tokens en el frontend |

---

## Stack Tecnológico

### Backend
| Tecnología | Versión | Descripción |
|---|---|---|
| [FastAPI](https://fastapi.tiangolo.com/) | 0.128 | Framework web asíncrono con validación automática |
| [SQLAlchemy](https://www.sqlalchemy.org/) | 2.0 | ORM para PostgreSQL |
| [Pydantic](https://docs.pydantic.dev/) | 2.x | Validación de esquemas y contratos de API |
| [PostgreSQL](https://www.postgresql.org/) | 16 | Base de datos relacional principal |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.5 | JWT (tokens de acceso y refresco) |
| [passlib + bcrypt](https://passlib.readthedocs.io/) | 1.7 | Hashing seguro de contraseñas |
| [Google Generative AI](https://ai.google.dev/) | 0.8 | Chat con Gemini API |
| [Uvicorn](https://www.uvicorn.org/) | 0.40 | Servidor ASGI de alto rendimiento |

### Frontend
| Tecnología | Versión | Descripción |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16 (App Router) | Framework React con SSR/SSG |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Tipado estático estricto |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utilidades CSS y design system propio |
| [Axios](https://axios-http.com/) | 1.x | Cliente HTTP con interceptores JWT y auto-refresh |
| [Lucide React](https://lucide.dev/) | latest | Iconografía |
| [flag-icons](https://flagicons.lipis.dev/) | 7.x | Banderas de países |

### Infraestructura
| Tecnología | Descripción |
|---|---|
| [Docker](https://www.docker.com/) | Contenedores por servicio |
| [Docker Compose](https://docs.docker.com/compose/) | Orquestación multi-servicio con health checks |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Compose                         │
│                                                             │
│  ┌────────────────┐   HTTP/REST    ┌──────────────────┐    │
│  │  Frontend      │◄──────────────►│    Backend       │    │
│  │  Next.js 16    │   :8000        │    FastAPI       │    │
│  │  :3000         │                │                  │    │
│  │                │                │  Routes          │    │
│  │  App Router    │                │  Schemas         │    │
│  │  TypeScript    │                │  Services        │    │
│  │  Tailwind CSS  │                │  SQLAlchemy ORM  │    │
│  │  Axios + JWT   │                └────────┬─────────┘    │
│  └────────────────┘                         │              │
│                                             ▼              │
│                                   ┌──────────────────┐    │
│                                   │   PostgreSQL 16  │    │
│                                   │   :5432 (intern) │    │
│                                   └──────────────────┘    │
│                                                             │
│  Volúmenes persistentes: postgres_data · media_data (PDF)  │
└─────────────────────────────────────────────────────────────┘
                              │
                    (opcional)▼
                   Google Gemini API
```

El backend sigue un patrón **MVC con capa de servicios**:

```
Request → Routes → Schemas (Pydantic) → Services → Models (ORM) → PostgreSQL
```

El frontend sigue un patrón **Feature Pages + Service Layer**:

```
Page → Custom Hooks → Services (Axios) → api.ts (JWT) → Backend API
```

---

## Requisitos Previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recomendado)
- **O bien** para desarrollo local sin Docker:
  - [Python 3.12+](https://www.python.org/downloads/)
  - [Node.js 20+](https://nodejs.org/)
  - [PostgreSQL 16](https://www.postgresql.org/download/)

---

## Instalación y Configuración

### Con Docker (recomendado)

Esta es la forma más simple. Levanta todo el stack con un solo comando.

**1. Clona el repositorio**

```bash
git clone https://github.com/YamileOchoa/Mundial-Platform.git
cd Mundial-Platform
```

**2. Configura las variables de entorno**

```bash
# Copia el archivo de ejemplo y edítalo
cp .env.example .env
```

Edita `.env` y agrega tu `GEMINI_API_KEY` (opcional, solo para el chat IA):

```env
SECRET_KEY=cambia-esto-por-una-clave-secreta-segura
GEMINI_API_KEY=tu_api_key_de_google_gemini
```

**3. Levanta el stack**

```bash
docker compose up --build
```

Docker levantará automáticamente:
| Servicio | URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (FastAPI) | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

> **Nota:** La primera vez tarda unos minutos en descargar las imágenes y compilar el frontend.

**Otros comandos útiles:**

```bash
# Detener los servicios
docker compose down

# Ver logs en tiempo real
docker compose logs -f

# Logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend

# Acceder a la base de datos
docker compose exec postgres psql -U predix -d predix

# Detener y eliminar volúmenes (borra todos los datos)
docker compose down -v
```

---

### Sin Docker (desarrollo local)

#### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tu DATABASE_URL local y SECRET_KEY

# Iniciar servidor
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd predix-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Iniciar servidor de desarrollo
npm run dev
```

#### Base de datos (local)

Crea la base de datos en PostgreSQL:

```sql
CREATE USER predix WITH PASSWORD 'predix';
CREATE DATABASE predix OWNER predix;
```

Luego configura en `backend/.env`:

```env
DATABASE_URL=postgresql://predix:predix@localhost:5432/predix
```

---

## Variables de Entorno

### Backend (`.env`)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `SECRET_KEY` | Clave secreta para firmar JWT | — (requerido) |
| `ALGORITHM` | Algoritmo JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del access token | `1440` (24h) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Expiración del refresh token | `30` días |
| `DATABASE_URL` | URL de conexión a PostgreSQL | — (requerido) |
| `GEMINI_API_KEY` | API key de Google Gemini | — (opcional, habilita el chat IA) |
| `CORS_ORIGINS` | Orígenes permitidos en CORS | `http://localhost:3000` |
| `MEDIA_DIR` | Directorio para archivos PDF | `/app/media` |

### Frontend (`.env.local`)

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL base del backend | `http://localhost:8000` |

---

## Uso

### Primer acceso como usuario

1. Abre http://localhost:3000
2. Haz clic en **"Registrate gratis"** y crea tu cuenta
3. Crea una sala o únete con un código de invitación
4. Espera a que el administrador cree los partidos
5. Realiza tus predicciones antes de que comience cada partido
6. Consulta el leaderboard y desbloquea recompensas al acumular puntos

### Acceso al panel de administración

1. Ve a http://localhost:3000/admin/login
2. Inicia sesión con una cuenta que tenga `es_admin_global = true`

> Para crear el primer administrador, conéctate a la base de datos y ejecuta:
> ```sql
> UPDATE users SET es_admin_global = true WHERE email = 'tu@email.com';
> ```
> O usa el endpoint: `PUT /api/admin/users/{id}/make-admin` con un admin existente.

### Desde el panel admin puedes:
- Crear partidos y asignarlos a salas
- Cambiar el estado de los partidos (`pendiente` → `en_curso` → `terminado`)
- Registrar el resultado final (dispara automáticamente el motor de puntuación)
- Gestionar usuarios, salas y jugadores

---

## Documentación de la API

La documentación interactiva se genera automáticamente con FastAPI:

| Formato | URL |
|---|---|
| **Swagger UI** (interactivo) | http://localhost:8000/docs |
| **ReDoc** (legible) | http://localhost:8000/redoc |

### Resumen de Endpoints

| Módulo | Prefijo | Descripción |
|---|---|---|
| Autenticación | `/api/auth` | Registro, login, refresh token |
| Usuarios | `/api/users` | Perfil, estadísticas |
| Salas | `/api/rooms` | CRUD de salas, miembros |
| Partidos | `/api/matches` | Listado y detalle |
| Predicciones | `/api/predictions` | Crear, editar, historial |
| Leaderboard | `/api/leaderboard` | Rankings global y por sala |
| Recompensas | `/api/rewards` | Sobres y descarga de PDF |
| Historial de puntos | `/api/score-history` | Detalle de puntos por partido |
| Chat IA | `/api/chat` | Asistente Gemini |
| Admin | `/api/admin/*` | Panel administrativo (requiere rol admin) |

> Para más detalle de cada endpoint (request/response bodies, ejemplos) consulta [`doc.md`](doc.md).

---

## Estructura del Proyecto

```
Mundial-Platform/
├── docker-compose.yml          # Orquestación de 3 servicios
├── .env                        # Variables de entorno (no commitear)
├── .env.example                # Plantilla de variables de entorno
├── doc.md                      # Documentación técnica completa
│
├── backend/                    # API FastAPI + Python 3.12
│   ├── main.py                 # Punto de entrada, routers, CORS
│   ├── requirements.txt        # Dependencias Python
│   ├── Dockerfile
│   ├── config/
│   │   ├── db.py               # Conexión PostgreSQL y sesión ORM
│   │   ├── auth.py             # JWT y dependencias de autenticación
│   │   └── security.py         # Bcrypt hashing
│   ├── models/
│   │   └── models.py           # Entidades SQLAlchemy (9 tablas)
│   ├── schemas/                # Contratos Pydantic por dominio
│   ├── routes/                 # Endpoints organizados por dominio
│   │   └── admin/              # Rutas protegidas de administración
│   └── services/
│       └── scoring.py          # Motor de puntuación (8 reglas)
│
└── predix-frontend/            # App Next.js 16 + TypeScript
    ├── app/
    │   ├── page.tsx            # Landing page
    │   ├── login/              # Autenticación
    │   ├── register/
    │   ├── (user)/             # Páginas del usuario autenticado
    │   │   ├── home/           # Dashboard
    │   │   ├── rooms/          # Salas y detalle
    │   │   ├── predictions/    # Historial de predicciones
    │   │   ├── leaderboard/    # Rankings
    │   │   ├── rewards/        # Recompensas
    │   │   ├── profile/        # Perfil del usuario
    │   │   └── chat/           # Chat con IA
    │   └── admin/              # Panel de administración
    ├── components/
    │   ├── ui/                 # Componentes atómicos reutilizables
    │   └── layout/             # Navbars, sidebars, shells
    ├── context/                # AuthContext (estado global de auth)
    ├── hooks/                  # useAuth, useRooms, useStats
    ├── services/               # Capa de abstracción Axios por dominio
    ├── types/                  # Interfaces TypeScript por dominio
    ├── utils/                  # Helpers de fecha y equipos
    └── Dockerfile              # Build multi-etapa (deps → build → runner)
```

---

## Motor de Puntuación

El sistema calcula puntos automáticamente cuando un admin registra el resultado de un partido. Se aplican hasta **8 reglas acumulables**:

| Regla | Condición | Puntos |
|---|---|---|
| Resultado exacto | Marcador exacto | **+5** |
| Ganador correcto | Solo acertó el ganador | **+3** |
| Diferencia correcta | Misma diferencia de goles | **+2** |
| Predicción anticipada | Predicción hecha 24h+ antes | **+1** |
| Goleador correcto | Nombre del goleador (exacto) | **+3** |
| Tarjeta correcta | Jugador + tipo de tarjeta | **+2** |
| Minuto del gol | Minuto del primer gol ±5 min | **+2** |
| Bonus racha | 3 predicciones de ganador consecutivas | **+2** |

**Máximo posible por partido: 20 puntos**

### Desbloqueo de Recompensas

| Sobre | Condición |
|---|---|
| 🥉 Bronce | 50+ puntos totales |
| 🥈 Plata | 100+ puntos totales |
| 🥇 Oro | 200+ puntos totales |
| 🎁 Sorpresa | 5+ victorias consecutivas (racha) |

---

## Contribuir

Las contribuciones son bienvenidas. Por favor sigue estos pasos:

1. **Fork** el repositorio
2. Crea tu rama: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y haz commit: `git commit -m 'feat: agrega nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un **Pull Request** hacia `develop`

### Convenciones de commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     nueva funcionalidad
fix:      corrección de bug
refactor: refactorización sin cambio de comportamiento
docs:     cambios en documentación
chore:    tareas de mantenimiento
style:    formato, sin cambio de lógica
test:     adición o modificación de tests
```

### Ramas

| Rama | Propósito |
|---|---|
| `develop` | Rama principal de desarrollo |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones de bugs |
| `refactor/*` | Refactorizaciones |

---

## Licencia

Distribuido bajo la licencia MIT. Ver [`LICENSE`](LICENSE) para más información.

---

<div align="center">

Hecho con ❤️ para el Mundial de Fútbol 2026 🏆

</div>
