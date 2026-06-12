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
