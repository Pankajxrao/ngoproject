# Food Donation Platform API Documentation

A food donation platform that connects restaurants with NGOs to reduce food waste and help distribute surplus food to people in need.

The API supports user authentication, restaurant and NGO profiles, profile verification, donation management, donation acceptance, pickup and completion workflows, and location-based NGO discovery.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [User Roles](#user-roles)
- [API Routes Overview](#api-routes-overview)
- [1. Restaurant APIs](#1-restaurant-apis)
- [2. NGO APIs](#2-ngo-apis)
- [3. Donation APIs](#3-donation-apis)
- [4. Nearby NGO Matching](#4-nearby-ngo-matching)
- [5. Donation Status Workflow](#5-donation-status-workflow)
- [6. Admin Verification](#6-admin-verification)
- [Complete Postman Testing Workflow](#complete-postman-testing-workflow)
- [Geospatial Matching](#geospatial-matching)
- [Common Errors](#common-errors)
- [Important Notes](#important-notes)

---

## Features

- User roles for administrators, restaurants, and NGOs.
- Restaurant profile creation and management.
- NGO profile creation and management.
- Admin-controlled restaurant and NGO verification.
- Restaurant food donation creation and listing.
- NGO discovery of available donations.
- NGO acceptance of available donations.
- Donation pickup and completion status updates.
- Restaurant cancellation of available donations.
- Location-based matching of verified NGOs within a 5 km radius.
- NGO availability control through `acceptingDonations`.
- MongoDB geospatial queries using GeoJSON and `2dsphere` indexes.

## Technology Stack

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **Database:** MongoDB
- **ODM:** Mongoose
- **Validation:** Zod
- **Authentication:** JWT-based authentication using cookies
- **API Testing:** Postman
- **Location Queries:** MongoDB geospatial queries

---

## Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd YOUR_PROJECT_DIRECTORY
```

Replace the placeholders with your repository URL and project directory.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Use the actual environment variable names expected by your application. These names are examples and should be checked against your database connection and authentication utilities.

Do not commit `.env.local` or expose your database credentials or JWT secret.

### 4. Start the development server

```bash
npm run dev
```

The API examples below use:

```text
http://localhost:3000
```

If your development server runs on a different port, replace the base URL accordingly.

---

## Authentication

Protected API routes use the currently authenticated user, obtained through the application's `getCurrentUser()` authentication utility.

The decoded JWT payload contains the following information:

- `userId`: The authenticated user's ID.
- `role`: The user's role, such as `admin`, `restaurant`, or `ngo`.

### Authentication in Postman

1. Register an account using your application's registration endpoint.
2. Log in using the corresponding login endpoint.
3. Make sure the authentication cookie is stored in Postman.
4. Send subsequent protected requests using that authenticated session.

If a route returns `401 Unauthorized`, check whether you are logged in and whether the authentication cookie is being sent.

**Important:** A user account ID and a restaurant or NGO profile ID are different IDs. Some endpoints require a profile ID rather than the user account ID.

---

## User Roles

| Role | Main responsibilities |
|---|---|
| `admin` | Verify restaurant and NGO profiles; access administrative functionality supported by the application. |
| `restaurant` | Create and manage a restaurant profile, publish donations, view its donations, find nearby NGOs, and cancel eligible donations. |
| `ngo` | Create and manage an NGO profile, view available donations, accept donations, and update donation pickup and completion status. |

Access to protected endpoints is controlled by the role checks implemented in each route.

---

## API Routes Overview

The following table summarizes the routes implemented or discussed in this project.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/restaurants` | List restaurants, if supported by the route implementation. |
| `POST` | `/api/restaurants` | Create a restaurant profile. |
| `GET` | `/api/restaurants/:id` | Get a restaurant profile. |
| `PUT` | `/api/restaurants/:id` | Update a restaurant profile. |
| `PATCH` | `/api/restaurants/:id` | Update the restaurant's donating flag. |
| `DELETE` | `/api/restaurants/:id` | Delete a restaurant profile, subject to restrictions. |
| `PATCH` | `/api/restaurants/:id/verify` | Update restaurant verification through the admin route. |
| `GET` | `/api/ngo` | List NGO profiles. |
| `POST` | `/api/ngo` | Create an NGO profile. |
| `GET` | `/api/ngo/:id` | Get an NGO profile. |
| `PUT` | `/api/ngo/:id` | Update an NGO profile. |
| `PATCH` | `/api/ngo/:id` | Update NGO donation availability. |
| `DELETE` | `/api/ngo/:id` | Delete an NGO profile. |
| `PATCH` | `/api/ngo/:id/verify` | Update NGO verification through the admin route. |
| `GET` | `/api/donations` | List donations according to the authenticated user's role. |
| `POST` | `/api/donations` | Create a food donation. |
| `POST` | `/api/donations/:id/accept` | Accept an available donation as an NGO. |
| `PATCH` | `/api/donations/:id/status` | Update a donation's status. |
| `GET` | `/api/donations/:id/nearby-NGO` | Find nearby eligible NGOs for an available donation. |

`GET /api/restaurants`, if present, and the exact registration, login, and logout paths should be confirmed against the corresponding route files before treating them as part of the final public API contract.

In the examples below, `:id` represents the relevant MongoDB document ID.

---

# 1. Restaurant APIs

## 1.1 Create a restaurant profile

**Endpoint**

```http
POST /api/restaurants
```

**Purpose**

Creates a restaurant profile associated with the authenticated user.

**Authentication:** Restaurant account.

**Example request body**

```json
{
  "restaurantName": "Green Garden Restaurant",
  "address": "Main Market, Palwal, Haryana",
  "latitude": 28.1487,
  "longitude": 77.3320
}
```

Use your actual coordinates and the exact field names expected by the restaurant creation route.

**Location format**

The API converts latitude and longitude into GeoJSON coordinates:

```json
{
  "type": "Point",
  "coordinates": [77.3320, 28.1487]
}
```

MongoDB GeoJSON uses the order `[longitude, latitude]`, not `[latitude, longitude]`.

**Expected behavior**

- Creates a restaurant profile associated with the authenticated user's ID.
- Initializes verification according to the model's defaults.
- Makes the profile available for later verification and donation operations.

A restaurant generally needs to be verified before it can create donations or use nearby-NGO matching.

## 1.2 Get a restaurant profile

**Endpoint**

```http
GET /api/restaurants/:id
```

**Purpose**

Retrieves a restaurant profile by its profile ID.

**Example**

```http
GET http://localhost:3000/api/restaurants/RESTAURANT_PROFILE_ID
```

Replace `RESTAURANT_PROFILE_ID` with the actual restaurant profile ID.

## 1.3 Update a restaurant profile

**Endpoint**

```http
PUT /api/restaurants/:id
```

**Example request body**

```json
{
  "restaurantName": "Green Garden Restaurant",
  "address": "Updated Address, Palwal, Haryana",
  "latitude": 28.1500,
  "longitude": 77.3350
}
```

**Behavior**

- Updates the restaurant's profile information.
- Stores location coordinates in GeoJSON format.
- Resets `verified` to `false` when the location changes, according to the implementation discussed.

If the restaurant's location changes, an administrator may need to verify the profile again.

## 1.4 Toggle restaurant donation availability

**Endpoint**

```http
PATCH /api/restaurants/:id
```

**Purpose**

Updates the restaurant's `donating` flag.

**Example request body**

```json
{
  "donating": true
}
```

To disable it:

```json
{
  "donating": false
}
```

**Requirements**

- Authenticated user must have the `restaurant` role.
- The restaurant profile must belong to the logged-in user.
- The restaurant must be verified.
- `donating` must be a boolean.

**Important distinction:** The `donating` flag represents the restaurant's general donation availability. It does not create a food donation. To publish food, use `POST /api/donations`.

## 1.5 Delete a restaurant profile

**Endpoint**

```http
DELETE /api/restaurants/:id
```

**Purpose**

Deletes a restaurant profile, subject to the route's ownership and validation rules.

**Restriction**

The implementation prevents deletion when the restaurant has active donations with any of these statuses:

- `available`
- `accepted`
- `picked_up`

Complete or otherwise resolve active donations before attempting to delete the profile.

---

# 2. NGO APIs

## 2.1 Create an NGO profile

**Endpoint**

```http
POST /api/ngo
```

**Purpose**

Creates an NGO profile associated with the authenticated user.

**Example request body**

```json
{
  "ngoName": "Helping Hands Foundation",
  "address": "Sector 5, Palwal, Haryana",
  "latitude": 28.1500,
  "longitude": 77.3400,
  "capacity": 100
}
```

Use the field names required by your NGO creation route.

**Model fields**

| Field | Description |
|---|---|
| `userId` | ID of the user who owns the NGO profile. |
| `ngoName` | NGO name. |
| `address` | NGO address. |
| `location` | GeoJSON point. |
| `verified` | Verification status; defaults to `false`. |
| `capacity` | Optional capacity value; must be non-negative. |
| `acceptingDonations` | Whether the NGO is accepting donations; defaults to `false`. |
| `createdAt` | Creation timestamp. |
| `updatedAt` | Last update timestamp. |

**Important:** A newly created NGO is not automatically eligible for nearby matching. It must be verified and marked as accepting donations.

## 2.2 List NGO profiles

**Endpoint**

```http
GET /api/ngo
```

**Purpose**

Retrieves NGO profiles according to the implementation of the list route.

Use this endpoint to inspect your NGO profile ID, verification status, availability, and location-related information where returned by the API.

## 2.3 Get an NGO profile

**Endpoint**

```http
GET /api/ngo/:id
```

**Purpose**

Retrieves an NGO profile by its profile ID.

**Example**

```http
GET http://localhost:3000/api/ngo/NGO_PROFILE_ID
```

## 2.4 Update an NGO profile

**Endpoint**

```http
PUT /api/ngo/:id
```

**Purpose**

Updates the NGO profile.

The exact editable fields and validation rules depend on the implementation of the NGO profile update handler. Use the request body accepted by that handler.

## 2.5 Toggle NGO donation availability

**Endpoint**

```http
PATCH /api/ngo/:id
```

**Purpose**

Enables or disables the NGO's availability to receive donations.

**Enable availability**

```json
{
  "acceptingDonations": true
}
```

**Disable availability**

```json
{
  "acceptingDonations": false
}
```

**Requirements**

- Authenticated user must have the `ngo` role.
- The NGO profile must belong to the logged-in user.
- The NGO must be verified.
- `acceptingDonations` must be a boolean.

**Example successful response**

```json
{
  "success": true,
  "message": "NGO availability updated successfully",
  "acceptingDonations": true
}
```

If the NGO has not been verified, the route will reject the availability update.

## 2.6 Delete an NGO profile

**Endpoint**

```http
DELETE /api/ngo/:id
```

**Purpose**

Deletes an NGO profile according to the ownership, validation, and other restrictions implemented in the route.

## 2.7 Verify an NGO

**Endpoint**

```http
PATCH /api/ngo/:id/verify
```

**Purpose**

Updates NGO verification through the administrative verification route.

**Example request body**

```json
{
  "verified": true
}
```

To revoke verification, if allowed by the route:

```json
{
  "verified": false
}
```

Use an authenticated admin account. The route's exact authorization and validation rules determine whether the request succeeds.

---

# 3. Donation APIs

## 3.1 Create a donation

**Endpoint**

```http
POST /api/donations
```

**Purpose**

Allows a verified restaurant to publish surplus food for donation.

**Authentication:** Restaurant account.

**Example request body**

```json
{
  "foodName": "Fresh Vegetable Meals",
  "foodType": "cooked_food",
  "quantity": 10,
  "unit": "servings",
  "expiryTime": "2026-10-11T18:00:00.000Z",
  "pickupDeadline": "2026-10-11T16:00:00.000Z"
}
```

Use future dates appropriate to the time you are testing. The example illustrates the request shape; actual validation is governed by the Zod donation schema.

### Supported food types

The donation model supports these values for `foodType`:

| Value | Description |
|---|---|
| `cooked_food` | Prepared meals or cooked food. |
| `packaged_food` | Packaged food products. |
| `bakery` | Bakery products. |
| `fruits` | Fruits. |
| `vegetables` | Vegetables. |
| `other` | Other eligible food types. |

### Donation fields

| Field | Description |
|---|---|
| `foodName` | Name or description of the food. |
| `foodType` | Food category. |
| `quantity` | Quantity available. |
| `unit` | Unit of measurement, such as `servings` or `kg`. |
| `preparedAt` | Optional preparation timestamp. |
| `expiryTime` | Food expiry timestamp. |
| `pickupDeadline` | Latest pickup deadline. |
| `restaurantId` | Restaurant profile ID, assigned by the API. |
| `ngoId` | NGO profile ID after acceptance, when assigned. |
| `status` | Donation lifecycle status. |
| `pickupTime` | Optional pickup time, if supported by the request or later updates. |
| `pickedUpAt` | Timestamp recorded when the donation is marked as picked up. |

The `restaurantId` is obtained from the authenticated restaurant profile. Clients should not supply their own restaurant ownership ID.

### Initial donation status

The API creates new donations with:

```json
{
  "status": "available"
}
```

The `status` field is assigned by the backend; you do not normally need to include it in the creation request.

### Expected response

The route returns a successful creation response with HTTP `201` and the newly created donation data. Use the returned `_id` for subsequent requests.

## 3.2 List donations

**Endpoint**

```http
GET /api/donations
```

**Purpose**

Retrieves donations based on the authenticated user's role.

### Restaurant behavior

A restaurant sees its own donations.

### NGO behavior

An NGO sees:

- Donations with status `available`.
- Donations assigned to that NGO through `ngoId`.

### Admin behavior

An administrator can retrieve all donations through this route.

The exact JSON response envelope depends on the route implementation.

## 3.3 Accept a donation

**Endpoint**

```http
POST /api/donations/:id/accept
```

**Purpose**

Allows a verified NGO to accept an available donation.

**Authentication:** NGO account.

**Request body:** None required by the discussed handler.

**Example**

```http
POST http://localhost:3000/api/donations/DONATION_ID/accept
```

Replace `DONATION_ID` with the ID returned by donation creation.

### Acceptance behavior

The API:

1. Authenticates the user.
2. Checks that the user has the `ngo` role.
3. Validates the donation ID.
4. Finds the NGO profile belonging to the authenticated user.
5. Checks that the NGO is verified.
6. Atomically finds a donation with status `available`.
7. Changes the status to `accepted`.
8. Assigns the NGO profile ID to `ngoId`.

The atomic update prevents two NGOs from successfully accepting the same donation through the same available-status transition.

### Resulting state

```json
{
  "status": "accepted",
  "ngoId": "NGO_PROFILE_ID"
}
```

This snippet illustrates the resulting fields; it is not necessarily the complete API response.

If another NGO has already accepted the donation, or the donation is no longer available, the request will not find a matching available donation.

---

# 4. Nearby NGO Matching

## 4.1 Find nearby NGOs for a donation

**Endpoint**

```http
GET /api/donations/:id/nearby-NGO
```

**Purpose**

Finds verified NGOs that are accepting donations and are located within 5 km of the restaurant that published the specified donation.

**Authentication:** Restaurant account.

**Request body:** None.

**Example**

```http
GET http://localhost:3000/api/donations/DONATION_ID/nearby-NGO
```

### Requirements

The API checks that:

1. A user is authenticated.
2. The authenticated user has the `restaurant` role.
3. The donation ID is valid.
4. A restaurant profile exists for the logged-in user.
5. The restaurant is verified.
6. The donation belongs to that restaurant.
7. The donation status is `available`.
8. The restaurant has valid location coordinates.

Only then does the API search for nearby NGOs.

### NGO matching criteria

An NGO must satisfy all the following conditions:

```json
{
  "verified": true,
  "acceptingDonations": true
}
```

The NGO must also be within 5,000 metres of the restaurant's coordinates.

The matching query uses MongoDB's `$near` operator and the NGO location's `2dsphere` index.

### Example successful response

```json
{
  "success": true,
  "message": "Nearby NGOs fetched successfully",
  "radiusKm": 5,
  "count": 1,
  "ngos": [
    {
      "_id": "NGO_PROFILE_ID",
      "ngoName": "Helping Hands Foundation",
      "address": "Sector 5, Palwal, Haryana",
      "location": {
        "type": "Point",
        "coordinates": [77.3400, 28.1500]
      },
      "capacity": 100
    }
  ]
}
```

This is an illustrative example. Actual IDs, locations, and returned fields depend on your database. The current query selects `ngoName`, `address`, `location`, and `capacity`.

### What does `count: 0` mean?

Example:

```json
{
  "success": true,
  "message": "Nearby NGOs fetched successfully",
  "radiusKm": 5,
  "count": 0,
  "ngos": []
}
```

This is a successful request, but no NGO matched all the search conditions.

Check the following:

- At least one NGO has `verified: true`.
- That NGO has `acceptingDonations: true`.
- The NGO is within 5 km of the restaurant.
- The restaurant and NGO have valid GeoJSON coordinates.
- MongoDB has the required `2dsphere` index.
- The request uses a fresh donation whose status is `available`.
- The donation belongs to the restaurant currently logged in.

### Why can a completed donation not be used?

The nearby-NGO route searches for a donation matching:

```ts
{
  _id: id,
  restaurantId: restaurant._id,
  status: "available"
}
```

A donation with status `completed`, `accepted`, `picked_up`, `cancelled`, or `expired` does not match this query.

Create a new donation to test nearby NGO matching.

---

# 5. Donation Status Workflow

A donation progresses through different statuses as it moves from publication to completion.

## Available statuses

| Status | Meaning |
|---|---|
| `available` | Published by a restaurant and available for acceptance. |
| `accepted` | Accepted by an NGO. |
| `picked_up` | Food has been collected. |
| `completed` | Donation process has been completed. |
| `cancelled` | Donation has been cancelled. |
| `expired` | Donation has expired. |

## Normal lifecycle

```text
Restaurant creates donation
          |
          v
      available
          |
          v
       accepted
          |
          v
       picked_up
          |
          v
       completed
```

A donation may also be cancelled while it is still available, subject to the status route's rules.

### 5.1 Mark a donation as picked up

**Endpoint**

```http
PATCH /api/donations/:id/status
```

**Authentication:** The NGO assigned to the donation.

**Request body**

```json
{
  "status": "picked_up"
}
```

The status route checks that the assigned NGO is authorized to make the transition from `accepted` to `picked_up`. The implementation records `pickedUpAt` when the donation is marked as picked up.

### 5.2 Mark a donation as completed

**Endpoint**

```http
PATCH /api/donations/:id/status
```

**Request body**

```json
{
  "status": "completed"
}
```

Use the NGO assigned to the donation and ensure the donation has already reached `picked_up`.

The route permits the assigned NGO to transition a picked-up donation to completed.

### 5.3 Cancel an available donation

**Endpoint**

```http
PATCH /api/donations/:id/status
```

**Authentication:** Restaurant that owns the donation.

**Request body**

```json
{
  "status": "cancelled"
}
```

The discussed implementation permits the owning restaurant to cancel a donation only while its status is `available`.

**Important:** The status endpoint enforces the allowed transitions and role permissions. Do not assume that arbitrary status changes are accepted.

---

# 6. Admin Verification

Restaurant and NGO verification is important because several operations require a verified profile.

## 6.1 Verify a restaurant

**Endpoint**

```http
PATCH /api/restaurants/:id/verify
```

**Request body**

```json
{
  "verified": true
}
```

Use the admin account and the restaurant profile ID.

## 6.2 Verify an NGO

**Endpoint**

```http
PATCH /api/ngo/:id/verify
```

**Request body**

```json
{
  "verified": true
}
```

Use the admin account and the NGO profile ID.

### Why verification matters

A verified restaurant is required for donation creation and nearby-NGO matching.

A verified NGO is required for the discussed donation acceptance and availability-toggle operations, and for inclusion in nearby-NGO results.

The verification routes should only be used by authorized administrators.

---

# Complete Postman Testing Workflow

Follow this sequence to test the complete donation process.

## Step 1: Create and log in to accounts

Create the necessary user accounts and log in as:

- An admin.
- A restaurant.
- An NGO.

Use the authentication endpoints implemented in your application. Keep the sessions separate in Postman so you do not accidentally send the wrong user's cookie.

## Step 2: Create the restaurant profile

Send:

```http
POST /api/restaurants
```

Include the restaurant name, address, latitude, and longitude.

Copy the restaurant profile ID from the response.

## Step 3: Verify the restaurant

Switch to the admin session and send:

```http
PATCH /api/restaurants/RESTAURANT_PROFILE_ID/verify
```

Body:

```json
{
  "verified": true
}
```

## Step 4: Create the NGO profile

Using the NGO session, send:

```http
POST /api/ngo
```

Include the NGO name, address, coordinates, and any optional profile fields supported by your route.

Copy the NGO profile ID.

## Step 5: Verify the NGO

Using the admin session, send:

```http
PATCH /api/ngo/NGO_PROFILE_ID/verify
```

Body:

```json
{
  "verified": true
}
```

## Step 6: Enable NGO availability

Switch to the NGO session and send:

```http
PATCH /api/ngo/NGO_PROFILE_ID
```

Body:

```json
{
  "acceptingDonations": true
}
```

Confirm that the response indicates `acceptingDonations: true`.

## Step 7: Create a donation

Switch to the restaurant session and send:

```http
POST /api/donations
```

Example body:

```json
{
  "foodName": "Fresh Vegetable Meals",
  "foodType": "cooked_food",
  "quantity": 10,
  "unit": "servings",
  "expiryTime": "2026-10-11T18:00:00.000Z",
  "pickupDeadline": "2026-10-11T16:00:00.000Z"
}
```

Use valid future timestamps and any additional fields required by your schema.

Confirm that the donation is created with status `available`. Copy its ID.

## Step 8: Test nearby NGO matching

Using the restaurant session, send:

```http
GET /api/donations/DONATION_ID/nearby-NGO
```

There is no request body.

If the NGO is verified, accepting donations, and within 5 km, it should appear in the response.

If `count` is zero, check the matching criteria described in [Nearby NGO Matching](#4-nearby-ngo-matching).

## Step 9: View donations as the NGO

Using the NGO session, send:

```http
GET /api/donations
```

Confirm that the available donation appears in the results.

## Step 10: Accept the donation

Using the NGO session, send:

```http
POST /api/donations/DONATION_ID/accept
```

No request body is required by the discussed handler.

Confirm that the donation's status changes to `accepted` and that the NGO is assigned.

## Step 11: Mark the donation as picked up

Using the assigned NGO session, send:

```http
PATCH /api/donations/DONATION_ID/status
```

Body:

```json
{
  "status": "picked_up"
}
```

## Step 12: Complete the donation

Send the same endpoint again with:

```json
{
  "status": "completed"
}
```

The donation workflow is now complete.

**Note:** After completion, the donation will no longer qualify for nearby-NGO matching because that route requires status `available`. Create another donation to repeat the matching test.

---

# Geospatial Matching

The platform uses GeoJSON points and MongoDB's geospatial indexing to identify nearby NGOs.

## GeoJSON format

Coordinates must be stored as:

```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

For example:

```json
{
  "type": "Point",
  "coordinates": [77.3400, 28.1500]
}
```

Reversing latitude and longitude can produce incorrect location matching.

## MongoDB index

The NGO model defines a geospatial index:

```ts
ngoSchema.index({ location: "2dsphere" });
```

The restaurant model should also store valid GeoJSON locations for use by the application.

Make sure the required indexes have actually been created in MongoDB. Declaring an index in a Mongoose schema does not by itself prove that the index is already present in the database.

## Search radius

The nearby-NGO route uses:

```ts
$maxDistance: 5000
```

MongoDB interprets this distance in metres for GeoJSON proximity queries.

Therefore:

```text
5000 metres = 5 kilometres
```

The route returns at most 50 matching NGOs because the query uses `.limit(50)`.

---

# Common Errors

| Error or result | Likely explanation | What to check |
|---|---|---|
| `401 Unauthorized` | No valid authenticated user was found. | Log in and send the correct session cookie. |
| `403 Forbidden` | The user has the wrong role, does not own the profile, or the profile is not verified. | Check the account, ownership, and verification status. |
| `400 Invalid donation ID` | The supplied ID is not a valid MongoDB ObjectId. | Copy the exact `_id` from the response. |
| `404 Available donation not found for this restaurant` | No donation matches the ID, restaurant ownership, and `available` status conditions. | Create a fresh donation, use its ID, and confirm the restaurant session. |
| `404 Restaurant profile not found` | No restaurant profile is associated with the authenticated user. | Check the restaurant account and profile. |
| `404` during donation acceptance | The donation may not exist or may no longer be available. | Check its ID and current status. |
| `count: 0` from nearby-NGO matching | The request succeeded, but no NGOs satisfy every matching condition. | Check verification, availability, coordinates, distance, and indexes. |
| `500 Internal Server Error` | An unexpected server-side error occurred. | Check the terminal logs and MongoDB connection. |

The exact error response depends on the route. The nearby-NGO route returns a successful response with `count: 0` when no eligible NGOs are found; this is not the same as an API failure.

---

# Important Notes

1. **Use the correct account session.** Restaurant operations require a restaurant account; NGO acceptance and pickup operations require the assigned NGO; verification uses the admin account.
2. **Use profile IDs where required.** A restaurant profile ID is not the same as the restaurant user's ID. The same distinction applies to NGOs.
3. **Do not reuse completed donations for matching tests.** Nearby-NGO matching requires an available donation.
4. **Keep GeoJSON coordinates in longitude-latitude order.**
5. **Verify profiles before testing restricted operations.**
6. **Enable NGO availability explicitly.** A newly created NGO defaults to `acceptingDonations: false`.
7. **Do not assume that a `donating` flag publishes food.** Creating a donation requires `POST /api/donations`.
8. **Use the exact request bodies accepted by the code.** The Zod schema and route handlers determine required fields and valid values.
9. **Keep secrets out of source control.** Never commit MongoDB credentials, JWT secrets, or real authentication cookies.
10. **Confirm route implementations before publishing the API contract.** In particular, verify the exact response envelopes, registration/login URLs, optional fields, and permissions directly against the source files.

---

## Conclusion

The platform's primary workflow is:

**Restaurant publishes surplus food → NGO discovers available donations → NGO accepts a donation → Food is picked up → Donation is completed.**

Nearby-NGO matching helps restaurants discover verified, available NGOs within 5 km, using MongoDB geospatial queries.

This documentation covers the API behavior discussed during development. For a production release, keep the README synchronized with the actual route handlers, validation schemas, and authentication rules in the repository.
