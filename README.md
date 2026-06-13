## KITROOM

This is a React Native application built with Expo, to allow users to easily manage their sports jerseys collection. The app features a sleek and modern design, with a focus on user experience and ease of use.

### Features

- Add and manage your sports jerseys collection
- Take photos of your jerseys and add them to your collection
- Locker room to view and organize your jerseys
- Home screen with quick access to add new jersey, story about a jersey, and more
- Wish list to keep track of jerseys you want to add to your collection

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
- JWT (Access & Refresh Token rotation tailored for Mobile Secure Store)
- Native OAuth2 (Google Sign-In & Sign-In with Apple via Expo Native SDKs, validated by NestJS backend)

#### Data

- API-Football + TheSportsDB (initial feed data for teams)

#### Storage & Media

- Cloudflare R2 (image storage)
- Sharp (image compression and resizing)
- Replicate/ REMBG (background removal)

#### Testing

- Jest (unit testing with NestJS)
- Supertest (integration testing with NestJS)

#### Deployment

- Render (backend)
- Expo (mobile app)

## Technical Notes & Troubleshooting

### Prisma Version Choice (v6 vs v7)

During the initial setup of the backend, we encountered major compatibility issues with **Prisma 7** and **NestJS**'s architecture:

1. **Module Format Conflicts:** Prisma 7 generates ES Modules (`.js` imports) by default, which throws `ReferenceError: exports is not defined` when executed within NestJS's native CommonJS environment.
2. **Driver Adapters Complexity:** Prisma 7 deprecates the built-in native Rust engines in favor of JavaScript Driver Adapters (like `@prisma/adapter-pg`). In a traditional NestJS local development environment, this introduces unnecessary boilerplate, manual connection pool managing (`pg` Pool), and runtime argument errors (`ERR_INVALID_ARG_TYPE`).

**Decision:** To keep the codebase stable, clean, and production-ready without fighting configuration overhead, **we intentionally downgraded to Prisma 6**.
Prisma 6 uses the native engine out-of-the-box, requires zero driver adapter boilerplate in the `PrismaService`, and integrates seamlessly with NestJS dependency injection.
