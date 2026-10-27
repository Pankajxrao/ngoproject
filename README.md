# Food Donation Platform

# live project link

https://shareaplate-green.vercel.app/


# Test Credentials

Admin:
gmail:admin@example.com
password:Admin123456
Restaurant: 
gmail:testrestaurant2@example.com
password:Restaurant123
Ngo: 
gmail:testngo2@example.com
password:NGO123456

A full-stack web application that connects restaurants with NGOs to reduce food waste and help communities in need. Restaurants can list surplus food, NGOs can discover and accept available donations, and administrators can monitor restaurants, NGOs, and donation activity.

The application includes a frontend for user interaction, a backend API for business logic, MongoDB for data storage, JWT-based authentication, and email notifications for donation pickup activities.

## Features

### Frontend

- Responsive user interface for restaurants, NGOs, and administrators.
- Restaurant and NGO registration and login.
- Dashboard access based on user roles.
- Restaurant profile and donation management.
- NGO donation discovery and acceptance.
- Donation status tracking.
- Nearby NGO discovery for available donations.
- Monthly donation statistics and activity monitoring.
- Form validation and user-friendly error handling.

### Backend

- MongoDB database integration using Mongoose.
- JWT authentication with HTTP-only cookies.
- Role-based access control.
- Restaurant and NGO registration and profile management.
- Restaurant and NGO verification endpoints.
- Donation creation, acceptance, cancellation, and status updates.
- Geospatial search for nearby NGOs within a 5 km radius.
- Email notifications using Nodemailer and Gmail SMTP.
- Monthly donation statistics.
- Administrative endpoints for monitoring platform activity.

### Security

- HTTP-only authentication cookies.
- Server-side authentication and authorization.
- Protected administrative endpoints.
- Environment variables for sensitive configuration.
- Validation of incoming API requests.

## Technology Stack

| Layer             | Technology                          |
| ----------------- | ----------------------------------- |
| Frontend          | Next.js, React, TypeScript          |
| Backend           | Next.js |
| Database          | MongoDB Atlas                       |
| ODM               | Mongoose                            |
| Authentication    | JWT, HTTP-only cookies              |
| Email             | Nodemailer, Gmail SMTP              |
| Geospatial search | MongoDB GeoJSON, 2dsphere indexes   |
| Deployment        | Vercel                              |
| Version control   | Git, GitHub                         |

Adjust the frontend technology list if your implementation uses additional libraries, such as Tailwind CSS, shadcn/ui, or a form-validation library.

## User Roles

### Restaurant

- Register and manage a restaurant profile.
- Create food donation listings.
- View donation details and status.
- Track whether donations have been accepted or completed.
- Cancel donations while they are still available.
- Receive email notifications related to pickup activity.

### NGO

- Register and manage an NGO profile.
- Discover available food donations.
- Find nearby verified NGOs that are accepting donations.
- Accept available donations.
- Update donation status as the food is picked up and delivered.

### Administrator

- View registered restaurants and NGOs.
- Verify restaurants and NGOs.
- View donations associated with restaurants and NGOs.
- Monitor monthly donation statistics and platform activity.

## Application Architecture

The application uses Next.js for both the frontend and backend. Frontend pages and backend API routes can be deployed together as one application.

- **Frontend:** Displays pages, forms, dashboards, donation listings, and status information.
- **API layer:** Handles requests, validation, authentication, authorization, and business logic.
- **Database:** Stores user profiles, restaurant and NGO information, donations, and geospatial data.
- **Email service:** Sends notifications for relevant donation and pickup events.
- **Hosting:** Vercel serves the application, while MongoDB Atlas provides the database.

## Project Structure

The exact directory structure may differ depending on how the project was organized.

```text
food-donation-platform/
├── public/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── restaurants/
│   │   │   ├── ngo/
│   │   │   ├── donations/
│   │   │   └── admin/
│   │   ├── restaurants/
│   │   ├── ngo/
│   │   ├── donations/
│   │   ├── admin/
│   │   ├── login/
│   │   ├── register/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── db.ts
│   │   └── auth.ts
│   ├── models/
│   └── types/
├── .env.local
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

This is a suggested structure, not a claim about the exact files in your repository. Keep your existing directory and file names when adapting this README.

## Prerequisites

Before running the project, install or prepare:

- Node.js compatible with your installed Next.js version.
- npm, yarn, pnpm, or the package manager used by your project.
- A MongoDB Atlas account or a local MongoDB instance.
- A Gmail account and an app password if Gmail SMTP is used.
- Git for version control.

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd food-donation-platform
```

Replace `YOUR_REPOSITORY_URL` with the URL of your GitHub repository.

### 2. Install dependencies

If the project uses npm:

```bash
npm install
```

If the repository contains a lockfile for another package manager, use the matching package manager instead.

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
EMAIL_USER=your_gmail_address
EMAIL_APP_PASSWORD=your_gmail_app_password
```

Use the exact variable names expected by your source code. If your project has additional variables, such as a public application URL, configure those as well.

**Important:** Never commit `.env.local` or expose database credentials, JWT secrets, or email passwords in frontend code. Use a strong, unique JWT secret and a Gmail app password rather than your normal Gmail password.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To check available scripts, inspect the `scripts` section in `package.json`.

### 5. Build for production

```bash
npm run build
npm run start
```

Run the production build locally to identify build errors before deployment.

## Environment Variables

| Variable             | Purpose                               |
| -------------------- | ------------------------------------- |
| `MONGODB_URI`        | MongoDB database connection string    |
| `JWT_SECRET`         | Secret used to sign and verify JWTs   |
| `EMAIL_USER`         | Gmail address used for notifications  |
| `EMAIL_APP_PASSWORD` | Gmail app password used by Nodemailer |

Store production values in your hosting provider's environment-variable settings rather than uploading a local environment file.

## API Documentation

The following endpoints describe the backend API. They assume the routes are implemented under `/api`. Update the paths and HTTP methods if your source code differs.

### Restaurants

| Method | Endpoint                      | Description                 |
| ------ | ----------------------------- | --------------------------- |
| GET    | `/api/restaurants`            | List restaurants            |
| POST   | `/api/restaurants`            | Register a restaurant       |
| GET    | `/api/restaurants/:id`        | Retrieve restaurant details |
| PATCH  | `/api/restaurants/:id`        | Update restaurant details   |
| PATCH  | `/api/restaurants/:id/verify` | Verify a restaurant         |

### NGOs

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| GET    | `/api/ngo`            | List NGOs            |
| POST   | `/api/ngo`            | Register an NGO      |
| GET    | `/api/ngo/:id`        | Retrieve NGO details |
| PATCH  | `/api/ngo/:id`        | Update NGO details   |
| PATCH  | `/api/ngo/:id/verify` | Verify an NGO        |

### Donations

| Method | Endpoint                        | Description                  |
| ------ | ------------------------------- | ---------------------------- |
| GET    | `/api/donations`                | List donations               |
| POST   | `/api/donations`                | Create a donation            |
| POST   | `/api/donations/:id/accept`     | Accept an available donation |
| PATCH  | `/api/donations/:id/status`     | Update donation status       |
| GET    | `/api/donations/:id/nearby-NGO` | Find nearby eligible NGOs    |

### Administration

| Method | Endpoint                               | Description                                 |
| ------ | -------------------------------------- | ------------------------------------------- |
| GET    | `/api/admin/ngo`                       | List NGOs for administration                |
| GET    | `/api/admin/ngo/:id/donations`         | View donations associated with an NGO       |
| GET    | `/api/admin/restaurants`               | List restaurants for administration         |
| GET    | `/api/admin/restaurants/:id/donations` | View donations associated with a restaurant |

Monthly statistics may be supported through a query parameter such as `?month=YYYY-MM` on the appropriate implemented endpoint. Confirm the exact route and query parameters in the source code.

### Authentication

Protected endpoints require valid authentication according to the application's implementation. JWTs are stored in HTTP-only cookies so client-side JavaScript cannot directly read the token.

Requests made from the frontend should preserve the authentication cookie where required. If an external client is used for testing, configure its cookie handling and credentials appropriately.

## Donation Workflow

A donation generally follows this lifecycle:

```text
Available
   |
   v
Accepted
   |
   v
Picked Up
   |
   v
Completed
```

- **Available:** A restaurant has created a donation that can be accepted.
- **Accepted:** An eligible NGO has accepted the donation.
- **Picked Up:** The NGO has collected the food.
- **Completed:** The donation process has been completed.

A restaurant can cancel a donation while it is still available, according to the application's business rules. Status transitions should be validated by the backend to prevent unauthorized or invalid updates.

## Nearby NGO Search

The platform can locate NGOs near a donation's pickup location.

- Uses GeoJSON coordinates stored in MongoDB.
- Uses a `2dsphere` index for geospatial queries.
- Searches within a radius of 5 km.
- Filters for verified NGOs that are currently accepting donations, where supported by the implementation.

Ensure location coordinates are stored in the correct longitude-latitude order for GeoJSON and that the relevant geospatial index exists.

## Email Notifications

Nodemailer and Gmail SMTP are used to send relevant email notifications, including pickup-related messages to restaurants.

To configure email delivery:

1. Enable two-step verification on the Gmail account.
2. Generate an app password if your account and organization settings permit it.
3. Store the Gmail address and app password in environment variables.
4. Test email delivery in development and production.
