# DSA Sheet — System Design Document

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                     CLIENTS                         │
│  Browser (Next.js SSR/CSR) · Mobile (future)        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────┐
│              CDN / CloudFront (AWS)                 │
│  Static assets, _next/static, immutable cache       │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│               Nginx Reverse Proxy                   │
│  Rate limiting · SSL termination · Compression      │
│  /api/* → NestJS :3001   /  → Next.js :3000         │
└────────┬─────────────────────────┬──────────────────┘
         │                         │
┌────────▼────────┐       ┌────────▼────────┐
│  NestJS API     │       │  Next.js Web    │
│  :3001          │       │  :3000          │
│  Modular arch   │       │  App Router     │
│  JWT + Passport │       │  RTK Query      │
└────────┬────────┘       └─────────────────┘
         │
┌────────▼──────────────────┐
│  MongoDB Atlas / Self     │
│  Replica Set (3 nodes)    │
│  Indexed collections      │
└───────────────────────────┘
```

---

## 2. Technology Choices & Justification

| Layer | Choice | Why |
|-------|--------|-----|
| Monorepo | TurboRepo + pnpm | Shared tooling, build caching, workspace isolation |
| Frontend | Next.js 14 App Router | SSR for SEO, Server Components reduce JS bundle, Edge-ready |
| State | Redux Toolkit + RTK Query | Predictable state, built-in caching + optimistic updates |
| Backend | NestJS | Modular DI, Decorator-based, TypeScript-first, scalable |
| Database | MongoDB + Mongoose | Flexible schema for DSA content, horizontal scaling |
| Auth | JWT (access + refresh) | Stateless API, horizontal scaling, secure rotation |
| Proxy | Nginx | Industry-standard, rate limiting, SSL, zero-overhead |
| Infra | AWS EC2 + S3 + CloudFront | Industry-standard, global CDN, cost-effective |
| CI/CD | GitHub Actions | Native GitHub integration, free tier, ECR support |

---

## 3. Request Flow

### Authenticated Request Flow
```
1. Client → Nginx (verify SSL, rate limit)
2. Nginx → NestJS (/api/*)
3. JwtAuthGuard validates Bearer token
4. Controller → Service → MongoDB
5. TransformInterceptor wraps response: { success, data, timestamp }
6. Nginx → Client
```

### Token Refresh Flow
```
1. RTK Query base query → 401 Unauthorized
2. baseQueryWithReauth fires POST /api/v1/auth/refresh
3. NestJS validates refresh token from HTTP-only cookie
4. New access token issued (15m) + new refresh token set in cookie (rotation)
5. Original request retried with new access token
```

---

## 4. Authentication Design

### Why HTTP-only cookies for refresh tokens?
- Inaccessible to JavaScript → immune to XSS attacks
- `SameSite=Strict` prevents CSRF
- `Secure` flag in production ensures HTTPS-only transmission

### Token Rotation
- Each `/auth/refresh` call invalidates the old refresh token (hash stored in DB)
- Prevents refresh token replay attacks
- 7-day expiry with rotation means active users stay logged in indefinitely

### bcrypt rounds=12
- ~250ms hash time on modern hardware — slow enough to resist brute force
- Industry standard for production systems

---

## 5. Database Schema

### Collections

```
users
├── _id: ObjectId
├── name: String
├── email: String (unique, index)
├── password: String (bcrypt, select:false)
├── role: "user" | "admin"
└── refreshToken: String | null (hashed, select:false)

topics
├── _id: ObjectId
├── title: String
├── description: String
└── order: Number (index)

problems
├── _id: ObjectId
├── topicId: ObjectId (ref:Topic, index)
├── title: String
├── difficulty: "Easy"|"Medium"|"Hard" (index)
├── tags: String[] (index)
├── youtubeLink, codingLink, articleLink: String
├── description: String (markdown)
└── order: Number
   Compound index: { topicId, difficulty }

userProgress
├── _id: ObjectId
├── userId: ObjectId (ref:User, index)
├── problemId: ObjectId (ref:Problem, index)
└── completed: Boolean
   Compound UNIQUE index: { userId, problemId }
   (Upsert on toggle — O(1) write with unique constraint)
```

---

## 6. Progress Tracking Design

### Why upsert instead of update?
`findOneAndUpdate({ userId, problemId }, { completed }, { upsert: true })` ensures:
- Exactly one DB write regardless of whether the record exists
- Atomic operation — no race conditions
- O(1) via compound index lookup

### Optimistic Updates
RTK Query patches the cache immediately on checkbox click, then reverts if the API call fails. This gives sub-10ms perceived response time.

---

## 7. Scalability (10k–50k users)

### Stateless API
NestJS holds no session state. Horizontal scaling = add EC2 instances behind a load balancer. JWT tokens are self-contained.

### MongoDB Indexing Strategy
```
users:       email (unique)                     → O(log n) auth lookup
topics:      order                              → O(log n) sorted fetch
problems:    topicId, difficulty, tags          → O(log n) filtered queries
             (topicId, difficulty) compound     → O(log n) combined filter
userProgress: (userId, problemId) unique        → O(1) toggle
              userId                            → O(log n) progress fetch
```

### Caching Opportunities (Redis — future)
- `GET /topics` — static, cache 1h, invalidate on admin write
- `GET /problems?topicId=` — semi-static, cache 30m
- User progress — per-user, cache 5m

### CDN
Next.js static assets (`_next/static`) served from CloudFront with `max-age=31536000, immutable`. Near-zero origin load for static content.

---

## 8. Security

| Threat | Mitigation |
|--------|-----------|
| XSS | HTTP-only cookie for refresh token; CSP headers via Helmet |
| CSRF | `SameSite=Strict` cookie; CORS whitelist |
| Brute force | Nginx rate limiting (20 req/min on /auth/*) |
| SQL injection | N/A — MongoDB + Mongoose ODM |
| NoSQL injection | `class-validator` DTOs strip unknown fields (`whitelist: true`) |
| Privilege escalation | RolesGuard on all admin endpoints |
| Sensitive data leak | `select: false` on password + refreshToken fields |

---

## 9. AWS Deployment Architecture

```
Internet → Route 53 (DNS)
         → CloudFront (CDN for static)
         → EC2 (t3.medium, Amazon Linux 2023)
              ├── Nginx :80/:443
              ├── Docker: dsasheet-api :3001
              └── Docker: dsasheet-web :3000
         → MongoDB Atlas (M10+ cluster, VPC peering)
```

### EC2 Setup Checklist
1. Install Docker + Docker Compose
2. Configure security groups: 80, 443 inbound; 27017 to Atlas only
3. Install AWS CLI + ECR credentials
4. Clone repo, copy `.env`
5. `docker compose up -d`
6. Certbot for Let's Encrypt SSL

---

## 10. API Versioning

All routes are prefixed `/api/v1/`. When breaking changes are needed, `/api/v2/` runs in parallel until clients migrate — zero downtime version transitions.
