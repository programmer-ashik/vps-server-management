## js-starter-kit

Minimal JavaScript (ESM) Express starter with clean structure, logging, validation, and Mongo integration.

### Features

- Express 4 (JavaScript ESM)
- Central response envelope (`res.ok`, `res.created`, `res.noContent`)
- Centralized error handler with common DB mappings and correlation metadata
- Winston logging with daily rotation to `logs/`
- Access logs via morgan with `requestId` and `clientIp` tokens
- Ready for MongoDB via Mongoose

### Tech Stack

- Node 18+
- Express, Mongoose
- Winston + Daily Rotate File, Morgan
- Yup (optional validation helpers available)

---

### Getting Started

1. Prerequisites

- Node >= 18.18
- A MongoDB instance (local or remote)

2. Install

```bash
npm install
```

3. Environment
   Create a `.env` at the project root or set env vars in your shell. The app also works with plain environment variables without a file.

Required/optional variables consumed by `src/config/env.js`:

- `NODE_ENV` (default: `development`)
- `PORT` (default: `3000`)
- `MONGODB_URI` (default: `mongodb://127.0.0.1:27017/saas-sms`)
- `APP_NAME` (default: `saas-sms`)
- `LOG_LEVEL` (default: `debug` in dev, `info` in prod)

Example `.env`:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/saas-sms
APP_NAME=saas-sms
LOG_LEVEL=debug
```

4. Scripts

```bash
# start dev server with node --watch
npm run dev

# start server
npm start
```

---

### Project Structure

```text
src/
  app.js                     # bootstrap: express, routes, db, error/notfound
  config/env.js              # small env loader for app settings
  loaders/express.loader.js  # core express middleware (json, urlencoded, logging, envelope)
  loaders/mongoose.loader.js # mongoose connection
  loaders/routes.loader.js   # attach API routes
  core/logging/              # winston logger + morgan access logs
  core/http/                 # response envelope, error handler, not found, validation helpers
  api/v1/                    # domain modules (e.g., users, todos)
```

Logs are written to:

- `logs/successes/YYYY-MM-DD-success.log`
- `logs/errors/YYYY-MM-DD-error.log`

Console output is prettified in development.

---

### API Conventions

1. Response Envelope (success)

```json
{
  "success": true,
  "data": {
    /* your payload */
  }
}
```

2. Errors (central handler)

```json
{
  "success": false,
  "code": "INTERNAL_ERROR",
  "message": "Something went wrong",
  "requestId": "<uuid>",
  "clientIp": "<ip>"
}
```

The handler also maps common cases like:

- `CastError` → `400 BAD_REQUEST`
- Duplicate key (`11000`) → `409 DUPLICATE_KEY`

3. Access Logs

- Each request is annotated with `x-request-id` response header.
- Access log format includes requestId and clientIp for correlation.

---

### Development Tips

- Ensure only one dev runner (e.g., `npm run dev`) is active to avoid duplicate startup logs.
- Mongo connection configuration lives in `src/loaders/mongoose.loader.js`.
- Add additional middlewares (CORS, Helmet, Compression, Cookies, Rate Limiting) as needed. Packages are not installed by default to keep the base lean.

---

### License

MIT
