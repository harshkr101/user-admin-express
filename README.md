# User and Admin API

## Description

This project is a Node.js application built with Express and TypeScript, using Prisma ORM with PostgreSQL for database management. It provides a robust API for user management with separate user and admin functionalities, including authentication and authorization.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control (User and Admin roles)
- User profile management
- Admin functionalities:
  - Create new users
  - View all users with pagination and filtering
  - Update user details
  - Delete users
- Request logging
- Docker support for easy deployment

## Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Docker (for containerized setup)
- PostgreSQL (if running without Docker)

## Installation

### Local Setup

1. Clone the repository:

   ```
   git clone https://github.com/harshkr101/user-admin-express.git
   cd user-admin-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Update the `.env` file with your DATABASE_URL and JWT secret

4. Run Prisma migrations:

   ```
   npx prisma migrate dev
   ```

5. Start the development server:

   ```
   npm run dev
   ```

### Docker Setup

1. Make sure Docker and Docker Compose are installed on your system.

2. Clone the repository and navigate to the project directory.

3. Build and start the containers:

   ```
   docker build -t backend .
   ```

   ```
   docker run -p 3000:3000 backend
   ```

## Usage

### API Endpoints

#### User Module

- `POST /api/register`: Register a new user
- `POST /api/login`: Login and receive a JWT token
- `GET /api/profile`: Get the current user's profile (requires authentication)

#### Admin Module

- `POST /api/admin/users`: Create a new user (admin only)
- `GET /api/admin/users`: Get a list of all users with pagination and filtering (admin only)
- `PUT /api/admin/users/:id`: Update a user's details (admin only)
- `DELETE /api/admin/users/:id`: Delete a user (admin only)

### Authentication

Include the JWT token in the Authorization header for authenticated requests:

```
Authorization: Bearer <your_token_here>
```

## Deployment

For production deployment, make sure to:

1. Set appropriate environment variables
2. Use a process manager like PM2 or deploy using Docker
3. Set up a reverse proxy (e.g., Nginx) for improved security and performance
