## KITOYA

This is a React Native application built with Expo, to allow users to easily manage their sports jerseys collection. The app features a sleek and modern design, with a focus on user experience and ease of use.

<img width="900" height="1195" alt="IMG_9382" src="https://github.com/user-attachments/assets/6acd9271-e72e-4d0a-a1d5-a8301df11f39" />

### Features

- Add and manage your sports jerseys collection
- Take photos of your jerseys and add them to your collection
- Locker room to view and organize your jerseys
- Home screen with quick access to add new jersey, last added, kit of community to share a random jersey from a user every day, statistics
- Search and filter your collection by team, league, year, and more
- Like integration to like kit of community jerseys and jerseys on public profiles
- export your collection in csv/ json / or printable pdf
- settings screen to manage your account, add bio, change password, delete account, and more

### Technologies Used

#### Mobile

- React Native
- Expo

#### Backend

- NestJS
- Prisma 6
- PostgreSQL (Neon)

#### Authentication

- NestJS Passport (Native Authentication Handler)
- JWT (Access Token stored securely via Expo SecureStore)
- Native OAuth2 (Google Sign-In)

#### Data

- API-Football

#### Storage & Media

- Cloudflare R2 (image storage)
- Sharp (image compression and resizing)
- RemoveBG (background removal) eventually to be replaced by FAPIHUB

#### Testing

- Jest (unit testing with NestJS)

### Deployment (Planned)

- VPS with Docker + Nginx reverse proxy (backend)
- EAS Build + App Store / Google Play (mobile)

## Technical Notes & Troubleshooting

### Known Issues We Solved

- **Prisma 7 vs NestJS:** Prisma 7 introduced ESM and driver adapter constraints that did not fit our NestJS setup. We kept **Prisma 6** for a simpler CommonJS flow and native engine support.
- **JWT user mapping on jersey creation:** the backend was reading `req.user.id`, while the JWT payload exposes `req.user.userId`. This caused jersey creation to fail until the controller was updated.
- **R2 image display:** public R2 links returned `404`, so jersey images were not loading in the app. We switched to **signed R2 URLs** for read responses.
- **Frontend image card:** the jersey card now tolerates missing or failing image URLs and shows a fallback instead of a blank area.
- **TypeScript deprecation warning:** `baseUrl` triggered a TypeScript deprecation warning, so we aligned the compiler setup to keep the backend build clean.
- **ValidationPipe** silently missing: no ValidationPipe was ever registered in main.ts, so all class-validator decorators on DTOs were effectively no-ops for a long time — malformed payloads were reaching the service layer unchecked.
- **`nest build` vs `nest start --watch` config drift:** after adding an explicit `rootDir`/`include` to `tsconfig.json` for Jest, `nest start --watch` silently stopped emitting `dist/main.js` (or emitted it under `dist/src/`), breaking `node dist/main` on every dev restart. Root cause: `nest build` reads `tsconfig.build.json` while `nest start --watch` reads `tsconfig.json` directly, and the two had drifted out of sync. Fixed by isolating Jest's config into its own `tsconfig.spec.json`.
- **ESM-only packages breaking Jest:** `uuid` and `expo-server-sdk` ship native ES module syntax (`SyntaxError: Unexpected token 'export'`). Fixed via `transformIgnorePatterns` so Jest transpiles those packages instead of skipping them.
- local dev database drifted heavily from schema.prisma (only had the
  original 7 columns from the first migration, missing location, bio,
  currency, role, etc. added since via db push, never migrated).
  Symptom: P2022 errors mentioning a generic 'colonne' column. Fixed
  with `npx prisma db push` locally.

### Install Notes

- `multer`: `npm install @nestjs/platform-express multer`
- Types: `npm install -D @types/multer`

### MCD

 <img width="1198" height="831" alt="kitoya_MCD" src="https://github.com/user-attachments/assets/5715029b-337b-421c-8204-48b0282fddc3" />

### VPS configuration

first connection with server name and password

- update and upgrade server
- create ssh key pair and add public key to server to connect without password
- change ssh port to custom port
- firewall UFW configuration to allow only ssh port and http/https ports
- install fail2ban to protect against brute force attacks
- install docker
- install nginx
- install certbot to get ssl certificate for domain
- clone the project from github to server
- create .env file with environment variables for backend
- build and run backend docker container
- configure neon database and set DATABASE_URL in .env file
- configure an OVH DNS A record pointing the custom domain (api.kitoya.com) to the VPS IP address
- configure Nginx as a reverse proxy to route incoming traffic securely to the backend container
- install and configure Certbot with Nginx plugin to issue a Let's Encrypt SSL certificate, enabling HTTPS and automated background renewal

## Staging environment

A separate staging environment runs alongside production on the same VPS, sharing the same codebase but with isolated data and configuration.

- create a Neon database branch ("staging") from production, with no auto-delete
- create a separate Cloudflare R2 bucket ("kitoya-staging") for staging file storage
- create a .env.staging file in ~/kitoya/backend with staging-specific values (DATABASE_URL, R2_BUCKET_NAME, R2_PUBLIC_URL, GOOGLE_CALLBACK_URL), without quotes around values (Docker --env-file does not strip them)
- add an OVH DNS A record for api-staging.kitoya.com pointing to the same VPS IP address
- create a new Nginx server block (kitoya-staging-apiserver) proxying api-staging.kitoya.com to localhost:3001
- issue a separate Let's Encrypt SSL certificate for api-staging.kitoya.com via Certbot
- build a separate Docker image (kitoya-backend-staging) and run it on port 3001, using .env.staging

|           | Production               | Staging                  |
| --------- | ------------------------ | ------------------------ |
| URL       | `api.kitoya.com`         | `api-staging.kitoya.com` |
| Port      | 3000                     | 3001                     |
| Database  | Neon `production` branch | Neon `staging` branch    |
| R2 bucket | `kitoya`                 | `kitoya-staging`         |

### Useful commands

- build image: `sudo docker build -t kitoya-backend .`
- force rebuild ignoring cache: `sudo docker build --no-cache -t kitoya-backend .`
- run container: `sudo docker run -d --name kitoya-backend -p 3000:3000 --env-file .env --restart unless-stopped kitoya-backend`
- check running containers: `sudo docker ps`
- view logs: `sudo docker logs kitoya-backend`
- stop and remove before redeploying: `sudo docker stop kitoya-backend && sudo docker rm kitoya-backend`
- pull latest code and redeploy: cd ~/kitoya && git pull && cd backend
  sudo docker build -t kitoya-backend .
  sudo docker stop kitoya-backend && sudo docker rm kitoya-backend
  sudo docker run -d --name kitoya-backend -p 3000:3000 --env-file .env --restart unless-stopped kitoya-backend

### ==> script created to automate this: `~/kitoya/deploy-prod.sh`

#### for staging:

sudo docker build -t kitoya-backend-staging .
sudo docker stop kitoya-backend-staging
sudo docker rm kitoya-backend-staging
sudo docker run -d --name kitoya-backend-staging -p 3001:3000 --env-file .env.staging kitoya-backend-staging

### ==> script created to automate this: `~/kitoya/deploy-staging.sh`

- check firewall rules: `sudo ufw status`
- check banned IPs: `sudo fail2ban-client status sshd`

### Known issues config server

- compiled `prisma.config.js`/`.bak`/`.map`/`.d.ts` artifacts (source is
  `prisma.config.ts`) kept being re-tracked by `git add .` because they
  were missing from `.gitignore` — broke `prisma generate` in Docker
  builds ("Failed to parse syntax of config file"). Fixed by adding
  them to `.gitignore` and `git rm --cached`.
- `schema.prisma` had a custom Prisma client `output` path
  (`../generated/client`) that broke every `@prisma/client` import in
  the codebase — reverted to the default output location.
- Docker caches build steps aggressively; after fixing source files,
  always rebuild with `--no-cache` to make sure the fix is actually
  picked up, not silently reusing a stale cached layer.
