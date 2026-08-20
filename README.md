## KITROOM

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
- RemoveBG (background removal)

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

### Install Notes

- `multer`: `npm install @nestjs/platform-express multer`
- Types: `npm install -D @types/multer`
