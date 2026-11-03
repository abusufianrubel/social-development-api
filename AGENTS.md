
# AGENTS.md

# Social Development Events Platform — Backend

## 1. Project Overview

This repository contains the backend application for the Social Development Events Platform.

The backend is responsible for providing secure REST APIs, managing event data, handling user participation, integrating authentication, and enforcing authorization.

The platform allows users to:

- Create community service events.
- Discover upcoming events.
- View event details.
- Join community events.
- Manage their own events.
- View events they have joined.
- Manage profile information.

### Backend Technology Stack

- Node.js
- Express.js
- MongoDB
- JavaScript or TypeScript
- Better Auth
- JWT Authentication
- REST API

**Scope:** Work exclusively on the backend repository. Do not implement or modify frontend Next.js components, pages, styles, or UI logic.

---

## 2. General Development Guidelines

- Inspect the existing project structure before making changes.
- Follow the existing architecture and coding conventions.
- Write clean, modular, and maintainable code.
- Use meaningful variable and function names.
- Avoid unnecessary dependencies.
- Follow REST API conventions.
- Validate incoming request data.
- Handle errors consistently.
- Use environment variables for sensitive configuration.
- Never hardcode credentials or secrets.
- Avoid duplicating business logic.
- Do not invent frontend requirements or modify the frontend repository.
- Preserve existing functionality when introducing new features.

## 3. Suggested Project Structure

Follow a modular backend architecture.

```text
social-development-api/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── join.controller.js
│   │   └── user.controller.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── models/
│   │   ├── event.model.js
│   │   └── participation.model.js
│   │
│   ├── routes/
│   │   ├── event.routes.js
│   │   ├── join.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/
│   ├── validators/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

This is a recommended structure. Adapt it to the existing project rather than restructuring unnecessarily.

## 4. Database Design

Use MongoDB for persistent application data.

### Event Collection

Suggested fields:

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique event identifier |
| `title` | String | Event title |
| `description` | String | Event description |
| `eventType` | String | Event category |
| `thumbnail` | String | Event image URL |
| `location` | String | Event location |
| `eventDate` | Date | Event date |
| `creatorEmail` | String | Event creator identifier |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Participation Collection

Suggested fields:

| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Unique participation identifier |
| `eventId` | ObjectId | Joined event reference |
| `userId` | String | Authenticated user identifier |
| `userEmail` | String | Authenticated user's email |
| `joinedAt` | Date | Participation timestamp |

Add a unique compound index for event and user identifiers to prevent duplicate participation.

### User Information

User identity and authentication data should follow the configured Better Auth schema and adapter.

Do not create conflicting user collections or duplicate authentication systems.

---

## 5. Authentication & Authorization

Use the configured Better Auth integration.

Requirements:

- Support email/password authentication.
- Support Google or GitHub social authentication.
- Integrate MongoDB adapter as configured.
- Use JWT-based authentication integration.
- Validate authentication credentials or tokens on protected API requests.
- Identify the authenticated user from verified authentication context.
- Never trust user identity supplied directly through request bodies.
- Handle expired or invalid credentials.
- Return appropriate HTTP status codes.

### Protected Operations

Authentication is required for:

- Creating events.
- Updating events.
- Deleting events.
- Joining events.
- Retrieving personal joined events.
- Retrieving personally created events.
- Updating personal profile information.

Public operations include:

- Retrieving upcoming events.
- Retrieving individual event details.

Never assume that frontend route protection provides backend security.

---

## 6. API Requirements

Follow RESTful API conventions.

Suggested API endpoints:

### Events

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/events` | Public | Retrieve upcoming events |
| GET | `/api/v1/events/recent` | Public | Retrieve six recent upcoming events |
| GET | `/api/v1/events/:id` | Public | Retrieve event details |
| POST | `/api/v1/events` | Protected | Create an event |
| PATCH | `/api/v1/events/:id` | Protected | Update an owned event |
| DELETE | `/api/v1/events/:id` | Protected | Delete an owned event |
| GET | `/api/v1/events/my-events` | Protected | Retrieve user's created events |

### Participation

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/v1/joins` | Protected | Join an event |
| GET | `/api/v1/joins/my-events` | Protected | Retrieve joined events |

### User Profile

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users/me` | Protected | Retrieve authenticated user profile |
| PATCH | `/api/v1/users/me` | Protected | Update authenticated user profile |

These endpoints are proposed API contracts. Coordinate with the frontend repository before finalizing route names and response formats.

## 7. Event Management Logic

### Create Event

- Validate all required fields.
- Validate event date.
- Reject past event dates.
- Associate the event with the authenticated creator.
- Generate creation and update timestamps.
- Return the created event after successful insertion.

### Retrieve Upcoming Events

- Return only events with future dates.
- Sort events by event date in ascending order.
- Support pagination where appropriate.
- Implement database-level filtering and sorting.

### Recent Events

- Retrieve upcoming events.
- Sort by event date.
- Limit the result to six records using MongoDB query operations.

### Update Event

- Authenticate the requester.
- Verify event ownership.
- Validate updated information.
- Update only permitted fields.
- Update the modification timestamp.

### Delete Event

- Authenticate the requester.
- Verify event ownership.
- Delete only the authorized event.
- Handle related participation records consistently.

## 8. Event Participation Logic

When a user joins an event:

- Authenticate the user.
- Verify that the event exists.
- Reject participation in past events.
- Prevent duplicate participation.
- Associate participation with the authenticated user.
- Store the event reference.
- Store the participation timestamp.
- Return a meaningful response.

The authenticated user's identity must come from verified server-side authentication context.

## 9. Validation Requirements

Validate all incoming requests.

### Event Validation

- Title is required.
- Description is required.
- Event type is required.
- Thumbnail URL must be valid.
- Location is required.
- Event date must be valid and in the future.

### Authentication Validation

- Validate email format.
- Enforce required password rules where registration validation is handled.
- Validate required registration fields.

### Profile Validation

- Validate name.
- Validate profile image URL.
- Reject unsupported fields.

Use a consistent validation library or reusable validation functions.

## 10. Error Handling

Implement centralized error handling.

Use appropriate HTTP status codes:

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Duplicate resource or participation |
| 500 | Internal server error |

Return consistent JSON responses.

Example:

```json
{
  "success": false,
  "message": "Event not found"
}
```

Never expose stack traces, database credentials, private tokens, or sensitive internal details in production responses.

## 11. Security Requirements

- Use environment variables for credentials.
- Configure CORS for the actual frontend origin.
- Validate and sanitize incoming data.
- Protect private API routes.
- Enforce resource ownership.
- Prevent duplicate event participation.
- Avoid mass assignment vulnerabilities.
- Never trust client-provided user identifiers.
- Use secure authentication configuration.
- Avoid logging passwords, tokens, or sensitive personal information.
- Apply appropriate request size limits and security middleware.

## 12. Environment Configuration

Maintain `.env.example` with placeholder values.

Example:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:5000

CLIENT_URL=http://localhost:3000
```

Add any additional variables required by the actual authentication configuration.

Never commit `.env` or real credentials to GitHub.

## 13. Git Commit Requirements

The assignment requires at least **8 meaningful backend GitHub commits**.

Suggested milestones:

1. `chore: initialize backend project`
2. `feat: configure Express server and MongoDB`
3. `feat: implement authentication integration`
4. `feat: add authentication middleware`
5. `feat: implement event creation and retrieval`
6. `feat: implement event update and deletion`
7. `feat: implement event participation APIs`
8. `feat: add user profile APIs`
9. `feat: implement validation and error handling`
10. `test: verify backend API functionality`

Create commits for meaningful completed changes only.

Never generate fake or empty commits to satisfy the requirement.

## 14. README Requirements

Maintain a meaningful backend README.md containing:

- Project name.
- Backend overview.
- Technology stack.
- API endpoint documentation.
- Environment variable configuration.
- Installation instructions.
- Development commands.
- Deployment information.
- Live API URL when deployed.

Do not invent deployment URLs.

## 15. Testing Requirements

Test the following:

- MongoDB connection.
- Authentication integration.
- JWT validation.
- Public API access.
- Protected API access.
- Event creation.
- Event retrieval.
- Upcoming event filtering.
- Recent six-event query.
- Event update ownership.
- Event deletion ownership.
- Duplicate participation prevention.
- Joined events retrieval.
- Profile retrieval and update.
- Request validation.
- Error responses.

Do not claim tests passed unless they were actually executed successfully.

## 16. AI Agent Workflow

For every development task:

1. Read this AGENTS.md file.
2. Inspect the existing backend structure.
3. Understand existing API contracts.
4. Identify the required changes.
5. Explain the implementation plan.
6. Implement one feature at a time.
7. Follow existing coding conventions.
8. Test the implemented functionality.
9. Check for security and validation issues.
10. Summarize changed files and test results.

Do not modify the frontend repository.

If frontend coordination is required, document the API contract clearly instead of changing frontend code.

---

## Final Objective

Build a secure, reliable, maintainable, and well-structured backend for the Social Development Events Platform.

Prioritize authentication, authorization, data integrity, event ownership, API consistency, validation, and reliable error handling.

All backend functionality must follow the actual assignment requirements and remain compatible with the separate `social-development-web` frontend application.
