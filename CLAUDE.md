# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint via Next.js
npm run type-check   # TypeScript check without emitting
npm test             # Run all Jest tests
npm run test:watch   # Run tests in watch mode
npx jest __tests__/api/health.test.ts  # Run a single test file
```

## Architecture

**ResumeAI** is a Next.js 15 App Router application. Users sign in with Google (Firebase), upload resumes, and get AI-optimized versions back.

### Auth flow
The app uses a dual-layer auth pattern:
1. **Middleware** (`src/middleware.ts`) — runs in Edge Runtime; strips `x-user-id` headers (spoof prevention), returns early 401 for API routes with no token, and redirects unauthenticated page navigations to `/?auth=login` which opens the sign-in modal.
2. **Route handlers** — each API route calls `getAuthenticatedUserId(request)` from `src/lib/auth.ts` to verify the Firebase Bearer token via `firebase-admin`. Middleware is a first gate only; route handlers are the authoritative check.

The client stores `authToken` and `userInfo` in `localStorage`. The `AuthModalContext` (`src/context/AuthModalContext.tsx`) controls the sign-in modal's open/closed state globally.

### Data flow for resume optimization
1. Client calls `POST /api/upload` — parses multipart form (busboy via `src/lib/form-parser.ts`), extracts text from PDF/DOCX (pdf-parse / mammoth), uploads the original file to S3 (`src/lib/s3.ts`), then calls `POST /api/resume` to persist a `Resume` document in MongoDB.
2. Client calls `POST /api/optimize` with `resumeId`, `targetRole`, and `jobDescriptions[]`. The route fetches the resume text from MongoDB, calls `optimizeResume()` in `src/lib/openai.ts`, persists an `OptimizationResult` document, and returns the optimized markdown.
3. The `OptimizationResult` component renders the markdown result using `react-markdown` + `remark-gfm`.

### Rate limiting
In-memory token-bucket rate limiter in `src/lib/rateLimit.ts`. Two presets: `upload` (10 req/min) and `ai` (5 req/min), keyed by Firebase UID. Resets are lost on server restart — this is intentional for the current scope.

### MongoDB models (all in `src/lib/mongodb.ts`)
- `User` — upserted on `POST /api/auth/verify` after Google sign-in
- `Resume` — `{ userId, filename, text, s3Key }`
- `OptimizationResult` — `{ userId, resumeId, originalText, optimizedText, targetRole, jobDescriptions[], model }`

### Route groups
- `src/app/(auth)/` — protected pages (dashboard, resume upload, resume detail); the `(auth)/layout.tsx` wraps these with an auth guard that reads `authToken` from `localStorage`.
- `src/app/api/` — all API routes; always call `getAuthenticatedUserId` before any data access.

### API response shape
All API routes use helpers from `src/utils/response.ts`:
```ts
{ success: true, data: ... }       // successResponse()
{ success: false, error: "..." }   // errorResponse() / unauthorizedResponse() / etc.
```

### Path alias
`@/` maps to `src/` (configured in `tsconfig.json` and mirrored in `jest.config.js`).

## Environment variables

Copy `.env.example` to `.env.local` before running locally. The `FIREBASE_ADMIN_SDK_JSON` variable must be the full service account JSON as a single-line string (no line breaks).
