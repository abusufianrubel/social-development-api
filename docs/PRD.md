নিচে তোমার `social-development-api/PRD.md` সম্পূর্ণ Plain Markdown format-এ দিলাম। এবার কোনো বড় code block ব্যবহার করছি না, তাই সহজে পড়তে ও copy করতে পারবে।

ফাইলের নাম: `PRD.md` Repository: `social-development-api`

# Product Requirements Document (PRD)

# Social Development Events Platform — Backend

## 1. Project Information

| Property | Details |
| --- | --- |
| Project Name | Social Development Events Platform |
| Repository | social-development-api |
| Document | PRD.md |
| Project Type | RESTful Backend API |
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| Authentication | Better Auth |
| Authorization | JWT |
| Language | JavaScript / TypeScript |
| Status | In Development |
| Scope | Backend Only |

## 2. Product Overview

### 2.1 Introduction

Social Development Events Platform is a community-driven application designed to connect people through social service and community development activities.

The backend provides secure REST APIs for creating, discovering, joining, and managing community service events.

Users can organize meaningful initiatives and participate in activities that positively impact their local communities.

Examples:

- Winter Clothes Distribution.
- Blanket Distribution for Needy People.
- Tree Plantation Campaigns.
- Neighborhood Cleanup Programs.
- Blood Donation Campaigns.
- Community Support Activities.

### 2.2 Product Vision

Build a secure, reliable, and maintainable backend system that enables community organizers and volunteers to collaborate through an efficient event management platform.

### 2.3 Target Users

- Community event organizers.
- Volunteers.
- Social development organizations.
- Students.
- Individuals interested in social activities.

## 3. Product Objectives

The backend must:

1. Provide RESTful APIs for event management.
2. Support secure user authentication.
3. Allow authenticated users to create events.
4. Provide public access to upcoming events.
5. Allow authenticated users to join events.
6. Allow event creators to update and delete their own events.
7. Provide joined events and created events information.
8. Support user profile management.
9. Implement JWT-based API authorization.
10. Maintain reliable database operations.
11. Support seamless integration with the Next.js frontend.

## 4. Technology Stack

### Backend Technologies

- Node.js
- Express.js
- JavaScript / TypeScript
- MongoDB

### Authentication & Authorization

- Better Auth
- MongoDB Adapter
- Email and Password Authentication
- Google or GitHub Authentication
- JWT-based API authentication

### Development Tools

- Git and GitHub
- Postman
- npm
- Environment Variables

Repository Scope: This repository contains backend implementation only. The frontend application is maintained separately in `social-development-web`.

## 5. System Architecture

Use a modular backend architecture.

### Architecture Layers

Routes

- Define API endpoints.
- Apply authentication middleware.
- Apply request validation.

Controllers

- Handle incoming requests.
- Coordinate business logic.
- Return API responses.

Services

- Implement reusable business logic.
- Handle event and participation operations.

Models / Database

- Define data structures.
- Perform MongoDB operations.
- Maintain database indexes.

Middleware

- Authentication.
- Authorization.
- Validation.
- Centralized error handling.

### Suggested Project Structure

social-development-api/ │ ├── src/ │ ├── config/ │ ├── controllers/ │ ├── middleware/ │ ├── models/ │ ├── routes/ │ ├── services/ │ ├── validators/ │ ├── utils/ │ ├── app.js │ └── server.js │ ├── .env.example ├── .gitignore ├── package.json ├── AGENTS.md ├── PRD.md └── README.md

Adapt the structure to the existing repository.

## 6. Database Requirements

MongoDB will be used for persistent data storage.

### 6.1 User Collection

User authentication records must follow the configured Better Auth MongoDB adapter schema.

Additional profile information may include:

| Field | Type | Description |
| --- | --- | --- |
| name | String | User display name |
| email | String | User email |
| image | String | Profile picture URL |
| createdAt | Date | Account creation date |
| updatedAt | Date | Last update date |

Do not create conflicting or duplicate authentication systems.

### 6.2 Events Collection

Each event should contain:

| Field | Type | Description |
| --- | --- | --- |
| \_id | ObjectId | Unique event identifier |
| title | String | Event title |
| description | String | Event description |
| eventType | String | Event category |
| thumbnail | String | Event image URL |
| location | String | Event location |
| eventDate | Date | Event date |
| creatorId | String | Authenticated creator ID |
| creatorEmail | String | Creator email |
| createdAt | Date | Creation timestamp |
| updatedAt | Date | Update timestamp |

Requirements:

- Every event must have a unique ID.
- Creator information must come from authenticated identity.
- Event dates must be valid.
- Timestamps must be maintained.

### 6.3 Participation Collection

Each participation record should contain:

| Field | Type | Description |
| --- | --- | --- |
| \_id | ObjectId | Participation identifier |
| eventId | ObjectId | Joined event reference |
| userId | String | Authenticated user ID |
| userEmail | String | User email |
| joinedAt | Date | Participation timestamp |

Requirements:

- Prevent duplicate participation.
- Validate event and user references.
- Add a unique compound index on `eventId` and `userId`.

## 7. Authentication & Authorization

### 7.1 Authentication

Use Better Auth for authentication management.

Required functionality:

- Email and password registration.
- Email and password login.
- Google or GitHub social login.
- Session management.
- MongoDB adapter integration.
- JWT-based API authentication integration.

Do not create a separate competing authentication system.

### 7.2 JWT Authorization

Implement JWT validation for protected API endpoints.

Requirements:

- Verify token authenticity.
- Validate expiration.
- Extract authenticated user identity.
- Reject invalid or expired tokens.
- Protect private API routes.
- Never trust client-provided user IDs or emails.
- Use verified identity for database operations.

Token issuance and verification must follow the actual Better Auth configuration. Do not assume every Better Auth session token is automatically a JWT.

### 7.3 Protected Operations

Authentication is required for:

- Creating events.
- Updating events.
- Deleting events.
- Joining events.
- Retrieving personally created events.
- Retrieving joined events.
- Updating profile information.

### 7.4 Public Operations

Authentication is not required for:

- Retrieving upcoming events.
- Retrieving recent upcoming events.
- Viewing individual event details.

## 8. Functional Requirements

### 8.1 Event Creation

Authenticated users can create community events.

Required fields:

- Event title.
- Description.
- Event type.
- Thumbnail image URL.
- Location.
- Event date.

Business rules:

- Validate all required fields.
- Reject past event dates.
- Validate image URLs.
- Associate the event with the authenticated creator.
- Generate server-side timestamps.
- Return the created event after successful insertion.

### 8.2 Upcoming Events

The API must return upcoming events only.

Requirements:

- Exclude events whose dates have passed.
- Sort events by event date in ascending order.
- Support pagination where appropriate.
- Perform filtering and sorting at database level.

### 8.3 Recent Upcoming Events

Provide an API for the homepage.

Requirements:

- Retrieve upcoming events only.
- Sort by event date.
- Return a maximum of six records.
- Use MongoDB query-level limiting.
- Return fewer than six if fewer qualifying events exist.

### 8.4 Event Details

Requirements:

- Retrieve an event by its unique ID.
- Validate the requested ID.
- Return complete event information.
- Return an appropriate error if the event does not exist.
- Keep event details publicly accessible.

### 8.5 Event Updating

Authenticated event creators can update their own events.

Requirements:

- Authenticate the requester.
- Verify event existence.
- Verify event ownership.
- Validate updated fields.
- Reject unauthorized modifications.
- Update modification timestamp.

Users must never update another user's event.

### 8.6 Event Deletion

Requirements:

- Authenticate the requester.
- Verify event existence.
- Verify ownership.
- Delete only authorized events.
- Handle associated participation records consistently.

### 8.7 Join Event

Authenticated users can join community events.

Requirements:

- Verify authenticated identity.
- Verify event existence.
- Reject joining past events.
- Prevent duplicate participation.
- Store event and user references.
- Record participation timestamp.
- Return meaningful API responses.

### 8.8 Joined Events

Requirements:

- Identify user from authenticated context.
- Retrieve their participation records.
- Include relevant event information.
- Sort by event date.
- Handle empty results correctly.

### 8.9 User-Created Events

Requirements:

- Retrieve events created by the authenticated user.
- Return only the user's own events.
- Support appropriate sorting.
- Handle empty results.

### 8.10 Profile Management

Authenticated users can:

- Retrieve their profile.
- Update their display name.
- Update their profile image.

Requirements:

- Verify authenticated identity.
- Validate profile fields.
- Prevent unauthorized profile modifications.
- Preserve authentication-related fields.

## 9. API Design

Follow RESTful API conventions.

### 9.1 Events API

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/events` | Public | Retrieve upcoming events |
| GET | `/api/v1/events/recent` | Public | Retrieve six recent upcoming events |
| GET | `/api/v1/events/:id` | Public | Retrieve event details |
| POST | `/api/v1/events` | Protected | Create event |
| PATCH | `/api/v1/events/:id` | Protected | Update owned event |
| DELETE | `/api/v1/events/:id` | Protected | Delete owned event |
| GET | `/api/v1/events/my-events` | Protected | Retrieve created events |

### 9.2 Participation API

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/v1/joins` | Protected | Join an event |
| GET | `/api/v1/joins/my-events` | Protected | Retrieve joined events |

### 9.3 User API

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/api/v1/users/me` | Protected | Retrieve current profile |
| PATCH | `/api/v1/users/me` | Protected | Update current profile |

These endpoints represent the proposed API contract. Final endpoint names and response formats must match the actual implementation and frontend integration.

## 10. Validation Requirements

All incoming requests must be validated on the server.

### Event Validation

- Title is required.
- Description is required.
- Event type is required.
- Thumbnail URL must be valid.
- Location is required.
- Event date must be valid and in the future.

### Authentication Validation

- Validate email format.
- Validate required authentication fields.
- Follow configured password rules.
- Reject invalid credentials.

### Participation Validation

- Validate event ID.
- Verify event existence.
- Require authenticated user.
- Prevent duplicate participation.

### Profile Validation

- Validate display name.
- Validate profile image URL.
- Reject unsupported fields.

Use reusable validation middleware or a suitable validation library.

## 11. Error Handling

Implement centralized error handling.

| HTTP Status | Meaning |
| --- | --- |
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request |
| 401 | Authentication required |
| 403 | Forbidden |
| 404 | Resource not found |
| 409 | Duplicate participation or conflict |
| 500 | Internal server error |

### Success Response