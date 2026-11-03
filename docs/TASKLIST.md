# Social Development Events Platform — Backend Task List

Project: Social Development Events Platform Repository: `social-development-api` Document: `docs/TASKLIST.md` Scope: Backend Development Only Framework: Express.js Database: MongoDB Authentication: Better Auth Authorization: JWT

## 1. Project Initialization & Setup

- [ ]Initialize Node.js backend project.
- [ ]Configure Express.js application.
- [ ]Configure JavaScript or TypeScript.
- [ ]Create the modular project folder structure.
- [ ]Configure npm scripts.
- [ ]Install required dependencies.
- [ ]Configure environment variables.
- [ ]Create `.env.example`.
- [ ]Configure `.gitignore`.
- [ ]Add initial project documentation.
- [ ]Create initial GitHub commit.

## 2. Backend Architecture

- [ ]Configure application entry point.
- [ ]Configure server entry point.
- [ ]Create routes directory.
- [ ]Create controllers directory.
- [ ]Create services directory.
- [ ]Create middleware directory.
- [ ]Create models directory.
- [ ]Create validators directory.
- [ ]Create configuration directory.
- [ ]Implement centralized error handling.
- [ ]Implement consistent API response structure.

## 3. MongoDB Database Integration

- [ ]Create MongoDB Atlas database.
- [ ]Configure MongoDB connection.
- [ ]Implement database connection utility.
- [ ]Configure connection error handling.
- [ ]Create Events collection.
- [ ]Create Participation collection.
- [ ]Configure Better Auth database collections.
- [ ]Define event data structure.
- [ ]Define participation data structure.
- [ ]Configure timestamps.
- [ ]Add appropriate database indexes.
- [ ]Add unique compound index for event participation.
- [ ]Test database connectivity.

## 4. Authentication — Better Auth

- [ ]Install Better Auth.
- [ ]Configure Better Auth.
- [ ]Integrate MongoDB adapter.
- [ ]Configure email/password authentication.
- [ ]Configure Google or GitHub authentication.
- [ ]Configure authentication session management.
- [ ]Configure authentication secret.
- [ ]Configure trusted frontend origin.
- [ ]Configure authentication API handler.
- [ ]Test user registration.
- [ ]Test user login.
- [ ]Test social authentication.
- [ ]Test session management.

## 5. JWT Authentication & Authorization

- [ ]Configure JWT integration with Better Auth.
- [ ]Establish a documented token issuance strategy.
- [ ]Implement JWT verification middleware.
- [ ]Validate token signature.
- [ ]Validate token expiration.
- [ ]Extract authenticated user information.
- [ ]Implement protected route middleware.
- [ ]Handle missing authentication tokens.
- [ ]Handle invalid tokens.
- [ ]Handle expired tokens.
- [ ]Prevent unauthorized API access.
- [ ]Test protected endpoints.

Important: Use the actual Better Auth JWT configuration. Do not assume the default session token is a JWT.

## 6. Event Management APIs

### 6.1 Create Event

- [ ]Create event model or database operations.
- [ ]Create event controller.
- [ ]Create event service.
- [ ]Create event routes.
- [ ]Implement `POST /api/events`.
- [ ]Validate required fields.
- [ ]Validate event title.
- [ ]Validate event description.
- [ ]Validate event type.
- [ ]Validate thumbnail URL.
- [ ]Validate event location.
- [ ]Validate future event date.
- [ ]Retrieve creator identity from authenticated context.
- [ ]Generate server-side timestamps.
- [ ]Save event in MongoDB.
- [ ]Return created event response.

### 6.2 Get Upcoming Events

- [ ]Implement `GET /api/events`.
- [ ]Retrieve events from MongoDB.
- [ ]Filter out past events.
- [ ]Sort events by nearest date.
- [ ]Implement pagination.
- [ ]Implement event type filtering.
- [ ]Implement location filtering.
- [ ]Implement event search.
- [ ]Return pagination metadata.

### 6.3 Get Recent Upcoming Events

- [ ]Implement `GET /api/events/recent`.
- [ ]Retrieve upcoming events only.
- [ ]Sort by event date ascending.
- [ ]Apply MongoDB `.limit(6)`.
- [ ]Return maximum six events.
- [ ]Test empty database response.

### 6.4 Get Event Details

- [ ]Implement `GET /api/events/:id`.
- [ ]Validate MongoDB ObjectId.
- [ ]Retrieve event by ID.
- [ ]Return complete event information.
- [ ]Handle event not found.
- [ ]Keep endpoint publicly accessible.

### 6.5 Update Event

- [ ]Implement `PATCH /api/events/:id`.
- [ ]Verify authenticated user.
- [ ]Verify event existence.
- [ ]Verify event ownership.
- [ ]Validate updated fields.
- [ ]Validate updated event date.
- [ ]Prevent creator identity modification.
- [ ]Update `updatedAt`.
- [ ]Return updated event.
- [ ]Handle unauthorized modification.

### 6.6 Delete Event

- [ ]Implement `DELETE /api/events/:id`.
- [ ]Verify authentication.
- [ ]Verify event existence.
- [ ]Verify event ownership.
- [ ]Delete authorized event.
- [ ]Handle associated participation records.
- [ ]Return deletion confirmation.
- [ ]Prevent unauthorized deletion.

## 7. Event Participation System

### 7.1 Join Event

- [ ]Create participation model.
- [ ]Create participation controller.
- [ ]Create participation service.
- [ ]Create participation routes.
- [ ]Implement `POST /api/joins`.
- [ ]Verify authenticated user.
- [ ]Validate event ID.
- [ ]Verify event existence.
- [ ]Reject past events.
- [ ]Prevent duplicate participation.
- [ ]Store event reference.
- [ ]Store authenticated user reference.
- [ ]Generate participation timestamp.
- [ ]Save participation record.
- [ ]Return success response.

### 7.2 Get Joined Events

- [ ]Implement `GET /api/joins/my-events`.
- [ ]Retrieve authenticated user ID.
- [ ]Find participation records.
- [ ]Retrieve associated event information.
- [ ]Sort events by event date.
- [ ]Handle empty participation records.
- [ ]Return joined event information.

## 8. User-Created Events

- [ ]Implement `GET /api/events/my-events`.
- [ ]Retrieve authenticated user identity.
- [ ]Find events created by the current user.
- [ ]Sort created events.
- [ ]Support pagination if needed.
- [ ]Return only owned events.
- [ ]Handle empty results.

## 9. User Profile Management

### 9.1 Get Profile

- [ ]Implement `GET /api/users/me`.
- [ ]Verify authentication.
- [ ]Retrieve current user profile.
- [ ]Return profile information.
- [ ]Handle missing user.

### 9.2 Update Profile

- [ ]Implement `PATCH /api/users/me`.
- [ ]Verify authentication.
- [ ]Validate display name.
- [ ]Validate profile image URL.
- [ ]Update allowed profile fields.
- [ ]Prevent modification of protected authentication fields.
- [ ]Return updated profile.

## 10. Request Validation

- [ ]Select a validation library.
- [ ]Create reusable validation middleware.
- [ ]Validate event creation requests.
- [ ]Validate event update requests.
- [ ]Validate event IDs.
- [ ]Validate participation requests.
- [ ]Validate profile update requests.
- [ ]Validate pagination parameters.
- [ ]Validate search parameters.
- [ ]Reject unsupported fields.
- [ ]Return meaningful validation errors.

## 11. Error Handling & API Responses

- [ ]Implement centralized error middleware.
- [ ]Create consistent success response utility.
- [ ]Create consistent error response utility.
- [ ]Handle HTTP 400 errors.
- [ ]Handle HTTP 401 errors.
- [ ]Handle HTTP 403 errors.
- [ ]Handle HTTP 404 errors.
- [ ]Handle HTTP 409 errors.
- [ ]Handle HTTP 500 errors.
- [ ]Handle MongoDB errors.
- [ ]Handle authentication errors.
- [ ]Prevent sensitive information leakage.

## 12. Security Implementation

- [ ]Configure CORS.
- [ ]Configure trusted frontend origin.
- [ ]Add security headers.
- [ ]Implement request body size limits.
- [ ]Validate all incoming data.
- [ ]Prevent mass assignment.
- [ ]Enforce resource ownership.
- [ ]Prevent duplicate participation.
- [ ]Protect private API endpoints.
- [ ]Secure environment variables.
- [ ]Prevent sensitive data logging.
- [ ]Review authentication configuration.

## 13. Database Optimization

- [ ]Add event date index.
- [ ]Add creator ID index.
- [ ]Add event type index.
- [ ]Add participation user ID index.
- [ ]Add unique event/user compound index.
- [ ]Optimize upcoming events queries.
- [ ]Optimize joined events queries.
- [ ]Optimize created events queries.
- [ ]Review MongoDB query performance.
- [ ]Verify indexes.

## 14. API Testing

### Authentication Testing

- [ ]Test registration.
- [ ]Test login.
- [ ]Test social login.
- [ ]Test valid JWT.
- [ ]Test invalid JWT.
- [ ]Test expired JWT.
- [ ]Test protected endpoints.

### Event Testing

- [ ]Test event creation.
- [ ]Test missing required fields.
- [ ]Test invalid event date.
- [ ]Test past event rejection.
- [ ]Test upcoming event retrieval.
- [ ]Test recent six-event retrieval.
- [ ]Test event details.
- [ ]Test event update.
- [ ]Test event deletion.
- [ ]Test event ownership.

### Participation Testing

- [ ]Test joining an event.
- [ ]Test duplicate participation.
- [ ]Test joining past events.
- [ ]Test invalid event ID.
- [ ]Test joined events retrieval.

### User Testing

- [ ]Test profile retrieval.
- [ ]Test profile updating.
- [ ]Test unauthorized profile access.

### System Testing

- [ ]Test MongoDB connection.
- [ ]Test centralized error handling.
- [ ]Test CORS.
- [ ]Test API response consistency.
- [ ]Test production configuration.

## 15. Frontend API Integration

Frontend Repository: `social-development-web`

- [ ]Verify frontend API base URL configuration.
- [ ]Document all API endpoints.
- [ ]Document request payloads.
- [ ]Document response structures.
- [ ]Document authentication requirements.
- [ ]Verify JWT integration with frontend.
- [ ]Test event creation integration.
- [ ]Test upcoming events integration.
- [ ]Test event details integration.
- [ ]Test event joining integration.
- [ ]Test joined events integration.
- [ ]Test manage events integration.
- [ ]Test profile integration.
- [ ]Fix API contract inconsistencies.

## 16. Deployment

- [ ]Prepare production configuration.
- [ ]Configure production environment variables.
- [ ]Create MongoDB Atlas production database.
- [ ]Configure production Better Auth URL.
- [ ]Configure production frontend origin.
- [ ]Prepare deployment configuration.
- [ ]Deploy backend application.
- [ ]Implement health check endpoint.
- [ ]Verify production database connection.
- [ ]Test deployed API endpoints.
- [ ]Verify authentication in production.
- [ ]Verify frontend-backend communication.
- [ ]Fix production errors.

## 17. Documentation

### AGENTS.md

- [ ]Document backend architecture.
- [ ]Define coding conventions.
- [ ]Define development workflow.
- [ ]Define security requirements.
- [ ]Define AI agent instructions.
- [ ]Define testing expectations.

### PRD.md

- [ ]Document product overview.
- [ ]Document functional requirements.
- [ ]Document database requirements.
- [ ]Document authentication requirements.
- [ ]Document API specifications.
- [ ]Document acceptance criteria.

### README.md

- [ ]Add project name.
- [ ]Add project description.
- [ ]Add feature list.
- [ ]Add technology stack.
- [ ]Add installation instructions.
- [ ]Add environment configuration.
- [ ]Add API documentation.
- [ ]Add live backend URL.
- [ ]Add GitHub repository URL.

## 18. GitHub Commit Management

Minimum required backend commits: 8 notable commits.

Suggested commit sequence:

- [ ]Commit 01 — Initialize backend project.
- [ ]Commit 02 — Configure Express server and middleware.
- [ ]Commit 03 — Integrate MongoDB database.
- [ ]Commit 04 — Implement Better Auth authentication.
- [ ]Commit 05 — Implement JWT authentication middleware.
- [ ]Commit 06 — Implement event management APIs.
- [ ]Commit 07 — Implement event participation APIs.
- [ ]Commit 08 — Implement user profile management.
- [ ]Commit 09 — Add request validation and error handling.
- [ ]Commit 10 — Improve API security and database indexes.
- [ ]Commit 11 — Complete API testing.
- [ ]Commit 12 — Update documentation and deployment configuration.

Important: Each commit must represent actual meaningful code changes. Do not create artificial commits just to satisfy the minimum requirement.

## 19. Final Quality Assurance

- [ ]Review entire backend architecture.
- [ ]Remove unused dependencies.
- [ ]Remove unnecessary code.
- [ ]Verify environment configuration.
- [ ]Verify authentication security.
- [ ]Verify event ownership.
- [ ]Verify participation uniqueness.
- [ ]Verify all API responses.
- [ ]Verify database indexes.
- [ ]Verify frontend integration.
- [ ]Verify production deployment.
- [ ]Review README documentation.
- [ ]Confirm assignment requirements are satisfied.

## 20. Final Submission Checklist

- [ ]Backend repository is complete.
- [ ]Backend has minimum 8 notable commits.
- [ ]MongoDB integration works.
- [ ]Better Auth integration works.
- [ ]JWT validation works.
- [ ]Event management APIs work.
- [ ]Participation APIs work.
- [ ]Profile APIs work.
- [ ]Validation is implemented.
- [ ]Error handling is implemented.
- [ ]Security requirements are satisfied.
- [ ]README.md is complete.
- [ ]AGENTS.md is complete.
- [ ]PRD.md is complete.
- [ ]TASKLIST.md is complete.
- [ ]Live backend URL is available.
- [ ]Frontend integration is verified.

## 21. Development Guidelines for AI Agents

When working on this repository, AI coding agents must follow these instructions:

1. Read `AGENTS.md` before modifying code.
2. Read `PRD.md` to understand product requirements.
3. Use this `TASKLIST.md` to track development progress.
4. Inspect existing code before creating or modifying files.
5. Follow the existing architecture and coding conventions.
6. Implement one logical feature at a time.
7. Never invent authentication behavior or database structures.
8. Never bypass JWT verification.
9. Never trust client-provided ownership information.
10. Validate all incoming requests.
11. Test implemented functionality.
12. Update this task list when tasks are genuinely completed.
13. Do not mark incomplete or untested tasks as completed.
14. Avoid unnecessary dependencies and unrelated modifications.
15. Keep API contracts consistent with `social-development-web`.

Document Status: Development Task Breakdown Repository: `social-development-api` Document Path: `docs/TASKLIST.md` Version: 1.0

End of Task List.
