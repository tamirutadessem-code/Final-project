# Task Management API

A complete REST API for managing tasks with JWT authentication, built with Node.js, Express, TypeScript, and Prisma.

## Features

- ✅ JWT Authentication
- ✅ User Registration & Login
- ✅ CRUD Operations for Tasks
- ✅ Task Status & Priority Management
- ✅ Task Statistics & Analytics
- ✅ Admin User Management
- ✅ Input Validation with Zod
- ✅ Error Handling Middleware
- ✅ Swagger API Documentation
- ✅ Docker Support
- ✅ PostgreSQL with Prisma ORM

## Tech Stack

- **Node.js** + **Express** - Backend framework
- **TypeScript** - Type safety
- **PostgreSQL** + **Prisma** - Database & ORM
- **JWT** - Authentication
- **Zod** - Input validation
- **Swagger** - API documentation
- **Docker** - Containerization

## API Documentation

Once running, access Swagger docs at:
- Local: http://localhost:5000/api-docs
- Production: https://task-db-cx2m.onrender.com/api-docs

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/tamirutadessem-code/Final-project.git
cd Final-project

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev