# سیستم طراحی (UI Design System)

## Design Principles
1. **Clarity First** — وضوح قبل از زیبایی
2. **Progressive Disclosure** — اطلاعات لایه‌ای
3. **Consistent** — یکپارچگی در تمام صفحات
4. **Accessible** — WCAG 2.1 AA
5. **RTL-First** — راست‌چین اصلی

## Color System

### Dark Theme (پیش‌فرض)
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0a0a0a` | پس‌زمینه اصلی |
| `--bg-elevated` | `#111111` | کارت‌ها |
| `--bg-surface` | `#1a1a1a` | سایدبار |
| `--border` | `#1a1a1a` / `#2a2a2a` | حاشیه‌ها |
| `--text-primary` | `#ffffff` | متن اصلی |
| `--text-secondary` | `#a0a0a0` | متن ثانویه |
| `--text-muted` | `#666666` | متن کم‌رنگ |
| `--primary` | `#d4a017` | طلایی (Selen Gold) |
| `--primary-hover` | `#b8890a` | |

### Light Theme
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#e5e7eb` | پس‌زمینه (طوسی روشن) |
| `--bg-elevated` | `#ffffff` | کارت‌ها |
| `--text-primary` | `#1f2937` | متن اصلی |
| `--primary` | `#dc2626` | قرمز |

### Semantic Colors
| رنگ | Hex | معنی |
|---|---|---|
| Success | `#22c55e` | موفقیت، سلامت |
| Warning | `#f59e0b` | هشدار |
| Danger | `#ef4444` | خطر، بحرانی |
| Info | `#3b82f6` | اطلاعات |
| AI | `#8b5cf6` | هوش مصنوعی |

## Typography

**فونت:** Vazirmatn (Google Fonts)

| Scale | Size | Weight | Usage |
|---|---|---|---|
| xs | 10-11px | 500 | Caption |
| sm | 12-13px | 400 | Body Small |
| base | 14px | 400 | Body |
| lg | 16px | 500 | Subtitle |
| xl | 18-20px | 700 | Title |
| 2xl | 24px | 800 | Heading |
| 3xl | 30px | 900 | Display |

## Spacing (Tailwind)
`1 (4px), 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24`

## Border Radius
- `lg` (8px) — دکمه‌ها، Input
- `xl` (12px) — Badge
- `2xl` (16px) — کارت‌ها
- `full` — Avatar، Pill

## Shadows
- **Card:** `0 1px 3px rgba(0,0,0,0.04)` (light) / `none` (dark)
- **Hover:** `0 4px 20px rgba(212,160,23,0.08)`
- **Modal:** `0 20px 50px rgba(0,0,0,0.3)`

## Component Library

### Buttons
- `.btn-primary` — گرادیانت طلایی
- `.btn-secondary` — پس‌زمینه خنثی
- `.btn-danger` — قرمز
- سایز: `xs`, `sm`, `md`, `lg`

### Cards
- `.kpi-card` — کارت KPI
- `.chart-card` — کارت نمودار
- `.card-hover` — با انیمیشن

### Badges
- `.badge-active`, `.badge-critical`, `.badge-high`, `.badge-medium`, `.badge-low`

### Inputs
- `.input-field` — فیلد متنی
- `.select-field` — انتخابی

### Progress
- `.progress-bar` — نوار پیشرفت با gradient

## Icons
**Library:** Lucide React (600+ icons)
**Size Standard:** 3.5 (14px), 4 (16px), 5 (20px)

## Animations
- `fadeIn` — 0.4s ease-out
- `slideInRight` — 0.3s ease-out
- `pulseGlow` — 2s infinite (برای هشدار)
- `spin` — برای loading

## Layout Grid
- **Desktop:** 12-column, gap 4/6
- **Tablet:** 8-column
- **Mobile:** 4-column, single column for cards

## Breakpoints
| Name | Min-Width |
|---|---|
| sm | 640px |
| md | 768px |
| lg | 1024px |
| xl | 1280px |
| 2xl | 1536px |

## Responsive Patterns
- **Sidebar:** Fixed sidebar → Bottom Nav در موبایل
- **Table:** جدول → کارت‌های stacked در موبایل
- **Modal:** Center Modal → Bottom Sheet در موبایل
- **KPI:** 6 ستون → 2 ستون در موبایل

## Accessibility (a11y)
- کنتراست حداقل 4.5:1
- Focus ring روی تمام interactive elements
- ARIA labels
- Keyboard navigation
- Screen reader support (Persian)
