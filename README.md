# 📝 ProDocify

> A modern, collaborative online markdown documentation platform for teams and individuals.

[![Status](https://img.shields.io/badge/status-active%20development-brightgreen)]()
[![Node.js](https://img.shields.io/badge/Node.js-18+-47bf2d)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178c6)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 🎯 Project Vision

ProDocify is an **all-in-one markdown documentation platform** designed for:
- **Teams** - Collaborate on technical documentation in real-time
- **Developers** - Maintain project wikis, API docs, and knowledge bases
- **Organizations** - Share best practices and institutional knowledge
- **Individuals** - Take notes and organize personal documentation

### Key Features
✅ **Create & Edit** - Rich markdown editor with live preview  
✅ **Organize** - Hierarchical folder structure  
✅ **Collaborate** - Real-time editing with multiple users  
✅ **Share** - Granular permissions and share links  
✅ **Version Control** - Full history tracking and restore capability  
✅ **Activity Log** - Audit trail for all changes  
✅ **Teams** - Workspace management and team collaboration  
✅ **Integrations** - Sync with Google Drive, Dropbox (planned)  

---

## 🏗️ Project Status

| Phase | Status | Details |
|-------|--------|---------|
| **Planning** | ✅ Complete | Architecture, tech stack, roadmap finalized |
| **Backend Scaffold** | ✅ Complete | NestJS project, Prisma ORM, initial modules |
| **Database Schema** | ✅ Complete | User, Document, Folder models designed |
| **API Endpoints** | ✅ Complete | Document & Folder CRUD endpoints ready |
| **Authentication** | 🔄 In Progress | JWT scaffolding complete, implementation pending |
| **Frontend Scaffold** | ⏳ Planned | Next.js project setup |
| **Frontend UI** | ⏳ Planned | Pages and components |
| **Real-time Sync** | ⏳ Planned | WebSocket/Socket.IO integration |

---

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 14
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **State Management:** React Query + Zustand
- **Editor:** TipTap (Monaco Editor alternative)
- **Build Tool:** Vite (if SPA) / Next.js built-in (SSR)

### Backend
- **Runtime:** Node.js 18+
- **Framework:** NestJS 10
- **Language:** TypeScript 5.6+
- **Authentication:** JWT + Passport
- **Validation:** class-validator

### Database
- **Primary:** PostgreSQL 13+
- **ORM:** Prisma 5
- **Cache:** Redis (future)
- **Search:** Elasticsearch (future)

### DevOps
- **Containerization:** Docker
- **Cloud Hosting:** AWS / Azure / GCP
- **CI/CD:** GitHub Actions
- **Version Control:** Git

---

## 📋 Project Structure

```
ProDocify/
├── .github/
│   ├── instructions/          # Development guidelines
│   ├── prompts/               # AI-assisted workflow prompts
│   └── history/               # Session progress tracking
├── backend/                   # NestJS API server
│   ├── prisma/                # Database schema & migrations
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── documents/         # Document CRUD operations
│   │   ├── folders/           # Folder management
│   │   ├── prisma/            # Database service
│   │   └── common/            # Shared utilities
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── README.md              # Backend documentation
├── frontend/                  # Next.js web application (pending)
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Next.js pages
│   │   ├── hooks/             # Custom React hooks
│   │   └── styles/            # Global styles
│   └── package.json
├── infra/                     # Infrastructure as Code (pending)
│   ├── docker-compose.yml
│   └── terraform/
├── docs/                      # Documentation
│   └── API.md                 # API reference
├── project-planning.md        # Comprehensive planning document
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org))
- **npm** v9+
- **PostgreSQL** v13+ ([Download](https://www.postgresql.org/download))
- **Git** ([Download](https://git-scm.com))

### Backend Setup

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Configure DATABASE_URL in .env
# Edit .env and set your PostgreSQL connection string

# 5. Generate Prisma Client
npm run prisma:generate

# 6. Run database migrations
npm run prisma:migrate:dev --name init

# 7. Start development server
npm run dev
```

Backend will be available at: **http://localhost:4000/api**

### Frontend Setup (Coming Soon)

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

---

## 📚 API Documentation

### Health Check
```http
GET /api
```

### Documents
```http
GET /api/documents              # List all documents
GET /api/documents/:id          # Get single document
POST /api/documents             # Create document
PATCH /api/documents/:id        # Update document
DELETE /api/documents/:id       # Delete document
```

### Folders
```http
GET /api/folders                # List all folders
GET /api/folders/:id            # Get single folder
POST /api/folders               # Create folder
PATCH /api/folders/:id          # Update folder
DELETE /api/folders/:id         # Delete folder
```

### Authentication (Planned)
```http
POST /api/auth/register         # User registration
POST /api/auth/login            # User login
POST /api/auth/refresh          # Refresh token
POST /api/auth/logout           # User logout
```

Full API documentation: [Backend README](./backend/README.md)

---

## 🗄️ Database Schema

### Models

**User**
- Unique user accounts with authentication
- Profile information (email, metadata)
- Owns documents and folders

**Folder**
- Hierarchical organization of documents
- Belongs to a user (owner)
- Can contain multiple documents

**Document**
- Markdown content files
- Belongs to a user (owner) and optionally a folder
- Timestamps for creation and updates
- Future: versioning, sharing, permissions

---

## 📖 Development Workflow

### Making Changes to Backend

1. **Update Prisma Schema** (if adding/modifying models)
   ```bash
   # Edit: backend/prisma/schema.prisma
   ```

2. **Create Migration**
   ```bash
   npm run prisma:migrate:dev --name <migration-name>
   ```

3. **Implement Feature**
   - Create service in `src/feature/feature.service.ts`
   - Create controller in `src/feature/feature.controller.ts`
   - Create module in `src/feature/feature.module.ts`

4. **Test Endpoints**
   - Use Postman, curl, or REST Client extension

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add feature description"
   git push
   ```

### Environment Configuration

**Development (.env)**
```env
PORT=4000
JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=3600s
DATABASE_URL=postgresql://user:password@localhost:5432/prodocify
```

**Production (.env.production)**
- Use strong secrets (min 32 characters)
- Use managed database (AWS RDS, Azure Database, etc.)
- Enable HTTPS/TLS
- Configure CORS for frontend domain

---

## 🔐 Security & Authentication

### Current Implementation
- JWT token-based authentication
- Passport.js integration
- Input validation with class-validator
- CORS protection

### Planned Enhancements
- Multi-factor authentication (MFA)
- OAuth2 social login (Google, GitHub)
- SSO support for enterprises
- API key authentication
- Rate limiting and DDoS protection

---

## 📈 Roadmap

### Phase 1 (Weeks 1-2) - MVP
- ✅ Backend API scaffold
- ✅ Database schema
- ⏳ User authentication
- ⏳ Frontend dashboard
- ⏳ Document editor

### Phase 2 (Weeks 3-4) - Core Features
- Real-time collaboration (WebSocket)
- Document versioning
- Sharing and permissions
- Activity audit log

### Phase 3 (Weeks 5-8) - Enhancement
- Advanced search
- Document templates
- Rich media embedding
- Export to PDF/HTML

### Phase 4 (Weeks 9+) - Scale
- Team management
- Enterprise SSO
- Third-party integrations
- Mobile app or PWA

---

## 🧪 Testing

### Backend Tests (Coming Soon)

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

### Frontend Tests (Coming Soon)

```bash
# Component tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 📝 Available Commands

### Backend Commands
```bash
npm run dev                     # Start dev server with hot reload
npm run build                   # Compile TypeScript
npm start                       # Run compiled application
npm run lint                    # Run ESLint
npm run prisma:generate         # Generate Prisma Client
npm run prisma:migrate:dev      # Create and apply migration
npx prisma studio              # Open database browser
```

### Git Commands
```bash
git clone <repo-url>           # Clone repository
git checkout -b feature/name   # Create feature branch
git commit -m "message"        # Commit changes
git push origin feature/name   # Push to remote
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```
1. Check Node.js version: node --version (should be 18+)
2. Check dependencies: npm install
3. Check .env file exists with DATABASE_URL
4. Check PostgreSQL is running
```

### Database Connection Failed
```
1. Verify PostgreSQL is running: pg_isready -h localhost
2. Check DATABASE_URL in .env is correct
3. Verify database exists: psql -l
4. Run migrations: npm run prisma:migrate:dev
```

### Port Already in Use
```
# Change port in .env or kill process on port 4000:
lsof -ti:4000 | xargs kill -9    # macOS/Linux
netstat -ano | findstr :4000     # Windows
```

For more help, see: [Backend README](./backend/README.md) | [Project Planning](./project-planning.md)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [project-planning.md](./project-planning.md) | Architecture, design patterns, security, roadmap |
| [backend/README.md](./backend/README.md) | Backend setup, API endpoints, database schema |
| [.github/history/](./github/history/) | Session progress and achievements |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** changes: `git commit -am 'Add new feature'`
4. **Push** to branch: `git push origin feature/my-feature`
5. **Submit** a pull request

### Code Standards
- Use **TypeScript** for all code
- Follow **ESLint** rules (run `npm run lint`)
- Write **self-documenting** code with comments
- Commit messages in **Conventional Commits** format
- Test code before pushing

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 💬 Support

### Getting Help
- Check [Troubleshooting](#-troubleshooting) section
- Review [project-planning.md](./project-planning.md)
- Check [Backend README](./backend/README.md)
- Create an [Issue](https://github.com/yourusername/prodocify/issues)

### Contact
- **Project Lead:** [@you](https://github.com/yourusername)
- **Email:** your-email@example.com

---

## 🎉 Acknowledgments

Built with:
- [NestJS](https://nestjs.com) - Backend framework
- [Next.js](https://nextjs.org) - Frontend framework
- [Prisma](https://prisma.io) - ORM
- [PostgreSQL](https://postgresql.org) - Database
- [TypeScript](https://typescriptlang.org) - Type safety

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Backend Status** | 🟢 Scaffolded |
| **Frontend Status** | 🟡 Planned |
| **Database Models** | 3 (User, Folder, Document) |
| **API Endpoints** | 11 (ready) |
| **Documentation** | 📚 Comprehensive |
| **Last Updated** | May 13, 2026 |

---

**ProDocify** - *Making documentation collaborative, accessible, and beautiful* 🚀

![ProDocify Banner](https://via.placeholder.com/1200x300?text=ProDocify+-+Collaborative+Markdown+Documentation)
