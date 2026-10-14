# 🍱 Food Donation Platform — Backend API

The project is built with **Next.js App Router, TypeScript, MongoDB, and Mongoose** to connect restaurants with NGOs and simplify surplus food donation.

Restaurants can publish surplus food, verified NGOs can discover and accept donations, and administrators can verify organizations and monitor donation activity. The platform supports role-based authentication, location-based NGO discovery, donation tracking, monthly statistics, and email notifications.

## 📌 Features

-  JWT-based authentication using HTTP-only cookies
-  Role-based authorization for Admin, Restaurant, and NGO
-  Restaurant profile creation and management
-  NGO profile creation and management
-  Admin verification of restaurants and NGOs
-  Food donation creation and management
-  NGO donation acceptance and assignment
-  Donation pickup and completion tracking
-  Restaurant cancellation of available donations
-  Nearby NGO discovery using MongoDB geospatial queries
-  Monthly donation and acceptance statistics
-  Email notifications when donations are picked up
-  MongoDB database integration using Mongoose

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | API routes |
| TypeScript | Type safety |
| MongoDB | Database |
| Mongoose | Database modeling |
| JWT | Authentication |
| HTTP-only Cookies | Session management |
| Zod | Request validation, where implemented |
| Nodemailer | Email notifications |
| Gmail SMTP | Email delivery |
| Postman | API testing |

## 🔄 How It Works

1. Users register and log in.
2. Restaurants and NGOs create their profiles.
3. Admin verifies both organizations.
4. A verified restaurant creates a food donation.
5. An eligible NGO discovers and accepts the donation.
6. The NGO collects the food and updates the status to `picked_up`.
7. The backend sends an email notification to the restaurant.
8. The NGO updates the donation status to `completed`.
9. Admin monitors donation activity and monthly statistics.

### Donation Workflow

```text
Registration / Login
        |
        v
Role-Based Authentication
        |
        v
Create Restaurant / NGO Profiles
        |
        v
Admin Verification
        |
        v
Restaurant Creates Donation
        |
        v
     available
        |
        v
NGO Accepts Donation
        |
        v
      accepted
        |
        v
NGO Picks Up Food
        |
        v
     picked_up
        |
        +----> Email Notification
        |
        v
     completed
```

A restaurant can cancel a donation while its status is `available`, subject to the implemented authorization rules.

## 👥 User Roles

| Feature | Admin | Restaurant | NGO |
|---|---|---|---|
| Manage own profile | Route-dependent | Yes | Yes |
| Create donation | No by default | Yes | No |
| View donations | All, where supported | Own donations | Available and assigned |
| Accept donation | No | No | Yes |
| Mark as picked up | No | No | Assigned NGO |
| Complete donation | No | No | Assigned NGO |
| Cancel available donation | No | Owner only | No |
| Verify restaurants | Yes | No | No |
| Verify NGOs | Yes | No | No |
| View admin statistics | Yes | No | No |

Authorization should check the authenticated user's role, ownership, organization verification, and donation assignment as appropriate.

## 📁 Project Structure

```text
src/
├── app/
│   └── api/
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
│       ├── donations/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── accept/
│       │       │   └── route.ts
│       │       ├── status/
│       │       │   └── route.ts
│       │       └── nearby-NGO/
│       │           └── route.ts
│       └── admin/
│           ├── ngo/
│           │   ├── route.ts
│           │   └── [id]/
│           │       └── donations/
│           │           └── route.ts
│           └── restaurants/
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

*Note: This is the documented route structure. Authentication, registration, and other utility files may be located elsewhere in your repository.*

##  Getting Started

### Prerequisites

- Node.js compatible with your Next.js version
- npm, pnpm, or yarn
- MongoDB local instance or MongoDB Atlas
- Postman for API testing
- Gmail account with an app password, if email notifications are enabled

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_DIRECTORY>
```

Replace the placeholders with your repository URL and project directory.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```dotenv
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret

EMAIL_USER=yourprojectemail@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password
```

Use the exact variable names expected by your existing code.

**Important:** Never commit real credentials, database connection strings, JWT secrets, or email passwords to Git.

### 4. Start the development server

```bash
npm run dev
```

The API should be available at:

- Application: `http://localhost:3000`
- API base URL: `http://localhost:3000/api`

##  Authentication

The API uses JWT-based authentication and HTTP-only cookies for authenticated requests.

Use the appropriate authenticated session for each role:

- **Admin:** Profile verification and administrative statistics.
- **Restaurant:** Restaurant profile management and donation creation.
- **NGO:** NGO profile management, donation acceptance, pickup, and completion.

Login and registration endpoints are not listed here because their exact paths depend on your implementation.

### Authorization Rules

- Only authorized administrators should verify organizations.
- Restaurants should manage only their own donations.
- NGOs should update only donations assigned to them.
- Only eligible NGOs should accept available donations.
- Clients should not be allowed to choose arbitrary resource owners by submitting IDs.

## 📡 API Reference

**Base URL:** `http://localhost:3000/api`

All endpoints below are relative to this URL. Protected routes require authentication, and role restrictions apply.

### 1. Restaurant Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/restaurants` | Retrieve restaurant profiles |
| POST | `/restaurants` | Create a restaurant profile |
| GET | `/restaurants/:id` | Retrieve a restaurant by ID |
| PATCH | `/restaurants/:id` | Update a restaurant profile |
| PATCH | `/restaurants/:id/verify` | Verify or unverify a restaurant |

#### Create a restaurant

`POST /restaurants`

Example request body:

```json
{
  "restaurantName": "Green Garden Restaurant",
  "address": "New Delhi, India",
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  },
  "donating": true
}
```

The coordinates are an example only. GeoJSON coordinates must be ordered as `[longitude, latitude]`.

#### Verify a restaurant

`PATCH /restaurants/:id/verify`

```json
{
  "verified": true
}
```

**Access:** Admin.

### 2. NGO Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/ngo` | Retrieve NGO profiles |
| POST | `/ngo` | Create an NGO profile |
| GET | `/ngo/:id` | Retrieve an NGO by ID |
| PATCH | `/ngo/:id` | Update an NGO profile |
| PATCH | `/ngo/:id/verify` | Verify or unverify an NGO |

#### Create an NGO

`POST /ngo`

Example request body:

```json
{
  "ngoName": "Helping Hands Foundation",
  "address": "New Delhi, India",
  "location": {
    "type": "Point",
    "coordinates": [77.1025, 28.7041]
  },
  "acceptingDonations": true,
  "capacity": 100
}
```

Use the fields supported by your actual NGO schema. The `capacity` field is optional if implemented.

#### Verify an NGO

`PATCH /ngo/:id/verify`

```json
{
  "verified": true
}
```

**Access:** Admin.

### 3. Donation Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/donations` | Retrieve donations according to access rules |
| POST | `/donations` | Create a food donation |
| POST | `/donations/:id/accept` | Accept an available donation |
| PATCH | `/donations/:id/status` | Update donation status |
| GET | `/donations/:id/nearby-NGO` | Discover nearby eligible NGOs |

#### Create a donation

`POST /donations`

Example request body:

```json
{
  "foodName": "Vegetable Rice",
  "foodType": "cooked_food",
  "quantity": 10,
  "unit": "kg",
  "preparedAt": "2026-10-20T10:00:00.000Z",
  "expiryTime": "2026-10-20T18:00:00.000Z",
  "pickupDeadline": "2026-10-20T16:00:00.000Z"
}
```

Supported food categories, as described for the project:

- `cooked_food`
- `packaged_food`
- `bakery`
- `fruits`
- `vegetables`
- `other`

The exact required fields and accepted values depend on your Mongoose schema.

**Expected behavior:**

- Only authorized restaurants can create donations.
- The donation is associated with the authenticated restaurant.
- The initial status is `available`.

#### Accept a donation

`POST /donations/:id/accept`

**Access:** Eligible NGO.

The endpoint should verify that the donation exists, is available, and can be accepted by the authenticated NGO. On success, the donation is assigned to that NGO and changes to `accepted`.

No request body is required if the route uses only the donation ID.

#### Update donation status

`PATCH /donations/:id/status`

**Record pickup:**

```json
{
  "status": "picked_up"
}
```

**Complete the donation:**

```json
{
  "status": "completed"
}
```

**Cancel an available donation:**

```json
{
  "status": "cancelled"
}
```

Allowed transitions:

| Current Status | New Status | Authorized Actor |
|---|---|---|
| `available` | `cancelled` | Owning restaurant |
| `accepted` | `picked_up` | Assigned NGO |
| `picked_up` | `completed` | Assigned NGO |

Unsupported transitions should be rejected.

#### Find nearby NGOs

`GET /donations/:id/nearby-NGO`

**Access:** Restaurant.

The endpoint discovers eligible NGOs within the documented 5 km radius, using geospatial coordinates and the applicable verification and donation-acceptance filters.

A MongoDB `2dsphere` index is required for the relevant GeoJSON location field.

This route discovers potential recipients; it does not accept or assign the donation.

### 4. Admin Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/ngo` | List NGOs and monthly acceptance statistics |
| GET | `/admin/ngo/:id/donations` | Retrieve donations associated with an NGO |
| GET | `/admin/restaurants` | List restaurants and monthly donation statistics |
| GET | `/admin/restaurants/:id/donations` | Retrieve donations associated with a restaurant |

All routes require an admin session.

#### NGO statistics

```http
GET /api/admin/ngo?month=2026-10
```

Returns NGO records and monthly acceptance counts, such as `acceptedThisMonth`, where implemented.

#### NGO donation history

```http
GET /api/admin/ngo/NGO_ID_HERE/donations?month=2026-10
```

#### Restaurant statistics

```http
GET /api/admin/restaurants?month=2026-10
```

Returns restaurant records and monthly donation creation counts, such as `donationsThisMonth`, where implemented.

#### Restaurant donation history

```http
GET /api/admin/restaurants/RESTAURANT_ID_HERE/donations?month=2026-10
```

Replace the ID placeholders with actual MongoDB document IDs.

The optional `month` query parameter uses `YYYY-MM` format. Confirm the actual timezone and date boundaries used by your aggregation pipelines.

## 🔁 Donation Statuses

| Status | Meaning |
|---|---|
| `available` | Available for an NGO to accept |
| `accepted` | Accepted and assigned to an NGO |
| `picked_up` | Pickup has been recorded |
| `completed` | Donation workflow is complete |
| `expired` | Donation has expired |
| `cancelled` | Donation has been cancelled |

The presence of `expired` in the model does not necessarily mean automatic expiry scheduling is implemented.

### Important timestamps

- `createdAt`: When the donation was created.
- `acceptedAt`: When the donation was accepted, if implemented.
- `pickedUpAt`: When pickup was recorded, if implemented.

These timestamps represent different events and should not be used interchangeably in reports.

## 📍 Location-Based NGO Discovery

The nearby NGO endpoint uses MongoDB geospatial queries to find organizations near a donation's restaurant location.

The documented discovery criteria include:

- A search radius of 5 km.
- Verified NGO profiles.
- NGOs currently accepting donations.
- Valid GeoJSON location data.

Example GeoJSON location:

```json
{
  "type": "Point",
  "coordinates": [77.1025, 28.7041]
}
```

Remember that GeoJSON coordinates use longitude first and latitude second.

Ensure the appropriate `2dsphere` index exists on the location field used by your query.

## 📧 Email Notifications

The backend attempts to notify a restaurant when its donation status changes to `picked_up`.

### Notification workflow

1. The assigned NGO requests a pickup status update.
2. The API validates authorization and the status transition.
3. The donation update is saved.
4. The backend retrieves the restaurant's registered email address and assigned NGO name.
5. Nodemailer sends the notification through Gmail SMTP.

The email is intended to include the food donation name, NGO name, and pickup status.

**Important:** Database updates and email delivery are separate operations. If email delivery fails after the database update succeeds, the donation may still be marked as `picked_up`.

Check the API response and server logs for notification errors. For production, consider retry mechanisms or a background email queue.

## 🧪 Testing with Postman

Set the base URL to:

```text
http://localhost:3000/api
```

Use separate cookie jars or sessions for Admin, Restaurant, and NGO accounts.

### Recommended end-to-end testing sequence

1. **Register and log in:** Create test accounts using your implemented authentication routes.
2. **Create profiles:** Create a restaurant profile and an NGO profile.
3. **Verify organizations:** Log in as Admin and verify both profiles.
4. **Create a donation:** Log in as the Restaurant and send `POST /donations`.
5. **Find nearby NGOs:** Call `GET /donations/:id/nearby-NGO`.
6. **Accept the donation:** Log in as an eligible NGO and call `POST /donations/:id/accept`.
7. **Record pickup:** Call `PATCH /donations/:id/status` with `{"status":"picked_up"}`.
8. **Check email:** Confirm the restaurant receives the pickup notification, if SMTP is configured.
9. **Complete the donation:** Submit `{"status":"completed"}` to the status endpoint.
10. **Check statistics:** Use the admin routes to inspect monthly counts and donation records.

Also test invalid status transitions, duplicate acceptance attempts, missing IDs, unauthorized roles, and unverified profiles.

## ⚠️ Common Errors

| Error | Possible Cause | Suggested Check |
|---|---|---|
| `401 Unauthorized` | Missing or invalid session | Log in again and check cookies |
| `403 Forbidden` | Insufficient permissions | Confirm the user's role |
| `404 Not Found` | Invalid resource ID | Check the MongoDB document ID |
| Validation error | Invalid or missing request fields | Check schema requirements |
| Donation acceptance rejected | Donation unavailable or NGO ineligible | Check status and verification |
| Status update rejected | Invalid transition or assignment | Follow the lifecycle rules |
| Email notification failure | SMTP configuration or delivery issue | Check environment variables and server logs |
| Nearby NGO results empty | No eligible NGOs found | Check coordinates, filters, and index |
| Monthly count is zero | No qualifying records in the selected period | Check timestamps and month boundaries |

The precise HTTP status codes and response bodies depend on the implemented route handlers.

## 🔒 Security and Best Practices

- Keep JWT secrets and database credentials in environment variables.
- Use HTTP-only cookies and secure cookie settings in production.
- Validate request bodies, query parameters, and MongoDB IDs.
- Enforce role checks and resource ownership on every protected route.
- Prevent clients from assigning arbitrary restaurant or NGO IDs.
- Make donation acceptance atomic to prevent duplicate claims.
- Restrict verification endpoints to administrators.
- Configure a MongoDB `2dsphere` index for geospatial searches.
- Avoid logging passwords, JWTs, and SMTP credentials.
- Add rate limiting and appropriate error handling.
- Use consistent timezone rules for monthly reports.
- Consider retryable email delivery for production deployments.
- Test authorization failures as well as successful requests.

## 🤝 Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement your changes.
4. Test the relevant API endpoints.
5. Submit a pull request with a clear description.

When adding or changing a route, update this README to reflect the actual endpoint, permissions, request fields, and behavior.


**Built to reduce food waste and help surplus food reach the people who need it.** 🍲