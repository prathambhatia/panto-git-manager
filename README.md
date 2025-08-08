# SDE Assignment - Monorepo

This monorepo contains a minimal full-stack implementation for the Git management assignment.

- Backend: Node + Express + Passport (GitHub & GitLab) + Prisma (SQLite for demo)
- Frontend: Next.js (simple UI)

## How to run locally (development)

1. Backend
   - cd backend
   - npm install
   - edit .env with your OAuth app credentials (GitHub/GitLab) and JWT secret
   - npx prisma generate
   - npx prisma migrate dev --name init
   - npm run dev

2. Frontend
   - cd frontend
   - npm install
   - npm run dev

3. Create OAuth Apps:
   - GitHub: https://github.com/settings/developers -> New OAuth App
     - Homepage: http://localhost:3000
     - Authorization callback URL: http://localhost:4000/auth/github/callback
   - GitLab: https://gitlab.com/-/profile/applications
     - Redirect URI: http://localhost:4000/auth/gitlab/callback

## Docker (simple)
A docker-compose file is provided for reference (not production hardened).

See backend/README.md and frontend/README.md for more details.
