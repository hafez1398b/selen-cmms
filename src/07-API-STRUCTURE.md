# API Structure

## Base URL
- **Local:** `http://localhost:3000/api`
- **Staging:** `https://staging.selen-cmms.com/api`
- **Production:** `https://cmms.selen.ir/api`

## Authentication
همه endpoints (به جز `/auth/login` و `/health`) نیاز به JWT دارند.

```http
Authorization: Bearer <jwt_token>
```

یا از طریق HttpOnly Cookie: `selen_session`

## Standard Response

### موفق
```json
{
  "ok": true,
  "data": { ... },
  "meta": { "total": 100, "page": 1 }
}
```

### خطا
```json
{
  "ok": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "تجهیز یافت نشد",
    "field": "assetId"
  }
}
```

## HTTP Status Codes
- `200` OK
- `201` Created
- `204` No Content
- `400` Bad Request (validation)
- `401` Unauthorized
- `403` Forbidden (RBAC)
- `404` Not Found
- `409` Conflict
- `422` Unprocessable Entity
- `429` Too Many Requests
- `500` Internal Server Error

## Endpoints Reference

### 🔐 Auth
```
POST   /api/auth/login          { username, password }
POST   /api/auth/logout
GET    /api/auth/session        → current user
POST   /api/auth/change-password
```

### 👥 Users & Roles
```
GET    /api/users
POST   /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id
GET    /api/roles
```

### 🏭 Assets
```
GET    /api/assets              ?tree=true|false
GET    /api/assets/:id
POST   /api/assets
PATCH  /api/assets/:id
DELETE /api/assets/:id
POST   /api/assets/:id/move     { newParentId }
GET    /api/assets/:id/children
GET    /api/assets/:id/history
GET    /api/assets/:id/documents
POST   /api/assets/:id/documents  (multipart)
GET    /api/assets/:id/kpi
POST   /api/assets/import       (Excel/CSV)
```

### 🔧 Maintenance (PM)
```
GET    /api/maintenance/pm
POST   /api/maintenance/pm
GET    /api/maintenance/pm/:id
PATCH  /api/maintenance/pm/:id
DELETE /api/maintenance/pm/:id
POST   /api/maintenance/pm/:id/execute
GET    /api/maintenance/calendar    ?month=...
GET    /api/maintenance/overdue
```

### 📋 Work Orders
```
GET    /api/work-orders          ?status=...&assignedTo=...
POST   /api/work-orders
GET    /api/work-orders/:id
PATCH  /api/work-orders/:id
POST   /api/work-orders/:id/approve
POST   /api/work-orders/:id/reject
POST   /api/work-orders/:id/start
POST   /api/work-orders/:id/pause
POST   /api/work-orders/:id/complete
GET    /api/work-orders/:id/history
```

### 🚨 Failures & RCA
```
GET    /api/failures
POST   /api/failures
GET    /api/failures/:id
PATCH  /api/failures/:id
POST   /api/failures/:id/rca
GET    /api/failures/:id/rca
POST   /api/failures/:id/close
```

### 🔩 Inventory
```
GET    /api/inventory/parts
POST   /api/inventory/parts
GET    /api/inventory/parts/:id
PATCH  /api/inventory/parts/:id
POST   /api/inventory/transactions   { partId, type: in|out, qty }
GET    /api/inventory/low-stock
GET    /api/inventory/suppliers
POST   /api/inventory/suppliers
```

### 👷 Personnel
```
GET    /api/personnel
POST   /api/personnel
GET    /api/personnel/:id/workload
GET    /api/personnel/:id/skills
POST   /api/personnel/:id/skills
GET    /api/shifts
```

### 📊 Reports & KPI
```
GET    /api/reports/dashboard
GET    /api/reports/kpi              ?from=...&to=...
GET    /api/reports/mtbf             ?assetId=...
GET    /api/reports/mttr
GET    /api/reports/oee
GET    /api/reports/availability
GET    /api/reports/pareto
POST   /api/reports/export           { format: excel|pdf|word, type: ..., filter: ... }
```

### 🤖 AI
```
POST   /api/ai/chat                  { message, contextId? }
POST   /api/ai/import/excel          (multipart)
POST   /api/ai/import/pdf            (multipart)
POST   /api/ai/import/image          (multipart, OCR)
POST   /api/ai/analyze/failure       { failureId }
POST   /api/ai/predict/maintenance   { assetId }
POST   /api/ai/predict/failure       { assetId }
POST   /api/ai/recommend/pm          { assetId }
POST   /api/ai/generate/checklist    { assetType, standard }
POST   /api/ai/rca                   { failureId }
POST   /api/ai/fmea                  { assetId }
POST   /api/ai/recommend/parts       { assetId }
```

### 🔔 Notifications
```
GET    /api/notifications              ?unread=true
POST   /api/notifications/:id/read
POST   /api/notifications/mark-all-read
DELETE /api/notifications/:id
```

### 📝 Audit
```
GET    /api/audit                    ?entity=...&from=...&to=...
GET    /api/audit/:id
```

### ⚙️ Settings
```
GET    /api/settings
PATCH  /api/settings/:key
```

### 🏥 Health & Monitoring
```
GET    /api/health                   → { ok, db, cache, storage }
GET    /api/health/detailed
```

## Pagination
```
?page=1&pageSize=20&sort=-createdAt
```

## Filtering
```
?status=active&criticality=high&search=pump
```

## File Uploads
- **Max Size:** 10MB per file
- **Formats:** jpg, png, pdf, xlsx, docx
- **Storage:** `/uploads` → S3 (future)
- **Field Name:** `file` (multipart)

## Rate Limiting
- 100 requests / minute per user
- 1000 requests / hour per IP
- AI endpoints: 20 / minute

## Versioning (Future)
```
/api/v1/assets
/api/v2/assets
```

## WebSocket (Future)
```
wss://api/ws
- notifications
- work-order-updates
- kpi-live
```
