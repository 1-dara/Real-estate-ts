#  Real Estate API — TypeScript Edition

A complete re-architecture of the original Python/FastAPI Real Estate API, rebuilt in **TypeScript** with **Node.js**, **Express**, **Prisma ORM**, and **PostgreSQL**. Deployed and live.

 **Live API Docs:** YOUR_RENDER_URL/docs
 **GitHub:** <https://github.com/1-dara/real-estate-ts>
 **Original Python Version:** <https://real-estate-api-1-6678.onrender.com/docs>

-----

## Why This Project

This is a deliberate cross-stack re-architecture of an existing production-style system. The original was built with Python and FastAPI. This version rebuilds the same features and business logic in TypeScript and Node.js — demonstrating the ability to work across languages, compare architectural decisions, and re-architect real systems.

-----

## Features

- **JWT Authentication** — Register and login with role-based access (agent vs user)
- **Property CRUD** — Full create, read, update, delete for property listings
- **Advanced Search** — Filter by city, type, price range, bedrooms, and status
- **Pagination** — Efficient data loading with page and limit controls
- **Cloudinary Image Uploads** — Multi-image upload via multipart form
- **Reviews System** — Users can review properties with anti-duplicate and anti-self-review rules enforced at database level
- **Role-based Access** — Only agents can create, update, and delete properties
- **Average Ratings** — Computed and returned on every property response
- **TypeScript** — Fully typed codebase with strict mode, interfaces, and custom request types

-----

## Tech Stack

|Technology|Purpose                              |
|----------|-------------------------------------|
|TypeScript|Language                             |
|Node.js   |Runtime                              |
|Express   |Web framework                        |
|PostgreSQL|Database                             |
|Prisma ORM|Database access and schema management|
|JWT       |Authentication                       |
|bcryptjs  |Password hashing                     |
|Cloudinary|Image storage                        |
|Multer    |File upload handling                 |
|Render    |Deployment                           |

-----

## Comparison with Original Python Version

|Feature   |Python Version          |TypeScript Version                |
|----------|------------------------|----------------------------------|
|Language  |Python                  |TypeScript                        |
|Framework |FastAPI                 |Express                           |
|ORM       |SQLAlchemy + Alembic    |Prisma                            |
|Validation|Pydantic schemas        |TypeScript interfaces             |
|Async     |Native async/await      |Native async/await                |
|API Docs  |Auto-generated (FastAPI)|swagger-jsdoc + swagger-ui-express|
|Auth      |OAuth2 + JWT            |JWT                               |

-----

## API Endpoints

### Auth

|Method|Endpoint            |Description              |Auth|
|------|--------------------|-------------------------|----|
|POST  |`/api/auth/register`|Register as user or agent|❌   |
|POST  |`/api/auth/login`   |Login and get JWT token  |❌   |

### Properties

|Method|Endpoint             |Description                              |Auth            |
|------|---------------------|-----------------------------------------|----------------|
|GET   |`/api/properties`    |Get all properties (filters + pagination)|❌               |
|POST  |`/api/properties`    |Create a property listing                |Agent only      |
|GET   |`/api/properties/:id`|Get a single property with reviews       |❌               |
|PUT   |`/api/properties/:id`|Update a property                        |Agent owner only|
|DELETE|`/api/properties/:id`|Delete a property                        |Agent owner only|

### Reviews

|Method|Endpoint                     |Description                   |Auth     |
|------|-----------------------------|------------------------------|---------|
|GET   |`/api/properties/:id/reviews`|Get all reviews for a property|❌        |
|POST  |`/api/properties/:id/reviews`|Add a review                  |User only|
|DELETE|`/api/reviews/:id`           |Delete your own review        |✅        |

-----

## Business Rules

- Only agents can create, update, or delete property listings
- Agents can only modify their own listings
- Users cannot review a property more than once (enforced at database level)
- Agents cannot review their own properties
- Deleting a property automatically removes all associated reviews

-----

## Setup & Installation

1. **Clone the repository**

```bash
git clone https://github.com/1-dara/real-estate-ts.git
cd real-estate-ts
```

1. **Install dependencies**

```bash
npm install
```

1. **Create a `.env` file**

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=3002
```

1. **Generate Prisma client**

```bash
npx prisma generate
```

1. **Start the development server**

```bash
npm run dev
```

1. **Visit the docs**

```
http://localhost:3002/docs
```

-----

## Author

**Irene Peter-Okon Idara**
Backend Engineer
 1ireneokon@gmail.com
 github.com/1-dara