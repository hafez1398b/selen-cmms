# Coding Standards & Conventions

## Language & Framework
- **Language:** TypeScript 5.9 (strict mode)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4
- **ORM:** Drizzle
- **DB:** PostgreSQL 15+
- **Validation:** Zod
- **State:** React Context + Jotai (client), Server Components (data)

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── (dashboard)/       # Main app routes
│   ├── api/               # API routes
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/            # React components
│   ├── ui/               # Base UI (Button, Input, Modal)
│   ├── layout/           # Layout (Sidebar, Header, Nav)
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   ├── features/         # Feature-specific
│   │   ├── assets/
│   │   ├── work-orders/
│   │   ├── maintenance/
│   │   ├── inventory/
│   │   └── ai/
│   └── pages/            # Page-level composition
│
├── context/              # React Context providers
│
├── hooks/                # Custom React hooks
│
├── lib/                  # Utilities & helpers
│   ├── utils.ts
│   ├── date.ts
│   ├── format.ts
│   ├── constants.ts
│   └── data.ts          # Mock data (until DB migration)
│
├── domain/               # Business logic (DDD)
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── services/
│
├── application/          # Use cases
│   ├── assets/
│   ├── work-orders/
│   └── ...
│
├── infrastructure/       # External integrations
│   ├── ai/
│   ├── storage/
│   └── notifications/
│
├── db/                   # Drizzle
│   ├── schema.ts
│   ├── index.ts
│   └── seed.ts
│
└── types/                # TypeScript types
    ├── api.ts
    ├── domain.ts
    └── index.ts
```

## Naming Conventions

### Files
- **Components:** `PascalCase.tsx` — `AssetTree.tsx`
- **Hooks:** `camelCase.ts` prefix `use` — `useAssets.ts`
- **Utils:** `kebab-case.ts` — `format-date.ts`
- **Types:** `kebab-case.ts` — `asset-types.ts`
- **API Routes:** `route.ts` (Next.js convention)

### Variables
- **camelCase:** متغیرها، توابع، پراپرتی‌ها
- **PascalCase:** کامپوننت‌ها، کلاس‌ها، Type/Interface
- **UPPER_SNAKE:** ثابت‌ها — `MAX_UPLOAD_SIZE`
- **_prefix:** خصوصی — `_internalCache`

### Persian Text
- تمام متن‌های UI فارسی
- استفاده از ی و ک استاندارد (نه عربی)
- اعداد فارسی در نمایش، انگلیسی در کد

## Component Patterns

### Base Component
```tsx
"use client";

import { type ReactNode } from "react";

interface Props {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function MyComponent({ title, children, className = "" }: Props) {
  return (
    <div className={`chart-card ${className}`}>
      <h3 className="font-bold text-sm">{title}</h3>
      {children}
    </div>
  );
}
```

### Server Component (async)
```tsx
import { db } from "@/db";
import { assets } from "@/db/schema";

export async function AssetList() {
  const list = await db.select().from(assets);
  return <div>{/* ... */}</div>;
}
```

### API Route
```ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);
    // ... business logic
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }
}
```

## Response Format Standard

```json
{
  "ok": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "خطا در اعتبارسنجی",
    "details": [...]
  }
}
```

## Error Handling
- تمام API routes باید try-catch داشته باشند
- خطاهای دامنه با Error Class اختصاصی
- Log با context کامل

## Testing (Future)
- Unit: Vitest
- E2E: Playwright
- Coverage: > 70%

## Git Convention

### Branch Naming
- `main` — production
- `develop` — integration
- `feature/phase-N-description`
- `bugfix/description`
- `hotfix/description`

### Commit Message
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:** feat, fix, docs, style, refactor, test, chore

**مثال:**
```
feat(assets): add drag & drop for asset tree

- Implement HTML5 drag events
- Update parent_id on drop
- Persist to database

Closes #123
```

### Tags per Phase
- `v0.1.0-phase-0` — Docs
- `v0.2.0-phase-1` — UI Framework
- ...
- `v1.0.0` — Final Release

## Security Rules
- ❌ هرگز password/token در repo
- ✅ استفاده از env vars
- ✅ Input validation با Zod
- ✅ SQL Injection prevention (Drizzle parameterized)
- ✅ XSS prevention (React default escape)
- ✅ HTTPS only در production
