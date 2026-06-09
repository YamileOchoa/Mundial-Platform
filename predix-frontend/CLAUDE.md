# PREDIX — Frontend · Guía Maestra de Desarrollo

> Este archivo es la fuente de verdad del proyecto frontend.
> Claude ejecuta este documento como checklist iterativo. Cada sesión de trabajo debe:
> 1. Leer este archivo primero.
> 2. Marcar `[x]` los ítems completados.
> 3. Actualizar los valores si cambian.

---

## 1. Descripción del Proyecto

**PREDIX** es la interfaz de usuario de la plataforma de predicciones del Mundial de Fútbol 2026.
Conecta con el backend FastAPI ubicado en `../Mundial-Platform/backend`.
El backend corre en `http://localhost:8000`.

**Audiencia:** Usuarios normales (esta entrega). Panel admin se construye después.

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 3.x |
| HTTP | Axios | 1.x |
| Iconos | lucide-react | latest |
| Banderas | flag-icons | 7.x |
| Fuentes | Rubik (Google Fonts) | — |
| Formularios | React state local | — |

**PROHIBIDO usar:** Redux, Zustand, Material UI, Ant Design, Chakra, shadcn, Bootstrap.
Toda UI se construye con Tailwind + componentes propios.

---

## 3. Sistema de Diseño

### 3.1 Paleta de Colores — VALORES DEFINITIVOS

```
PRIMARIO (solo botones e interactivos)
  primary:        #6631D0   ← morado principal
  primary-dark:   #5528B8   ← hover de botones
  primary-light:  #DDD6FE   ← bordes suaves
  primary-xlight: #F3EEFF   ← fondo de chips/badge

BACKGROUNDS
  bg:             #FFFFFF   ← fondo global
  bg-subtle:      #F8FAFC   ← secciones alternas
  bg-card:        #FFFFFF   ← tarjetas

TEXTO
  text:           #0F172A   ← texto principal
  text-secondary: #475569   ← texto secundario
  text-muted:     #94A3B8   ← texto desactivado

BORDES
  border:         #E2E8F0   ← borde default
  border-focus:   #6631D0   ← foco en inputs

ESTADOS
  success:        #10B981 / light #D1FAE5
  danger:         #EF4444 / light #FEE2E2
  warning:        #F59E0B / light #FEF3C7
  info:           #3B82F6 / light #DBEAFE

RECOMPENSAS / RANKING
  gold:    #D97706 / light #FEF3C7
  silver:  #64748B
  bronze:  #92400E / light #FEF0E7
```

### 3.2 Tipografía — VALORES DEFINITIVOS

**Fuente única:** `Rubik` (Google Fonts, sans-serif)
Cargada en `app/layout.tsx` vía `next/font/google`.

```
Display XL:  56px / lh 1.1 / w800
Display L:   40px / lh 1.2 / w700
Heading 1:   32px / lh 1.25 / w700
Heading 2:   24px / lh 1.3  / w600
Heading 3:   20px / lh 1.4  / w600
Body Large:  18px / lh 1.6  / w400
Body:        16px / lh 1.6  / w400
Body Small:  14px / lh 1.5  / w400
Caption:     12px / lh 1.4  / w400
Label:       14px / lh 1.4  / w500
```

### 3.3 Border Radius

```
rounded-sm   6px
rounded-md   10px  (default cards/inputs)
rounded-lg   16px  (modales, cards grandes)
rounded-xl   24px  (hero elements)
rounded-full 9999px (pills, avatares)
```

### 3.4 Sombras

```
shadow-card       0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)
shadow-card-hover 0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -1px rgba(0,0,0,.04)
shadow-modal      0 25px 50px -12px rgba(0,0,0,.15)
```

### 3.5 Layout

| Contexto | Navbar | Sidebar |
|----------|--------|---------|
| Públicas (landing, login, register) | Top blanca | No |
| Dashboard usuario (`/home`, `/rooms`, etc.) | Top blanca con links centrales | No — contenido `max-w-7xl` |
| Panel Admin (`/admin/*`) | Barra superior mínima | 240px fija (colapsable en mobile) |

**Sin Route Groups.** Rutas explícitas en `app/` (no usar `(dashboard)` ni `(admin)`).

---

## 4. Estructura de Carpetas

```
predix-frontend/
├── CLAUDE.md
├── app/
│   ├── layout.tsx                   ← Root: fuente Rubik + AuthProvider
│   ├── globals.css
│   ├── page.tsx                     ← Landing
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── home/layout.tsx + page.tsx   ← UserDashboardLayout
│   ├── matches/layout.tsx + page.tsx
│   ├── rooms/layout.tsx + [roomId]/...
│   ├── predictions/layout.tsx + page.tsx
│   ├── leaderboard/layout.tsx + page.tsx
│   ├── rewards/layout.tsx + page.tsx
│   ├── profile/layout.tsx + page.tsx
│   ├── chat/layout.tsx + page.tsx
│   └── admin/
│       ├── layout.tsx               ← AdminSidebar 240px + auth admin guard
│       ├── page.tsx
│       ├── matches/page.tsx
│       ├── users/page.tsx
│       ├── rooms/page.tsx
│       └── players/page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── PlaceholderImage.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── PageHeader.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   └── layout/
│       ├── PublicNavbar.tsx
│       ├── AppNavbar.tsx
│       ├── UserDashboardLayout.tsx
│       └── AdminSidebar.tsx
├── context/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useRooms.ts
│   └── useStats.ts
├── services/
│   ├── api.ts
│   ├── auth.service.ts
│   ├── rooms.service.ts
│   ├── matches.service.ts
│   ├── predictions.service.ts
│   ├── leaderboard.service.ts
│   ├── rewards.service.ts
│   ├── chat.service.ts
│   ├── players.service.ts
│   ├── stats.service.ts
│   └── admin.service.ts
├── types/
│   ├── auth.ts
│   ├── room.ts
│   ├── match.ts
│   ├── prediction.ts
│   ├── score.ts
│   ├── player.ts
│   └── reward.ts
├── utils/
│   ├── date.ts
│   └── team.ts
└── proxy.ts
```

---

## 5. Principios SOLID

| Principio | Aplicación |
|-----------|-----------|
| **S** Single Responsibility | Cada componente hace UNA cosa. |
| **O** Open/Closed | Extensibles por `variant`, `size`, `className`, `children`. |
| **L** Liskov | Extienden `React.ButtonHTMLAttributes`, `React.InputHTMLAttributes`, etc. |
| **I** Interface Segregation | Props mínimas y específicas. Interfaces pequeñas en `types/`. |
| **D** Dependency Inversion | Páginas → servicios abstractos. Servicios → `api.ts`. |

---

## 6. Convenciones

```
Archivos:    PascalCase.tsx componentes · camelCase.ts utils/services
Exports:     default para componentes · named para utils/services/types
Strings UI:  en español
Comentarios: solo cuando el WHY no es obvio
No emojis:   en código ni en UI (solo flag-icons para banderas)
```

---

## 7. Integración Backend por Página

| Página | Endpoints |
|--------|-----------|
| Landing | Ninguno |
| Login | POST /api/auth/login |
| Register | POST /api/auth/register |
| Dashboard Home | GET /api/users/me · GET /api/users/me/stats · GET /api/rooms/ · GET /api/matches/?room_id= |
| Mis Salas | GET /api/rooms/ · POST /api/rooms/ · POST /api/rooms/join |
| Detalle Sala | GET /api/rooms/:id · GET /api/rooms/:id/members · GET /api/matches/?room_id= · GET /api/leaderboard/room/:id · POST /api/matches/ |
| Detalle Partido | GET /api/matches/:id · POST /api/predictions/ · PUT /api/predictions/:id · GET /api/predictions/?match_id= · GET /api/score-history/?match_id= · GET /api/players/?q= |
| Predicciones | GET /api/predictions/my · GET /api/score-history/my |
| Leaderboard | GET /api/leaderboard/global |
| Recompensas | GET /api/rewards/my |
| Perfil | GET /api/users/me · GET /api/users/me/stats · PUT /api/users/me |
| Chat IA | POST /api/chat/message |
| Admin Dashboard | GET /api/admin/matches/ · GET /api/admin/users/ · GET /api/admin/rooms/ · GET /api/players/ |
| Admin Partidos | GET /api/admin/matches/ · PATCH /api/admin/matches/:id/status · PUT /api/admin/matches/:id/result |
| Admin Usuarios | GET /api/admin/users/ · PUT /api/admin/users/:id/make-admin · DELETE /api/admin/users/:id |
| Admin Salas | GET /api/admin/rooms/ · DELETE /api/admin/rooms/:id |
| Admin Jugadores | POST /api/admin/players/ · POST /api/admin/players/bulk · DELETE /api/admin/players/:id |

---

## 8. Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 9. Comandos

```bash
npm install       # dependencias
npm run dev       # http://localhost:3000
npm run build     # producción
npm run lint      # ESLint
```

---

## 10. Checklist de Ejecución

### Infraestructura
- [x] CLAUDE.md creado
- [x] Proyecto scaffoldeado (create-next-app)
- [x] tailwind.config.ts con design system
- [x] globals.css (reset, fuente, scrollbar)
- [x] Rubik font en root layout
- [x] .env.local.example

### Tipos TypeScript
- [x] auth.ts · room.ts · match.ts · prediction.ts · score.ts · player.ts

### Servicios
- [x] api.ts (axios + JWT interceptor + auto-refresh)
- [x] auth.service.ts · rooms.service.ts · matches.service.ts · stats.service.ts
- [x] predictions.service.ts · leaderboard.service.ts · rewards.service.ts · chat.service.ts · players.service.ts

### Context / Hooks
- [x] AuthContext.tsx · useAuth.ts · useRooms.ts · useStats.ts

### Componentes UI
- [x] Button · Input · Badge · Card · Modal · Spinner · PlaceholderImage · CountdownTimer

### Layout
- [x] PublicNavbar · AppNavbar (navbar usuario) · AdminSidebar (sidebar admin)

### Proxy (Route Guard)
- [x] proxy.ts (Next.js 16 replacement for middleware.ts)

### Páginas Usuario
- [x] Landing (/) · Login (/login) · Register (/register) · Dashboard Home (/home)
- [x] Partidos (/matches) · Mis Salas · Detalle Sala · Detalle Partido · Predicciones · Leaderboard · Recompensas · Perfil · Chat IA

### Páginas Admin
- [x] Dashboard (/admin) · Partidos · Usuarios · Salas · Jugadores
