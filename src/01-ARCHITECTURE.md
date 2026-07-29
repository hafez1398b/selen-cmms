# معماری سامانه (Architecture Document)

## Architecture Style
**Clean Architecture + Domain-Driven Design (DDD) + Modular Monolith**

## نمای کلان معماری (High-Level Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Web UI  │  │  Mobile  │  │   PWA    │  │   API    │   │
│  │ (Next.js)│  │(Responsive)│ │  Offline │  │  REST    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Use Cases │  │  Command │  │  Query   │  │  Event   │   │
│  │          │  │  Handler │  │  Handler │  │  Handler │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Entities │  │  Value   │  │  Domain  │  │  Domain  │   │
│  │          │  │  Objects │  │  Events  │  │  Services│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │PostgreSQL│  │   Redis  │  │  S3/File │  │  AI/ML   │   │
│  │(Drizzle) │  │  (Cache) │  │  Storage │  │  Service │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Bounded Contexts (DDD)

| Context | مسئولیت |
|---|---|
| **Asset Management** | مدیریت درخت تجهیزات، شناسنامه |
| **Maintenance** | PM, CM, PdM, Checklist |
| **Work Order** | چرخه دستور کار، تایید، اجرا |
| **Inventory** | قطعات، تامین‌کنندگان، موجودی |
| **HR & Personnel** | پرسنل، مهارت، شیفت |
| **Reliability** | RCA, FMEA, MTBF, MTTR |
| **Analytics** | KPI, Dashboard, Reports |
| **AI/ML** | Import, Predict, Recommend |
| **Notification** | Alerts, Emails, Push |
| **Identity** | Auth, Users, RBAC |
| **Audit** | Logging, Compliance |

## Layered Architecture Details

### 1. Presentation Layer (`src/app/`, `src/components/`)
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **State:** React Context + Jotai
- **Charts:** Recharts
- **Icons:** Lucide React
- **Fonts:** Vazirmatn (Persian)

### 2. Application Layer (`src/application/`)
- Use Cases (per feature)
- Command/Query Handlers (CQRS-lite)
- DTO Mappers
- Validators (Zod)

### 3. Domain Layer (`src/domain/`)
- Pure Business Logic
- Entities: Asset, WorkOrder, Failure, User, SparePart
- Value Objects: AssetCode, MTBF, HealthScore
- Domain Events: WorkOrderCreated, FailureReported

### 4. Infrastructure Layer (`src/infrastructure/`, `src/db/`)
- **Database:** PostgreSQL + Drizzle ORM
- **File Storage:** Local FS → S3-compatible
- **AI:** OpenAI/Anthropic API (via server routes)
- **Cache:** In-memory → Redis (future)

## API Structure

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /logout
│   └── GET  /session
├── /assets
│   ├── GET    /            (tree)
│   ├── POST   /            (create)
│   ├── GET    /:id         (details)
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   ├── POST   /:id/move
│   └── GET    /:id/history
├── /work-orders
│   ├── GET    /
│   ├── POST   /
│   ├── PATCH  /:id/status
│   └── POST   /:id/approve
├── /maintenance
│   ├── GET    /pm
│   ├── POST   /pm
│   └── POST   /pm/:id/execute
├── /failures
│   ├── GET    /
│   ├── POST   /
│   └── POST   /:id/rca
├── /inventory
│   ├── GET    /parts
│   ├── POST   /parts
│   └── POST   /transactions
├── /personnel
├── /reports
│   ├── GET  /kpi
│   ├── POST /export/pdf
│   ├── POST /export/excel
│   └── POST /export/word
├── /ai
│   ├── POST /import/excel
│   ├── POST /import/pdf
│   ├── POST /import/image (OCR)
│   ├── POST /analyze/failure
│   ├── POST /predict/maintenance
│   ├── POST /chat
│   └── POST /recommend/pm
├── /notifications
│   ├── GET  /
│   └── PATCH /:id/read
└── /health
    └── GET /
```

## Data Flow Pattern

```
User Action
    ↓
UI Component (React)
    ↓
API Call (fetch)
    ↓
Next.js API Route (/api/*)
    ↓
Application Handler (Use Case)
    ↓
Domain Service + Entity
    ↓
Repository (Drizzle)
    ↓
PostgreSQL
    ↓
Response ← Mapper ← Result
```

## Security Architecture

- **Authentication:** JWT + Refresh Token (HttpOnly Cookie)
- **Authorization:** RBAC با ۵ سطح دسترسی
- **Encryption:** bcrypt (passwords), TLS (transport)
- **CSRF:** SameSite Cookie
- **XSS:** React automatic escaping + CSP header
- **SQL Injection:** Drizzle parameterized queries
- **Rate Limiting:** per IP/user
- **Audit Log:** تمام عملیات حساس

## Scalability

- **Horizontal:** Stateless API → multiple pods
- **Vertical:** DB indexes on hot paths
- **Caching:** Redis برای KPI و Dashboard
- **Background Jobs:** BullMQ برای Import و Reports
- **CDN:** برای static assets

## Non-Functional Requirements

| نیازمندی | هدف |
|---|---|
| زمان پاسخ (P95) | < 300ms |
| Availability | 99.5% |
| RPO (Recovery Point) | 24 ساعت |
| RTO (Recovery Time) | 4 ساعت |
| Concurrent Users | 200 |
| Data Retention | 10 سال |
| Backup | روزانه (auto) |
