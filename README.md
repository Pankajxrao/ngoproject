# Food Donation Platform — Backend API

A backend API for managing food donations between restaurants and NGOs. The platform allows restaurants to publish surplus food, verified NGOs to accept and collect donations, and administrators to manage verification and monitor donation activity.

The backend is built with **Next.js App Router, TypeScript, MongoDB, and Mongoose**. It uses role-based authentication, location-based NGO discovery, and email notifications to support the donation lifecycle.

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [How the System Works](#how-the-system-works)
4. [User Roles and Permissions](#user-roles-and-permissions)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Authentication](#authentication)
9. [API Reference](#api-reference)
10. [Donation Lifecycle](#donation-lifecycle)
11. [Email Notifications](#email-notifications)
12. [Testing with Postman](#testing-with-postman)
13. [Common Errors](#common-errors)
14. [Security and Production Notes](#security-and-production-notes)

---

## Features

- Restaurant and NGO profile management.
- Role-based access for administrators, restaurants, and NGOs.
- Restaurant and NGO verification by administrators.
- Food donation creation and management.
- NGO acceptance of available donations.
- Donation pickup and completion tracking.
- Location-based discovery of nearby eligible NGOs.
- Monthly donation statistics for restaurants and NGOs.
- Email notifications to restaurants when their donations are picked up.
- MongoDB geospatial queries for nearby NGO discovery.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | API routes and backend application |
| TypeScript | Type-safe development |
| MongoDB | Persistent data storage |
| Mongoose | MongoDB models, queries, and validation |
| JWT-based authentication | Authenticated user identity |
| HTTP-only cookies | Session token transport |
| Zod, where used | Request data validation |
| Nodemailer | Sending email notifications |
| Gmail SMTP | Email delivery |
| Postman | API testing |

## How the System Works

The platform has three types of users.

- **Restaurant:** Creates food donations and manages its restaurant profile.
- **NGO:** Maintains its NGO profile, discovers eligible donations, accepts them, and records pickup and completion.
- **Admin:** Verifies restaurants and NGOs and monitors donation activity.

The typical workflow is:

1. A user registers and logs in.
2. A restaurant or NGO creates its profile.
3. An administrator verifies the profile.
4. A verified restaurant creates a food donation.
5. An eligible NGO discovers the donation and accepts it.
6. The NGO collects the food and changes the donation status to `picked_up`.
7. The backend sends an email to the restaurant's registered email address, including the NGO name.
8. The NGO marks the donation as `completed` after the handover process is finished.
9. Administrators can review monthly donation and acceptance statistics.

### Workflow overview

```text
User Registration / Login
          |
          v
  Role-based Access
          |
    +-----+------+
    |            |
    v            v
 Restaurant     NGO
 Profile        Profile
    |            |
    +-----+------+
          |
          v
 Admin Verification
          |
          v
 Restaurant Creates Donation
          |
          v
 Donation: available
          |
          v
 NGO Accepts Donation
          |
          v
 Donation: accepted
          |
          v
 NGO Picks Up Food
          |
          v
 Donation: picked_up
          |
          +----> Email Sent to Restaurant
          |
          v
 Donation: completed
```

The API also supports restaurant cancellation of a donation while it is still available.

---

## User Roles and Permissions

| Action | Admin | Restaurant | NGO |
|---|---|---|---|
| Manage own profile | Depends on implemented routes | Yes | Yes |
| Create a food donation | No, unless separately implemented | Yes | No |
| View donations | All donations, where supported | Own donations | Available and assigned donations |
| Accept a donation | No | No | Yes |
| Mark a donation as picked up | No | No | Assigned NGO only |
| Complete a donation | No | No | Assigned NGO only |
| Cancel an available donation | No | Owner only | No |
| Verify restaurants | Yes | No | No |
| Verify NGOs | Yes | No | No |
| View administrative statistics | Yes | No | No |

Authorization is based on the authenticated user's role and ownership of the relevant resource. An authenticated user should not be able to modify another user's profile or donation simply by changing an ID in the URL.

> **Important:** A valid login does not automatically make a restaurant or NGO eligible for every operation. Verification and donation assignment are additional business rules.

---

## Project Structure

The following is the conceptual structure of the API routes discussed in this project. Adjust it to match the actual files in your repository.

```text
src/
├── app/
│   └── api/
│       ├── donations/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── accept/
│       │       │   └── route.ts
│       │       ├── status/
│       │       │   └── route.ts
│       │       └── nearby-NGO/
│       │           └── route.ts
│       ├── restaurants/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── verify/
│       │           └── route.ts
│       ├── ngo/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── verify/
│       │           └── route.ts
│       └── admin/
│           ├── restaurants/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── donations/
│           │           └── route.ts
│           └── ngo/
│               ├── route.ts
│               └── [id]/
│                   └── donations/
│                       └── route.ts
├── lib/
│   ├── dbconnect.ts
│   └── sendEmail.ts
└── models/
    ├── User.ts
    ├── Restaurant.ts
    ├── NGO.ts
    └── Donation.ts
```

Authentication helpers, error utilities, schemas, and registration/login routes may be located elsewhere in the project.

---

## Getting Started

### 1. Prerequisites

Install the following before running the project:

- Node.js compatible with your installed Next.js version.
- npm, pnpm, yarn, or the package manager used by the repository.
- A MongoDB database, either local or hosted.
- A Gmail account with an app password if email notifications are enabled.
- Postman or another API client.

### 2. Install dependencies

Clone the repository and enter the project directory:

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
npm install
```

Use the appropriate package manager if the project uses something other than npm.

### 3. Configure environment variables

Create a `.env.local` file in the project root. Use the variable names expected by your existing database and authentication code.

Example:

```dotenv
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

EMAIL_USER=yourprojectemail@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
```

These are illustrative names for MongoDB and JWT configuration. If your project uses different names, retain those names in the actual environment file.

**Never commit real database credentials, JWT secrets, or email app passwords to Git.**

### 4. Start the development server

```bash
npm run dev
```

The API will generally be available at:

```text
http://localhost:3000
```

Use this as the Postman base URL unless you configured another port.

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string, if this is the variable used by the database helper |
| `JWT_SECRET` | Secret used to sign or verify JWTs, if applicable to the implementation |
| `EMAIL_USER` | Gmail account used to send notification emails |
| `EMAIL_APP_PASSWORD` | Gmail app password used by Nodemailer |

### Gmail configuration

The email utility uses Nodemailer with Gmail SMTP.

1. Enable two-step verification on the Google account.
2. Create a Google app password if the account is eligible.
3. Put the email address in `EMAIL_USER`.
4. Put the generated app password in `EMAIL_APP_PASSWORD`.
5. Restart the development server after changing environment variables.

A regular Gmail login password should not be used in place of an app password.

---

## Authentication

Protected routes require a valid authenticated session.

The current implementation uses a JWT-based user identity and cookies. In Postman, log in using the appropriate authentication route, then retain the authentication cookie returned by the server.

For routes requiring a particular role, use the corresponding account:

- Admin cookie for verification and administrative statistics.
- Restaurant cookie for profile operations and donation creation.
- NGO cookie for accepting donations and updating the status of assigned donations.

The exact login and registration paths and request fields should be taken from the project's authentication route files; they are not assumed here.

### Recommended testing practice

Keep separate Postman sessions or cookie jars for the admin, restaurant, and NGO accounts. This makes role-specific testing easier and avoids accidentally using the wrong user's session.

---

## API Reference

**Base URL:** `http://localhost:3000/api`

All paths below are relative to the base URL. Protected routes require authentication, and role restrictions apply as described.

### 1. Restaurant profile routes

#### `GET /restaurants`

Retrieves restaurant profile information according to the implemented handler and access rules.

#### `POST /restaurants`

Creates a restaurant profile associated with the authenticated restaurant user.

The profile includes fields such as:

- `restaurantName`
- `address`
- `location`
- `donating`
- `verified`

The location uses GeoJSON Point coordinates in the order **longitude, latitude**:

```json
{
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  }
}
```

The coordinates above are an example only. Supply the actual restaurant coordinates.

The server should associate the profile with the authenticated user rather than trusting a client-supplied owner ID.

#### `GET /restaurants/[id]`

Retrieves the restaurant profile identified by `id`, subject to the route's access rules.

#### `PATCH /restaurants/[id]`

Updates permitted fields of a restaurant profile. The profile owner may be able to change the `donating` flag, depending on the route's validation rules.

#### `PATCH /restaurants/[id]/verify`

**Role:** Admin

Verifies or un-verifies a restaurant.

Example request body:

```json
{
  "verified": true
}
```

A verified restaurant can create donations if the donation creation route enforces verification as expected.

---

### 2. NGO profile routes

#### `GET /ngo`

Retrieves NGO profile information according to the implemented handler and access rules.

#### `POST /ngo`

Creates an NGO profile associated with the authenticated NGO user.

Profile fields include:

- `ngoName`
- `address`
- `location`
- `verified`
- `acceptingDonations`
- `capacity`, if used by the current model

The location uses GeoJSON Point coordinates:

```json
{
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  }
}
```

Coordinates must be supplied in longitude, latitude order.

#### `GET /ngo/[id]`

Retrieves an NGO profile by ID, subject to authorization rules.

#### `PATCH /ngo/[id]`

Updates permitted NGO profile fields. This may include the `acceptingDonations` flag.

#### `PATCH /ngo/[id]/verify`

**Role:** Admin

Verifies or un-verifies an NGO.

Example request body:

```json
{
  "verified": true
}
```

An NGO must satisfy the verification and availability rules implemented by the donation acceptance and nearby NGO routes.

---

### 3. Donation routes

#### `GET /donations`

Retrieves donations according to the authenticated user's role.

The intended visibility rules are:

- **Restaurant:** Its own donations.
- **NGO:** Available donations and donations assigned to that NGO.
- **Admin:** All donations, where supported by the handler.

The exact filtering, pagination, and response format depend on the current route implementation.

#### `POST /donations`

**Role:** Restaurant

Creates a food donation.

A donation may include the following fields:

| Field | Description |
|---|---|
| `foodName` | Name of the donated food |
| `foodType` | Category of food |
| `quantity` | Amount of food |
| `unit` | Unit used for the quantity |
| `preparedAt` | Preparation date/time, if applicable |
| `expiryTime` | Food expiry date/time |
| `pickupDeadline` | Deadline for collection |

Supported food categories in the current model are:

- `cooked_food`
- `packaged_food`
- `bakery`
- `fruits`
- `vegetables`
- `other`

Example request body:

```json
{
  "foodName": "Vegetable Rice",
  "foodType": "cooked_food",
  "quantity": 10,
  "unit": "kg",
  "preparedAt": "2026-10-10T10:00:00.000Z",
  "expiryTime": "2026-10-10T18:00:00.000Z",
  "pickupDeadline": "2026-10-10T16:00:00.000Z"
}
```

Replace the example dates with valid future or relevant dates for your test. Use the exact field names and accepted values defined in the current schema.

The server associates the donation with the authenticated restaurant, rather than allowing a client to create a donation for an arbitrary restaurant ID.

New donations are created with status `available`.

#### `POST /donations/[id]/accept`

**Role:** NGO

Accepts an available donation.

Expected business rules:

1. The NGO must be authenticated.
2. The NGO profile must exist and be verified.
3. The donation must exist and have status `available`.
4. The donation is assigned to the accepting NGO.
5. Its status changes to `accepted`.
6. The acceptance timestamp is recorded if `acceptedAt` is implemented in the Donation model.

The operation should only accept a donation that is still available. This prevents multiple NGOs from successfully claiming the same donation when the update is performed atomically.

No request body is required if the route reads the donation ID from the URL and does not define additional body fields.

#### `PATCH /donations/[id]/status`

Updates the status of an existing donation according to role and ownership rules.

Example request body for pickup:

```json
{
  "status": "picked_up"
}
```

Example request body for completion:

```json
{
  "status": "completed"
}
```

Example request body for cancellation:

```json
{
  "status": "cancelled"
}
```

The route's intended transition rules are:

| Current status | Requested status | Authorized actor |
|---|---|---|
| `available` | `cancelled` | Owning restaurant |
| `accepted` | `picked_up` | NGO assigned to the donation |
| `picked_up` | `completed` | NGO assigned to the donation |

Unsupported transitions should be rejected.

When an assigned NGO changes the status to `picked_up`, the backend attempts to email the restaurant's registered email address. The message includes the food donation name and assigned NGO name.

A failed email notification should not undo a status change that has already been saved. The response may include a `notificationSent` field to indicate whether the notification succeeded.

#### `GET /donations/[id]/nearby-NGO`

**Role:** Restaurant

Finds nearby NGOs eligible to receive a donation, using the donation's location and a geospatial query.

The implemented search uses a 5-kilometre radius and filters for verified NGOs that are accepting donations.

The route depends on valid GeoJSON location data and the appropriate MongoDB `2dsphere` index.

This route discovers potential recipients. It does not itself accept the donation or assign it to an NGO.

---

### 4. Admin dashboard routes

These routes are intended for administrative monitoring and require an admin session.

#### `GET /admin/ngo`

Returns NGO records and monthly donation acceptance statistics, including an `acceptedThisMonth` count where implemented.

Optional query parameter:

```text
?month=YYYY-MM
```

Example:

```text
GET /api/admin/ngo?month=2026-10
```

The month parameter selects the reporting month. When omitted, the endpoint is intended to use the current month.

The acceptance count depends on the recorded acceptance timestamp (`acceptedAt`) and the NGO assignment. Older donations without this timestamp may not appear in the historical count.

#### `GET /admin/ngo/[id]/donations`

Returns donation records associated with a specified NGO for the selected reporting month, with restaurant information where included by the handler.

Optional query parameter:

```text
?month=2026-10
```

Example:

```text
GET /api/admin/ngo/NGO_ID_HERE/donations?month=2026-10
```

Use the actual MongoDB `_id` of the NGO profile.

#### `GET /admin/restaurants`

Returns restaurant records and monthly donation creation statistics, including a `donationsThisMonth` count where implemented.

Optional query parameter:

```text
?month=2026-10
```

Example:

```text
GET /api/admin/restaurants?month=2026-10
```

The count is based on donations created during the selected month, using the donation creation timestamp (`createdAt`).

#### `GET /admin/restaurants/[id]/donations`

Returns donation records associated with a specified restaurant for the selected reporting month, with assigned NGO details where included by the handler.

Optional query parameter:

```text
?month=2026-10
```

Example:

```text
GET /api/admin/restaurants/RESTAURANT_ID_HERE/donations?month=2026-10
```

Use the actual MongoDB `_id` of the restaurant profile.

**Monthly reporting note:** The reporting month should be supplied in `YYYY-MM` format. Confirm the date range and timezone used by the current aggregation pipelines when comparing results across months.

---

## Donation Lifecycle

The Donation model supports the following statuses:

| Status | Meaning |
|---|---|
| `available` | The donation is available for an NGO to accept |
| `accepted` | An NGO has accepted and been assigned the donation |
| `picked_up` | The NGO has recorded collection of the food |
| `completed` | The donation workflow has been completed |
| `expired` | The donation has expired |
| `cancelled` | The donation has been cancelled |

The API's permitted status transitions are more restrictive than the list of possible statuses. In particular, the routes described here allow the restaurant to cancel a donation only while it is `available`, and the assigned NGO to move it through `accepted` → `picked_up` → `completed`.

The existence of `expired` in the schema does not by itself confirm that an automatic expiry scheduler or dedicated expiry route is implemented.

### Why acceptance and creation timestamps matter

- `createdAt` records when the donation was created. It supports restaurant monthly donation statistics.
- `acceptedAt` records when the donation was accepted. It supports NGO monthly acceptance statistics.
- `pickedUpAt` records when pickup was recorded, where implemented.

These timestamps represent different events and should not be treated as interchangeable.

---

## Email Notifications

The backend sends a pickup notification to the restaurant when the assigned NGO updates a donation to `picked_up`.

### Notification workflow

1. The assigned NGO sends a status update.
2. The backend validates the role, assignment, and allowed status transition.
3. The updated donation is saved.
4. The backend finds the restaurant associated with the donation.
5. It retrieves the restaurant user's registered email address.
6. It retrieves the assigned NGO's name.
7. Nodemailer sends the email through Gmail SMTP.
8. The API response reports whether the email notification was sent successfully, if `notificationSent` is included by the handler.

The email includes the food donation name, NGO name, and pickup status.

### Important behavior

Email delivery and database updates are separate operations. If SMTP delivery fails after the database update, the donation may still be `picked_up`. The caller should inspect the response and server logs instead of assuming the entire operation failed.

For production, consider a retry mechanism or notification queue if reliable delivery is essential.

---

## Testing with Postman

Set the Postman base URL to:

```text
http://localhost:3000/api
```

Use a separate authenticated session for each role.

### Recommended end-to-end test sequence

#### Step 1: Create test accounts

Register an admin, a restaurant user, and an NGO user using your existing authentication routes.

Log in as each user and retain their session cookies.

#### Step 2: Create restaurant and NGO profiles

Using the corresponding sessions:

- Create the restaurant profile.
- Create the NGO profile.
- Ensure both profiles have valid location data if testing nearby NGO discovery.

Record their profile IDs for later requests.

#### Step 3: Verify both profiles

Log in as admin.

Send:

```text
PATCH /restaurants/RESTAURANT_ID_HERE/verify
```

Body:

```json
{
  "verified": true
}
```

Then send:

```text
PATCH /ngo/NGO_ID_HERE/verify
```

Body:

```json
{
  "verified": true
}
```

If the NGO must be actively accepting donations for nearby discovery, update that setting using the NGO profile route and the field names accepted by your implementation.

#### Step 4: Create a donation

Log in as the verified restaurant and send:

```text
POST /donations
```

Provide a valid donation request body using the fields described in the API reference.

Save the returned donation ID.

#### Step 5: Discover nearby NGOs

As the restaurant, request:

```text
GET /donations/DONATION_ID_HERE/nearby-NGO
```

Check that the response includes eligible NGOs within the configured radius.

#### Step 6: Accept the donation

Log in as the verified NGO and send:

```text
POST /donations/DONATION_ID_HERE/accept
```

Confirm that the donation becomes `accepted` and is assigned to the NGO profile.

#### Step 7: Record pickup

Still using the assigned NGO's session, send:

```text
PATCH /donations/DONATION_ID_HERE/status
```

Body:

```json
{
  "status": "picked_up"
}
```

Verify that the status is updated and the API reports the notification result if available.

Check the restaurant user's registered email inbox for the pickup notification.

#### Step 8: Complete the donation

As the assigned NGO, send:

```text
PATCH /donations/DONATION_ID_HERE/status
```

Body:

```json
{
  "status": "completed"
}
```

Confirm that the donation status is now `completed`.

#### Step 9: Test monthly statistics

Log in as admin and call:

```text
GET /admin/ngo?month=2026-10
GET /admin/restaurants?month=2026-10
GET /admin/ngo/NGO_ID_HERE/donations?month=2026-10
GET /admin/restaurants/RESTAURANT_ID_HERE/donations?month=2026-10
```

Replace `2026-10` with the month you want to inspect. The example is a reporting month, not a guarantee that test records exist in that month.

---

## Common Errors

The exact response format depends on the error handler used by each route.

| Problem | Likely reason | What to check |
|---|---|---|
| `401 Unauthorized` | Missing, invalid, or expired session | Log in again and confirm Postman sends the cookie |
| `403 Forbidden` | The authenticated role cannot perform the operation | Check which account is logged in |
| `404 Not Found` | The requested profile or donation does not exist | Verify the MongoDB document ID |
| Validation error | Missing or invalid request fields | Check enum values, required fields, and data types |
| Donation cannot be accepted | Donation is no longer `available`, or NGO is not eligible | Check status, NGO verification, and assignment |
| Status update rejected | Requested transition is not allowed | Follow the donation lifecycle |
| Email notification failed | Missing SMTP configuration or email delivery error | Check `.env.local`, app password, server logs, and recipient email |
| Nearby NGO results are empty | No eligible NGOs are within the radius | Check coordinates, verification, acceptance setting, and the geospatial index |
| Monthly count is zero | No qualifying records fall in the selected month | Check timestamps, reporting month, and stored acceptance data |

For local debugging, inspect the server logs for database, validation, and email errors. Do not return secrets or sensitive SMTP details in API responses.

---

## Security and Production Notes

Before deploying the API publicly, review the following:

- Keep authentication cookies HTTP-only and configure secure cookie options for production.
- Validate request bodies and URL IDs before performing database operations.
- Enforce ownership and role checks on every protected route.
- Do not allow clients to assign arbitrary `restaurantId`, `ngoId`, or ownership fields.
- Ensure donation acceptance is atomic so two NGOs cannot claim the same available donation.
- Confirm that profile verification routes are accessible only to admins.
- Keep secrets in environment variables and out of version control.
- Remove temporary email-testing endpoints before deployment.
- Consider rate limiting and request logging for public endpoints.
- Avoid logging passwords, JWTs, app passwords, or other sensitive values.
- Use database indexes for frequently queried fields and the geospatial location fields.
- Consider retryable email delivery or a background queue for notifications.
- Ensure monthly statistics use consistent timezone and date-boundary rules.
- Test invalid status transitions, unauthorized access, duplicate acceptance attempts, and missing profile data.

---

## Contributing

When adding or modifying a route:

1. Confirm the allowed roles and resource ownership rules.
2. Validate request data.
3. Use the shared database connection helper.
4. Apply the relevant Mongoose model constraints.
5. Return a consistent success or error response.
6. Add Postman tests for both authorized and unauthorized scenarios.
7. Update this README if the route, status workflow, request body, or environment configuration changes.

## License

Add the project's license here if it is intended for public distribution.
