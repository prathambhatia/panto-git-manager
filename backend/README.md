# Backend - SDE Assignment

## Quick start (local demo)

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure `.env` with OAuth credentials (GitHub/GitLab) and a JWT secret.

3. Initialize Prisma DB (SQLite for demo):
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Run server:
   ```bash
   npm run dev
   ```

5. Open frontend at http://localhost:3000 (see /frontend)

## Notes

- This demo uses SQLite for ease. For production/real deploy, change `DATABASE_URL` to Postgres and run migrations.
- For LOC counting we clone the repo shallowly and count lines for common source file extensions. This requires `git` to be installed on the server.
