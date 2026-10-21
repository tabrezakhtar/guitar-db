# Guitar DB API

Guitar DB is a Node.js 22 and Express API for browsing and managing musical equipment, user profiles, authentication, YouTube channels, and livestream schedules. Data is stored in MongoDB. The frontend is maintained separately from this API repository.

## Requirements

- Node.js 22.x
- npm
- MongoDB, local or hosted

## Local Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start MongoDB locally, or use the included Docker Compose service:

   ```sh
   docker compose up -d mongodb
   ```

3. Create a `.env` file in the repository root. Set the database URI and JWT secret at minimum:

   ```dotenv
   DATABASE_URI=mongodb://localhost:27017/guitar-db
   JWT_SECRET=replace-with-a-long-random-secret
   NODE_ENV=development
   ```

4. Start the API:

   ```sh
   npm run dev
   ```

   The development server uses port `5000` by default and restarts when files change. For a normal start, use `npm start`. Set `PORT` to change the port.

The API is available at `http://localhost:5000/api`. The server also serves `/ping` and `/version` outside the API prefix.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URI` | MongoDB connection string. Required for database-backed API requests. |
| `JWT_SECRET` | Secret used to sign and verify authentication tokens. |
| `PORT` | HTTP port. Defaults to `5000`. |
| `NODE_ENV` | Set to `production` to enable production cookie security settings. |
| `CORS_ORIGINS` | Optional comma-separated list of allowed browser origins. |
| `RATE_LIMIT` | Set to `true` to enable MongoDB-backed API rate limiters. |
| `EMAIL` | Resend API key used for verification email delivery. |
| `YOUTUBE_API_KEY` | YouTube Data API key for channel, video, and livestream features. |
| `CLOUD_NAME` | Cloudinary cloud name, used when deleting uploaded images. |
| `API_KEY` | Cloudinary API key. |
| `API_SECRET` | Cloudinary API secret. |
| `OPENROUTER_API_KEY` | Optional key for AI-generated equipment descriptions. |
| `OPENROUTER_MODEL` | Optional OpenRouter model override for equipment descriptions. |

Keep real credentials in the local `.env` file or deployment secret manager; do not commit them.

## Tests

Run the Jest suite:

```sh
npm test
```

Run it once without watch mode or parallel workers:

```sh
npm test -- --runInBand
```

Run tests in watch mode during development:

```sh
npm run test:watch
```

Tests use Jest's Node environment. Unit tests mock databases and external APIs where applicable, so they do not require live service credentials.

## API Areas

All route paths below are relative to `/api`.

- `/health` reports API health.
- `/equipment` provides equipment listing, filtering, search, details, settings, tags, CRUD operations, comments, likes, and description generation.
- `/auth` provides registration, verification, resend-code, and guest-login endpoints.
- `/profile` and `/users` provide profile, account, follow, and favorite-user operations.
- `/youtube` provides channel linking, videos, livestreams, and image proxy endpoints.
- `/schedule` provides schedule management and live, weekly, and user schedule listings.
- `/pages/landing` provides the landing page's recent and popular equipment data.

See [routes/index.js](routes/index.js) for the complete endpoint list and authentication middleware assignments.
