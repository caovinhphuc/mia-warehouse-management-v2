# 🏗️ SYSTEM ARCHITECTURE OVERVIEW

> Version: 2025-09-26
> Scope: Main integrated platform (MIA Logistics Manager + Backend + AI + Automation + Google Sheets)

---

## 1. HIGH-LEVEL DIAGRAM

```text
          Users (Web)
               │
        ┌───────┴────────┐
        │ React Frontends │ (MIA Logistics Manager, Google Sheets App, Main Dashboard)
        └───────┬────────┘
                │ HTTPS / WebSocket
        ┌───────┴────────┐
        │  Node Backend  │  (Auth, API Gateway, Notification Hub)
        └───────┬────────┘
        ┌───────┴──────────────┬─────────────────┐
        │                       │                 │
   Google Sheets DB       AI Service (FastAPI)   Automation (Selenium)
        │                       │                 │
        └──────────┬────────────┴──────┬──────────┘
                   │  Event / Data Flow │
                   ▼                   ▼
            Notification Channels (Email, Telegram, WebSocket)
```

---

## 2. SERVICE INVENTORY

| Service                | Stack                               | Role                                 | Ports       | Scaling             |
| ---------------------- | ----------------------------------- | ------------------------------------ | ----------- | ------------------- |
| MIA Logistics Manager  | React + TS + MUI                    | Logistics UI ("One Page")            | 3000/Custom | Horizontal (static) |
| Google Sheets Frontend | React                               | Sheets Ops & AI UI                   | 3002        | Horizontal          |
| Main Backend           | Node.js + Express + Socket.IO       | Auth, API Aggregation, Notifications | 3001        | Horizontal          |
| AI Service             | Python FastAPI                      | ML inference / analytics             | 8000        | CPU/Memory scale    |
| Automation Service     | Python + Selenium + Streamlit       | Data scraping & RPA                  | Dynamic     | Worker scaling      |
| Google Sheets          | External API                        | Primary structured datastore         | -           | Google infra        |
| Notification Layer     | Nodemailer, Telegram Bot, Socket.IO | Multi-channel alerts                 | 3001/ws     | Shared              |

---

## 3. CORE FLOWS

### 3.1 User Request → AI Insight Flow

```text
User → Frontend → /api/analytics/request → Backend
Backend → Queue/Direct → AI Service /analyze
AI Service → result → Backend → WebSocket emit → Frontend updates
```

### 3.2 OnePage (Logistics) Data Integration (Planned)

```text
OnePage Frontend (MIA) → Backend /api/onepage/import
Backend → SheetsService.writeSheet()
Sheets → (Trigger / schedule) → AI preprocess → Insights back
```

### 3.3 Automation Harvest Flow

```text
Scheduler (cron) → Automation Script (Selenium)
Automation → Extracted dataset → Write Sheets
Sheets → Backend cache refresh → WebSocket broadcast → UI refresh
```

---

## 4. MODULE BOUNDARIES

| Boundary              | Responsibilities                                                        | Anti-Responsibilities                                    |
| --------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| Frontend (React)      | Presentation, routing, client cache, form validation                    | Direct external API secrets, business pricing algorithms |
| Backend               | Auth, RBAC, rate limiting, request orchestration, notification dispatch | UI rendering, heavy ML training                          |
| AI Service            | Feature extraction, model inference, scoring, anomaly detection         | Session auth, emailing                                   |
| Automation            | Browser automation, scraping, scheduled workflows                       | User auth logic, real-time sockets                       |
| Google Sheets Adapter | CRUD + batch operations, caching hooks                                  | Business rules                                           |

---

## 5. SECURITY LAYERS

| Layer              | Mechanism                          | Status                      | Planned Improvement                         |
| ------------------ | ---------------------------------- | --------------------------- | ------------------------------------------- |
| Transport          | HTTPS (deployment target)          | Pending local dev uses HTTP | Add cert automation (Caddy / Let's Encrypt) |
| Auth               | JWT access tokens                  | Implemented                 | Add refresh + rotation + token blacklist    |
| Authorization      | Role-based checks                  | Present in MIA              | Centralize policy module                    |
| Rate Limiting      | Express middleware (not confirmed) | To verify                   | Implement configurable limiter per route    |
| Input Validation   | Basic (likely)                     | Partial                     | Add zod/envalid schemas shared              |
| Secrets            | .env files                         | Scattered                   | Unify ENV_GUIDE + validation                |
| Logging            | Console/loggers (loguru, rich)     | Fragmented                  | JSON structured logs + trace IDs            |
| Dependency Hygiene | Requirements + package.json pinned | Good                        | Add automated audit (npm audit, pip-audit)  |

---

## 6. DATA MODEL (ABSTRACT)

| Entity        | Source           | Persisted In       | Used By                  |
| ------------- | ---------------- | ------------------ | ------------------------ |
| Orders        | OnePage + Manual | Google Sheets      | Dashboard, AI (forecast) |
| Shipments     | OnePage          | Google Sheets      | Tracking, Automation     |
| Carriers      | OnePage          | Google Sheets      | Pricing, Optimization    |
| Employees     | OnePage          | Google Sheets      | Admin Views              |
| Pricing Rules | Config / Service | Sheets / In-memory | Pricing Engine           |
| AI Features   | Derived          | Temp (memory)      | Insight Cards            |

---

## 7. EVENT & REAL-TIME DESIGN

Events delivered via Socket.IO from Backend:

| Event          | Payload                   | Producer             | Consumer                    |
| -------------- | ------------------------- | -------------------- | --------------------------- |
| ai:update      | { jobId, status, result } | AI Service → Backend | Frontend dashboards         |
| sheets:refresh | { sheet, timestamp }      | Automation / Manual  | Frontend tables             |
| notify:alert   | { type, level, message }  | Backend / Jobs       | User UI notification center |
| job:status     | { jobId, progress }       | Automation           | Monitoring panel            |

Planned additions:

- `onepage:import` (after integrating OnePage ingestion)
- `metrics:heartbeat`

---

## 8. SCHEDULING & BACKGROUND JOBS (PLANNED)

| Job                   | Frequency | Owner               | Purpose                   |
| --------------------- | --------- | ------------------- | ------------------------- |
| importOnePageSnapshot | 15m       | Backend (Scheduler) | Sync core entities        |
| automationRun         | Hourly    | Automation Service  | Refresh operational data  |
| aiRecomputeInsights   | 30m       | AI Service          | Update predictive metrics |
| cleanupTempFiles      | Daily     | Backend             | Reduce disk footprint     |

Queue Strategy (future): RabbitMQ or Redis Streams if cron load grows.

---

## 9. CACHING STRATEGY (FUTURE)

| Layer                    | Approach                  | TTL       | Notes                   |
| ------------------------ | ------------------------- | --------- | ----------------------- |
| Sheets Reads             | Redis key per sheet range | 60s       | Reduce API quota usage  |
| AI Results               | Redis hash by jobId       | 10m       | Quick dashboard refresh |
| Auth Sessions (optional) | Redis set                 | Token exp | Support blacklist       |

---

## 10. OBSERVABILITY ROADMAP

| Aspect  | Current                 | Target                             |
| ------- | ----------------------- | ---------------------------------- |
| Metrics | None unified            | Prometheus + /metrics endpoints    |
| Tracing | None                    | OpenTelemetry spans (Backend + AI) |
| Logging | Mixed styles            | JSON + correlation-id middleware   |
| Alerts  | Telegram + Email manual | Rule-based + metrics threshold     |

---

## 11. DEPLOYMENT MODEL

Phased Approach:

1. Dockerize all services (compose dev + prod overrides)
2. Add CI (build, lint, test, security scan)
3. Add staging environment (seed test data)
4. Production rollout with health checks & blue/green upgrade

---

## 12. RISK REGISTER

| Risk                               | Impact           | Likelihood | Mitigation                            |
| ---------------------------------- | ---------------- | ---------- | ------------------------------------- |
| Sheets API quota exhaustion        | Data stale       | Medium     | Introduce caching + batch             |
| Missing centralized env validation | Runtime failures | High       | Implement ENV_GUIDE & validator early |
| Duplicate code recurrence          | Maintenance cost | Medium     | Add code ownership doc                |
| Lack of tests                      | Regression risk  | High       | Establish baseline Jest / Pytest      |
| Selenium flakiness                 | False negatives  | Medium     | Retry harness + containerized browser |

---

## 13. ACTIONABLE NEXT STEPS (TECH)

1. Implement `onePageService` + endpoint + initial test
2. Add `schedulerService` with mock job logging
3. Introduce env validation (`envalid`) + consolidated `.env.example`
4. Add Jest + Supertest baseline (health, onepage, sheets)
5. Integrate React Query & central `apiClient`
6. Implement Redis caching layer (optional pilot)
7. Attach Prometheus client & `/metrics` route
8. Add structured logging (pino or winston + loguru JSON)
9. Define AI inference contract (request/response schema) & version field
10. Draft ML lifecycle plan (model registry placeholder)

---

## 14. APPENDICES

### 14.1 Sequence: OnePage Import (Future)

```text
User triggers Import → Backend /api/onepage/import
  → Fetch OnePage API (future) → Normalize Records
  → Write to Sheets (batched) → Emit sheets:refresh
  → Optionally trigger AI recompute → Emit ai:update
```

### 14.2 Tech Debt Log (Rolling)

| ID    | Item                    | Status | Owner    |
| ----- | ----------------------- | ------ | -------- |
| TD-01 | No env validation       | Open   | Backend  |
| TD-02 | No caching layer        | Open   | Backend  |
| TD-03 | No test baseline        | Open   | All      |
| TD-04 | Logging not structured  | Open   | Platform |
| TD-05 | AI schema not versioned | Open   | AI       |

---

_Architecture document auto-generated baseline. Update as components evolve._
