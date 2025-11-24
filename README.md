This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## KiraStreams API + Frontend (Local Setup)

This project includes an Express + MongoDB API under `server/` and the Next.js frontend under `src/`.

### 1) Backend API (Express)

1. Copy env and configure MongoDB and JWT secret:
   - Create `server/.env` with:
     ```bash
     MONGODB_URI=mongodb://127.0.0.1:27017
     MONGODB_DB=kirastreams
     JWT_SECRET=replace_with_a_long_random_string
     ```
2. Install dependencies and start the server:
   ```bash
   cd server
   npm install
   npm start
   ```
   The API runs at http://localhost:4000 (health: `GET /api/health`).

### 2) Frontend (Next.js)

1. Create `.env.local` in the project root (or copy `.env.local.example`):
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```
2. Install dependencies and run the dev server from the project root:
   ```bash
   npm install
   npm run dev
   ```

### 3) Auth Flow
- Use the header Log in / Sign up dialogs on the homepage.
- When the API is running, login/signup will call `POST /api/auth/*` and store a JWT in `localStorage` (`ks_token`).
- Requests that require auth (creating/deleting movies, posting comments) automatically attach `Authorization: Bearer <token>`.

### 4) Features Wired to API
- Homepage search + filters fetch from `GET /api/movies` with `q`, `genre`, `year`, `sort`.
- Watch page fetches movie details, related titles by genre, and comments.
- Comments: `GET /api/comments/:movieId`, `POST /api/comments/:movieId` (requires auth).
- Admin dashboard: `POST /api/movies` to add, `DELETE /api/movies/:id` to remove (requires auth).

Notes:
- If the API is unavailable, the UI gracefully falls back to demo/mock data so you can still explore the app.
- Ensure MongoDB is running locally for the API to persist data.
- CORS is enabled on the API; the frontend base URL is controlled by `NEXT_PUBLIC_API_URL`.