# Story Points Poker

Simple and fast Planning Poker for teams. Built with Next.js 14, Tailwind CSS, and Vercel KV (Redis).

## Features

- ✅ Create rooms instantly
- ✅ Real-time updates via polling
- ✅ Dark/Light theme support
- ✅ Mobile responsive
- ✅ No authentication required
- ✅ Room auto-expires after 3 hours of inactivity

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React
- **UI:** shadcn/ui, Tailwind CSS, next-themes
- **Backend:** Next.js API Routes
- **Database:** Vercel KV (Redis)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Vercel KV credentials (get these from Vercel Dashboard)
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

**Note:** For local development without Redis, the app will work but rooms won't persist between server restarts.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Room

1. Go to the home page
2. Enter your name
3. Click "Create room"
4. Share the room link with your team

### Joining a Room

1. Open the room link shared by the creator
2. Enter your name
3. Click "Join room"

### Voting

1. Select a card with your estimate (1, 2, 3, 5, 8, 13, 21, ?, ☕️)
2. Your vote is hidden until the moderator reveals results

### Moderator Actions

As the room creator, you can:
- **Show/Hide estimates:** Toggle visibility of all votes
- **Delete estimates:** Reset all votes and start a new round

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### 3. Add Redis Database

1. In your Vercel project, go to **Storage** tab
2. Click "Create Database" → **KV** (or use Upstash Redis from Marketplace)
3. Follow the setup instructions
4. Environment variables will be automatically added to your project

### 4. Redeploy

After adding the KV database, trigger a new deployment to apply the environment variables.

## Project Structure

```
story-points-poker/
├── app/
│   ├── api/room/              # API endpoints
│   ├── room/[id]/             # Room page
│   ├── page.tsx               # Home page
│   └── layout.tsx             # Root layout
├── components/                # React components
├── lib/                       # Utils, types, Redis client
└── PRD.md                     # Product Requirements
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `KV_REST_API_URL` | Vercel KV REST API URL | Yes (for production) |
| `KV_REST_API_TOKEN` | Vercel KV REST API Token | Yes (for production) |
