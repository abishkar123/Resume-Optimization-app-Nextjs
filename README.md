# ResumeAI

AI-powered resume optimization platform. Upload a PDF or DOCX resume, provide a target role and job descriptions, and get a professionally rewritten resume tailored to the role — downloadable as a Word document.

## Tech Stack

- **Framework** — Next.js 15 (App Router, TypeScript)
- **Auth** — Firebase Authentication (Google Sign-In)
- **Database** — MongoDB + Mongoose
- **File Storage** — AWS S3
- **AI** — OpenAI GPT (CPRW-style rewriting prompt)
- **Styling** — Tailwind CSS

## Features

- Google Sign-In via Firebase popup
- Upload PDF or DOCX resumes (up to 10 MB)
- Multi-resume management per user
- AI optimization with target role + multiple job descriptions
- Optimization history per resume
- Download optimized resume as a Word document (.docx)
- Rate limiting on upload (10/min) and AI (5/min) endpoints

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB Atlas cluster
- Firebase project with Google Sign-In enabled
- AWS S3 bucket
- OpenAI API key

### Setup

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) below for what each key does.

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` \| `production` |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Model to use (default: `gpt-3.5-turbo`) |
| `MONGODB_URI` | MongoDB connection string |
| `FIREBASE_ADMIN_SDK_JSON` | Full Firebase service account JSON as a single-line string |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `AWS_REGION` | AWS region for S3 (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_S3_BUCKET_NAME` | S3 bucket name for resume storage |

> **Firebase Admin SDK:** Download the service account JSON from Firebase Console → Project Settings → Service Accounts → Generate new private key. Paste the entire JSON as a single-line string into `FIREBASE_ADMIN_SDK_JSON`.

