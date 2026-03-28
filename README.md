# DSA Sheet

A production-ready full-stack web application to track your Data Structures & Algorithms problem-solving progress. Built for 10k–50k concurrent users.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | TurboRepo + pnpm workspaces |
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS |
| State | Redux Toolkit + RTK Query |
| Backend | NestJS (modular), TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh token rotation) |
| Deployment | AWS EC2 + S3 + CloudFront + Nginx |

## Project Structure

```
DSAsheet/
├── apps/
│   ├── api/          # NestJS backend (port 3001)
│   └── web/          # Next.js frontend (port 3000)
├── docker/
│   ├── api/Dockerfile
│   ├── web/Dockerfile
│   └── nginx/nginx.conf
├── .github/workflows/ # CI/CD pipelines
├── docker-compose.yml         # Production
├── docker-compose.dev.yml     # Development (MongoDB only)
├── SYSTEM_DESIGN.md
└── README.md
```

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- Docker & Docker Compose
- MongoDB (Atlas or local)

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url> && cd DSAsheet
cp .env.example .env        # fill in your values
pnpm install
```

### 2. Start MongoDB (Docker)

```bash
make docker-dev             # starts MongoDB + Mongo Express (port 8081)
```

### 3. Seed Database

```bash
make seed                   # populates 16 topics + 40+ problems
```

### 4. Start Development

```bash
make dev                    # starts api (:3001) + web (:3000) in parallel
# OR start individually:
make api                    # NestJS only
make web                    # Next.js only
```

### 5. Open Browser

- Web: http://localhost:3000
- API: http://localhost:3001/api/v1
- MongoDB UI: http://localhost:8081

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
MONGODB_URI=mongodb://localhost:27017/dsasheet
JWT_ACCESS_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<different-strong-random-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token (cookie) |
| POST | `/api/v1/auth/logout` | Logout + clear cookie |
| GET  | `/api/v1/auth/me` | Get current user |

### Topics
| Method | Endpoint | Auth | Role |
|--------|----------|------|------|
| GET | `/api/v1/topics` | Required | any |
| GET | `/api/v1/topics/:id` | Required | any |
| POST | `/api/v1/topics` | Required | admin |
| PATCH | `/api/v1/topics/:id` | Required | admin |
| DELETE | `/api/v1/topics/:id` | Required | admin |

### Problems
| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/api/v1/problems` | `topicId`, `difficulty`, `search`, `page`, `limit` |
| GET | `/api/v1/problems/:id` | — |
| POST | `/api/v1/problems` | admin only |
| PATCH | `/api/v1/problems/:id` | admin only |

### Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/progress` | Map of problemId → completed |
| GET | `/api/v1/progress/stats` | Overall stats |
| GET | `/api/v1/progress/topic-stats` | Completion per topic |
| POST | `/api/v1/progress/toggle` | Toggle problem completion |

## Production Deployment (AWS)

### Prerequisites
- EC2 instance (t3.medium+), Docker installed
- S3 bucket + CloudFront distribution
- MongoDB Atlas cluster (M10+)
- ECR repository: `dsasheet-api`

### Required GitHub Secrets

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
EC2_HOST
EC2_SSH_KEY
S3_BUCKET
CF_DISTRIBUTION_ID
MONGODB_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
NEXT_PUBLIC_API_URL
CORS_ORIGIN
```

### Manual Deploy

```bash
# Build & start production stack
docker compose up --build -d

# Or use make
make docker-prod
```

### CI/CD

- **`ci.yml`** — runs on every PR: lint + build
- **`deploy.yml`** — runs on push to `main`:
  - Builds Next.js → syncs to S3 → invalidates CloudFront
  - Builds API Docker image → pushes to ECR → deploys to EC2

## Features

- **Auth**: Signup/login, bcrypt password hashing, JWT access (15m) + refresh (7d) with rotation
- **DSA Sheet**: 16 topics, 40+ curated problems with YouTube/LeetCode/article links
- **Progress Tracking**: Per-problem checkbox, optimistic UI updates, % completion per topic
- **Admin Panel**: Add/edit problems (admin role required)
- **Dark Mode**: System preference detection + manual toggle
- **Search & Filters**: Filter by difficulty, search by title/tags

## Architecture

See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for full HLD/LLD, security design, and scalability analysis.

## License

MIT
# dsasheet
