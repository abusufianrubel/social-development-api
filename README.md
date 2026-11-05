
# 🌱 Social Development Events Platform — Backend

A RESTful backend application for a community-driven social development events platform. It provides APIs for event management, user participation, authentication, and profile management.

The platform helps people discover, organize, and participate in meaningful community service activities.

## 📖 About The Project

Social Development Events Platform is designed to connect volunteers and community organizers through a centralized event management system.

Users can create community service events, explore upcoming initiatives, join events, and manage their own activities.

Examples of community activities:

- Winter Clothes Distribution
- Blanket Distribution for Needy People
- Tree Plantation Campaigns
- Neighborhood Cleanup Programs
- Blood Donation Campaigns
- Community Support Activities

This repository contains the backend API responsible for managing application data, authentication, authorization, and business logic.

## ✨ Key Features

- **Authentication:** Email and password authentication with Better Auth.
- **Social Login:** Google or GitHub authentication integration.
- **JWT Authorization:** Secure API access using JWT-based authentication.
- **Event Creation:** Authenticated users can create community service events.
- **Event Discovery:** Retrieve upcoming events dynamically.
- **Event Details:** Fetch individual event information.
- **Join Events:** Authenticated users can participate in community events.
- **Manage Events:** Event creators can update and delete their own events.
- **Joined Events:** Retrieve events joined by authenticated users.
- **Profile Management:** Retrieve and update user profile information.
- **Data Validation:** Validate incoming API requests.
- **Error Handling:** Consistent API error responses.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Better Auth | Authentication |
| MongoDB Adapter | Authentication data storage |
| JWT | API authentication |
| JavaScript / TypeScript | Backend development |

## 📁 Project Structure

```text
social-development-api/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
├── AGENTS.md
└── README.md
```

*The project structure may evolve during development.*

## 🚀 Getting Started

Follow these instructions to run the backend application locally.

### Prerequisites

Make sure you have installed:

- Node.js (LTS recommended)
- npm
- MongoDB database
- Git

### 1. Clone the Repository

```bash
git clone YOUR_BACKEND_REPOSITORY_URL
```

### 2. Navigate to the Project Directory

```bash
cd social-development-api
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory.

Example configuration:

```env
PORT=8000
NODE_ENV=development
API_PREFIX=/api/v1

MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_SECRET=replace_with_output_from_npx_auth_secret
BETTER_AUTH_URL=http://localhost:8000
BETTER_AUTH_JWT_ISSUER=http://localhost:8000
BETTER_AUTH_JWT_AUDIENCE=http://localhost:8000
# Optional override; defaults to BETTER_AUTH_URL + API_PREFIX + /auth/jwks.
BETTER_AUTH_JWKS_URL=

CLIENT_URL=http://localhost:3000

# Optional social login; set both values for each provider you enable.
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

Configure additional variables if required by your authentication provider.

**Security Notice:** Never commit real database credentials, authentication secrets, private keys, or tokens to GitHub. Generate `BETTER_AUTH_SECRET` with `npx auth secret`; production requires at least 32 characters. Google and GitHub OAuth are optional; configure both corresponding client ID and secret variables to enable a provider.

### 5. Run the Development Server

Use the development command configured in your `package.json`.

For example:

```bash
npm run dev
```

If a development script is not configured, add one appropriate to the existing project setup.

The local API server should be available at:

```text
http://localhost:8000
```

## 📡 API Endpoints

API routes use the common prefix configured by `API_PREFIX` (default `/api/v1`).
The endpoint paths below show the default prefix; if `API_PREFIX` is changed,
replace `/api/v1` with its configured value.

### Health API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/health` | Public | Report service health, uptime, timestamp, and MongoDB dependency health |

The health endpoint returns HTTP `200` when MongoDB responds to a bounded ping and HTTP `503` when the dependency is unavailable. Its JSON response includes an overall `status` (`healthy` or `unhealthy`), service name, ISO-8601 `timestamp`, process `uptime` in seconds, and per-dependency status. It does not expose connection details or error messages.

### Events API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/events` | Public | Get upcoming events |
| GET | `/api/v1/events/recent` | Public | Get six recent upcoming events |
| GET | `/api/v1/events/:id` | Public | Get event details |
| POST | `/api/v1/events` | Protected | Create an event (implemented) |
| PATCH | `/api/v1/events/:id` | Protected | Update an event |
| DELETE | `/api/v1/events/:id` | Protected | Delete an event |
| GET | `/api/v1/events/my-events` | Protected | Get user's created events |

### Participation API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/joins` | Protected | Join an event |
| GET | `/api/v1/joins/my-events` | Protected | Get joined events |

### User API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users/me` | Bearer JWT | Return the verified caller identity (implemented) |
| PATCH | `/api/v1/users/me` | Bearer JWT | Update current user profile (planned) |

Only `POST /api/v1/events` and `GET /api/v1/users/me` are implemented from these API tables. The remaining Events, Participation, and profile endpoints are proposed and are not implemented yet.

Event creation requires a Bearer JWT and a JSON body containing `title`, `description`, `eventType`, `thumbnail`, `location`, and `eventDate` (an ISO-8601 timestamp with timezone). The event date must be in the future, and the thumbnail must be an HTTP(S) URL. Creator identity and `createdAt`/`updatedAt` timestamps are assigned server-side; client-supplied creator fields are rejected.

Successful requests return `201 Created` with `{ "success": true, "message": "Event created successfully", "data": { "event": ... } }`. Invalid bodies return `400` with field-level validation errors.

## 🔐 Authentication & Authorization

Better Auth handles authentication using the MongoDB adapter and the `BETTER_AUTH_SECRET` environment variable. Email/password authentication is enabled. The API handler is available under `${API_PREFIX}/auth/*`, and the frontend origin from `CLIENT_URL` is trusted. Session lifetime is seven days, with refresh after one day. Google and GitHub sign-in can be enabled by configuring the matching OAuth client ID and secret.

The Better Auth JWT plugin is configured to issue 15-minute EdDSA-signed JWTs. Its public signing keys are served at `${API_PREFIX}/auth/jwks`; after Better Auth sign-in, request `${API_PREFIX}/auth/token` with the Better Auth session cookie to obtain an API JWT. Express protected routes accept only `Authorization: Bearer <JWT>` and validate the signature against the configured JWKS, `exp`, `iss`, `aud`, and `sub`. A Better Auth session cookie is not itself accepted as an API bearer token.

The JWT issuer and audience default to `BETTER_AUTH_URL`. Set `BETTER_AUTH_JWT_ISSUER` or `BETTER_AUTH_JWT_AUDIENCE` only when the JWT issuer/audience is configured to the same values in Better Auth. `BETTER_AUTH_JWKS_URL` can override the computed JWKS URL and must point to the Better Auth public key set. Production auth and JWKS URLs must use HTTPS.

Common Better Auth endpoints include `POST /api/v1/auth/sign-up/email`, `POST /api/v1/auth/sign-in/email`, `GET /api/v1/auth/get-session`, `GET /api/v1/auth/token`, and `POST /api/v1/auth/sign-out`. Provider login uses `POST /api/v1/auth/sign-in/social` with a configured provider and callback URL. Use `credentials: "include"` from browser clients for Better Auth cookie-based sign-in/token exchange; send the returned JWT as a bearer token when calling protected Express APIs.

### Postman JWT verification

Import [`docs/postman/better-auth-jwt.postman_collection.json`](./docs/postman/better-auth-jwt.postman_collection.json), set its `email` and `password` collection variables to a test account, and run requests 1–4 in order. Postman retains the Better Auth session cookie after sign-in; request 2 exchanges it for a JWT and saves the token to the `jwt` collection variable. Request 3 calls the protected `/users/me` route, and request 4 confirms a missing bearer token is rejected. The JWT expires after 15 minutes; repeat requests 1–2 to refresh it.

Authentication features include:

- Email and password authentication.
- Google or GitHub social authentication.
- MongoDB adapter integration.
- JWT-based API authentication through Better Auth's JWKS.
- Protected API route `GET /api/v1/users/me`.
- Verified user identity taken from the JWT subject, never a request body.
- Reusable resource-owner middleware for routes that load an owned resource.

Protected operations require valid authentication.

Important security rules:

- Never trust user IDs or emails supplied directly by clients.
- Verify authenticated user identity on the server.
- When adding resource routes, resolve the resource on the server and apply `requireResourceOwner` before update or deletion; never use a client-supplied owner ID as authorization evidence. The repository currently does not implement event CRUD routes.
- Prevent duplicate event participation.
- Validate authentication credentials or tokens before protected operations.

## 🗄️ Database Management

MongoDB is used to store application data.

Main data entities:

- Users and authentication records.
- Community events.
- Event participation records.

Event records should contain the event title, description, category, image URL, location, event date, creator information, and timestamps.

Participation records should associate an authenticated user with an event.

The application initializes its event and participation collections and indexes during startup. Event and participation documents use Mongoose timestamps. A unique compound index on `eventId` and `userId` prevents duplicate participation; lookup indexes support event date, creator, type, location, and participant queries. Better Auth user and session collections must be configured through its MongoDB adapter and are not represented by custom Mongoose models.

## ⚠️ Error Handling

The API should return consistent JSON responses.

Example successful response:

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {}
}
```

Example error response:

```json
{
  "success": false,
  "message": "Event not found"
}
```

Common HTTP status codes:

| Status | Description |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Duplicate resource |
| 500 | Internal server error |

## 🧪 Testing

Before deployment, verify:

- MongoDB connection.
- Authentication functionality.
- JWT validation.
- Public and protected API access.
- Event creation and retrieval.
- Upcoming event filtering.
- Event update and deletion.
- Event ownership authorization.
- Event joining.
- Duplicate participation prevention.
- Joined events retrieval.
- Profile management.
- Request validation.
- Error handling.

## 🚢 Deployment

The backend can be deployed using platforms such as:

- Render
- Railway
- Other compatible Node.js hosting platforms

Before deployment:

1. Configure production environment variables.
2. Connect the production MongoDB database.
3. Configure authentication URLs and secrets.
4. Configure the frontend origin in CORS.
5. Verify all API endpoints.
6. Test authentication and authorization.
7. Check production logs for errors.

**Live API URL:** [Add Your Deployed Backend URL]

## 🔗 Related Repository

**Frontend Repository:** `social-development-web`

The frontend application is developed separately using Next.js and communicates with this backend through REST APIs.

**Frontend GitHub:** [Add Frontend Repository URL]

## 👨‍💻 Developer

**Project:** Social Development Events Platform

**Repository:** social-development-api

**Assignment:** Web Development

**Backend:** Node.js, Express.js, MongoDB

## 📄 License

This project was developed for educational purposes as part of a Web Development assignment.
