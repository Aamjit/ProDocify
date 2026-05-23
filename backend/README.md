# ProDocify Backend API

A modern, scalable REST API built with **NestJS**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**. This backend powers the ProDocify markdown documentation platform with features for user authentication, document management, folder organization, and real-time collaboration.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Environment Setup](#environment-setup)
- [Database](#database)
- [Development Workflow](#development-workflow)
- [Available Scripts](#available-scripts)
- [Authentication](#authentication)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

ProDocify Backend provides a comprehensive REST API for:
- **User Management** - registration, authentication, profiles
- **Document Operations** - create, read, update, delete markdown files
- **Folder Management** - organize documents in hierarchical folders
- **Real-time Collaboration** - WebSocket support for live editing (future)
- **Audit Logging** - activity tracking and versioning

**Tech Stack:**
- Runtime: Node.js
- Framework: NestJS 10
- Language: TypeScript 5.6+
- Database: PostgreSQL 13+
- ORM: Prisma 5
- Authentication: JWT + Passport
- Validation: class-validator

---

## 📦 Prerequisites

Ensure you have installed:
- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** v9+ (comes with Node.js)
- **PostgreSQL** v13+ ([Download](https://www.postgresql.org/download))

Verify installations:
```powershell
node --version    # Should output v18.x or higher
npm --version     # Should output 9.x or higher
psql --version    # Should output PostgreSQL 13 or higher
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your PostgreSQL credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=4000
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=3600s
DATABASE_URL=postgresql://user:password@localhost:5432/prodocify
```

### 3. Generate Prisma Client
```powershell
npm run prisma:generate
```

### 4. Run Database Migrations
```powershell
npm run prisma:migrate:dev --name init
```

### 5. Start Development Server
```powershell
npm run dev
```

Backend will be available at: **http://localhost:4000/api**

### 6. API Documentation
Once the server is running, view Swagger documentation at:
```text
http://localhost:4000/api/docs
```

---

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── migrations/            # Migration history
├── src/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── documents/
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   ├── documents.module.ts
│   │   └── dto/
│   │       ├── create-document.dto.ts
│   │       └── update-document.dto.ts
│   ├── folders/
│   │   ├── folders.controller.ts
│   │   ├── folders.service.ts
│   │   ├── folders.module.ts
│   │   └── dto/
│   │       ├── create-folder.dto.ts
│   │       └── update-folder.dto.ts
│   ├── prisma/
│   │   ├── prisma.module.ts   # Global database service
│   │   └── prisma.service.ts
│   ├── common/
│   │   └── configuration.ts   # Configuration factory
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Root controller
│   ├── app.service.ts         # Root service
│   └── main.ts                # Application bootstrap
├── dist/                      # Compiled JavaScript (production)
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── .env                       # Environment variables (local)
├── .env.example               # Environment template
└── README.md
```

---

## 🔌 API Endpoints

### Health Check
```http
GET /api
Response: { "message": "Welcome to ProDocify backend", "status": "ok" }
```

### Authentication
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
Response: { "message": "This is a placeholder auth endpoint", "email": "user@example.com" }
```

### Documents
```http
# List all documents
GET /api/documents

# Get single document
GET /api/documents/:id

# Create document
POST /api/documents
Content-Type: application/json

{
  "title": "My Document",
  "content": "# Markdown content here",
  "ownerId": "uuid-here",
  "folderId": "uuid-here" (optional)
}

# Update document
PATCH /api/documents/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}

# Delete document
DELETE /api/documents/:id
```

### Folders
```http
# List all folders
GET /api/folders

# Get single folder
GET /api/folders/:id

# Create folder
POST /api/folders
Content-Type: application/json

{
  "name": "My Folder",
  "ownerId": "uuid-here"
}

# Update folder
PATCH /api/folders/:id
Content-Type: application/json

{
  "name": "Renamed Folder"
}

# Delete folder
DELETE /api/folders/:id
```

---

## 🔐 Environment Setup

### `.env.example` Template
```env
# Server
PORT=4000

# JWT Authentication
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=3600s

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prodocify
```

### Environment Variables Explained
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | `super-secret-key` |
| `JWT_EXPIRES_IN` | JWT token expiration time | `3600s`, `7d` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |

---

## 🗄️ Database

### Schema Overview

**User**
- `id` (String, Primary Key, UUID)
- `email` (String, Unique)
- `createdAt`, `updatedAt` (Timestamps)
- Relations: documents, folders

**Folder**
- `id` (String, Primary Key, UUID)
- `name` (String)
- `ownerId` (String, Foreign Key → User)
- `createdAt`, `updatedAt` (Timestamps)
- Relations: owner, documents

**Document**
- `id` (String, Primary Key, UUID)
- `title` (String)
- `content` (String, Optional - Markdown)
- `ownerId` (String, Foreign Key → User)
- `folderId` (String, Optional, Foreign Key → Folder)
- `createdAt`, `updatedAt` (Timestamps)
- Relations: owner, folder

### Database Operations

**View/Edit Schema**
```powershell
npx prisma studio
```
Opens interactive database browser at `http://localhost:5555`

**Create New Migration**
```powershell
npm run prisma:migrate:dev --name <migration-name>
```

**Reset Database (Development Only)**
```powershell
npx prisma migrate reset
```

---

## 🛠️ Development Workflow

### 1. Make Schema Changes
Edit `prisma/schema.prisma`:
```prisma
model YourNewModel {
  id    String  @id @default(uuid())
  name  String
}
```

### 2. Generate Migration
```powershell
npm run prisma:migrate:dev --name add_your_new_model
```

### 3. Generate Prisma Client
```powershell
npm run prisma:generate
```

### 4. Implement Service
Create `src/yourmodule/yourmodule.service.ts` with database operations

### 5. Create Controller
Create `src/yourmodule/yourmodule.controller.ts` with routes

### 6. Register Module
Add to `src/app.module.ts` imports

### 7. Test Endpoints
Use Postman, curl, or VS Code REST Client

---

## 📝 Available Scripts

```powershell
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Compile TypeScript to JavaScript
npm start                # Run compiled application

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate:dev --name <name>  # Create and apply migration

# Code Quality
npm run lint             # Run ESLint with auto-fix

# Prisma Studio
npx prisma studio       # Open interactive database browser
```

---

## 🔐 Authentication

### Current Status
Authentication endpoints are scaffolded and ready for implementation.

### Implementation Roadmap
1. **User Registration** - create user accounts with hashed passwords
2. **Login** - validate credentials and issue JWT tokens
3. **Refresh Tokens** - extend session without re-authentication
4. **JWT Validation** - middleware to protect routes
5. **OAuth2** - integrate Google and GitHub login

### Planned Decorators
```typescript
@UseGuards(JwtAuthGuard)  // Protect routes
@CurrentUser()             // Inject authenticated user
@Roles('admin')            // Role-based access control
```

---

## 🐛 Troubleshooting

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::4000
```
**Solution:** Change PORT in `.env` or kill process:
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### Database Connection Failed
```
Error: P1001: Can't reach database server at localhost:5432
```
**Solution:** Verify PostgreSQL is running:
```powershell
# Windows
pg_isready -h localhost -p 5432

# macOS/Linux
pg_isready -h localhost -p 5432
```

### Prisma Client Not Found
```
Error: Cannot find module '@prisma/client'
```
**Solution:** Regenerate Prisma Client:
```powershell
npm run prisma:generate
```

### TypeScript Compilation Errors
```
npm run build
```
Fix errors in source files before deploying.

### Module Not Found
Clear `node_modules` and reinstall:
```powershell
rm -r node_modules package-lock.json
npm install
```

---

## 📚 Documentation References

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma ORM Guide](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/my-feature`
4. Submit pull request

---

## 📄 License

This project is part of ProDocify. See `LICENSE` for details.

---

**Last Updated:** May 13, 2026  
**Backend Status:** ✅ Scaffolded and Ready for Development
