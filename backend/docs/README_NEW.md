# ProDocify Backend

A production-ready NestJS backend for a Markdown document management platform with team collaboration, document versioning, and role-based access control.

## ✨ Features

- **Document Management** - Create, edit, delete, organize Markdown documents
- **Versioning** - Automatic version history with rollback capability
- **Team Collaboration** - Create teams, manage members, share documents
- **Role-Based Access** - 3-tier permission system (VIEWER, EDITOR, ADMIN)
- **Authentication** - JWT-based with bcrypt password hashing
- **Rate Limiting** - Request throttling to prevent abuse
- **Full API** - Comprehensive REST API with Swagger documentation
- **Production Ready** - Error handling, validation, logging, transactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Setup (5 minutes)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

3. **Setup database**
   ```bash
   npm run prisma:migrate:dev -- --name initial
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

5. **Access Swagger documentation**
   - Navigate to: http://localhost:3000/api/docs
   - Start making API requests

## 📖 Documentation

**All documentation is organized for easy discovery:**

- **[START HERE](./DOCS_GUIDE.md)** - Documentation index and quick links
- **[Quick Start](./docs/00_START_HERE.md)** - 5-minute setup guide
- **[Quick Reference](./docs/QUICK_REFERENCE.md)** - Commands and examples
- **[API Reference](./docs/API_REFERENCE.md)** - Complete API documentation
- **[Code Standards](./docs/CODE_STANDARDS.md)** - Development guidelines
- **[Production Deployment](./docs/PRODUCTION_DEPLOYMENT.md)** - Deployment guide
- **[Database Migration](./docs/MIGRATION_GUIDE.md)** - Database setup
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current progress

**For complete documentation index, see [DOCS_GUIDE.md](./DOCS_GUIDE.md)**

## 📡 API Endpoints

### Teams (9 endpoints)
- `POST /api/teams` - Create team
- `GET /api/teams` - List teams
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team (ADMIN)
- `DELETE /api/teams/:id` - Delete team (Owner)
- `GET /api/teams/:id/members` - List members
- `POST /api/teams/:id/members` - Add member (ADMIN)
- `PUT /api/teams/:id/members/:memberId` - Update member role (ADMIN)
- `DELETE /api/teams/:id/members/:memberId` - Remove member (ADMIN)

### Documents (6 endpoints)
- `POST /api/teams/:teamId/documents` - Create document
- `GET /api/teams/:teamId/documents` - List documents
- `GET /api/teams/:teamId/documents/:docId` - Get document
- `PUT /api/teams/:teamId/documents/:docId` - Update document
- `DELETE /api/teams/:teamId/documents/:docId` - Delete document
- `GET /api/teams/:teamId/documents/:docId/versions` - Get version history

**See [API_REFERENCE.md](./docs/API_REFERENCE.md) for complete endpoint documentation**

## 🔐 Authorization

### Role Hierarchy

| Feature | VIEWER | EDITOR | ADMIN | Owner |
|---------|--------|--------|-------|-------|
| View Documents | ✅ | ✅ | ✅ | ✅ |
| Create Documents | ❌ | ✅ | ✅ | ✅ |
| Edit Documents | ❌ | ✅ | ✅ | ✅ |
| Delete Documents | ❌ | ✅ | ✅ | ✅ |
| Manage Team | ❌ | ❌ | ✅ | ✅ |
| Delete Team | ❌ | ❌ | ❌ | ✅ |

## 🛠️ Development

### Available Commands

```bash
# Development
npm run dev              # Start dev server with auto-reload
npm run build           # Build for production
npm start              # Run production build

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate:dev -- --name <name>  # Create migration

# Code Quality
npm run lint            # Lint and fix code
npm test               # Run tests
npm test -- --watch    # Watch mode testing

# Utilities
npx prisma studio     # Open database GUI
```

### Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
├── app.controller.ts      # Health check
├── app.service.ts         # Health service
├── auth/                  # Authentication
├── users/                 # User management
├── documents/             # Document operations
├── team.controller.ts     # Team endpoints
├── team-document.controller.ts # Document endpoints
├── team*.ts              # Team services
├── common/               # Shared utilities
│   ├── guards/          # Route guards
│   ├── decorators/      # Custom decorators
│   └── rate-limiter.ts  # Rate limiting
└── prisma/              # Database client

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Schema versions

docs/                    # All documentation
```

## 📊 Technology Stack

- **Runtime:** Node.js 18+
- **Framework:** NestJS 11.1.20
- **ORM:** Prisma 5.15.0
- **Database:** PostgreSQL 12+
- **Authentication:** JWT with Passport
- **Validation:** class-validator
- **Documentation:** Swagger/OpenAPI
- **Code Quality:** ESLint, Prettier
- **Logging:** Winston

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
PORT=3001 npm run dev
```

### Database Connection Error
```bash
# Verify DATABASE_URL in .env
psql -U user -d prodocify -h localhost
```

### TypeScript Errors
```bash
npm run prisma:generate
npm run build
```

### Migration Issues
```bash
npx prisma migrate status
npx prisma migrate reset  # Warning: resets all data
```

**For more issues, see [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)**

## 📋 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/prodocify

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# Server
NODE_ENV=development
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

See `.env.example` for template.

## 🚀 Deployment

### Production Deployment
1. Set `NODE_ENV=production`
2. Configure PostgreSQL with backups
3. Use strong JWT_SECRET
4. Enable HTTPS
5. Setup monitoring and logging
6. Run migrations: `npm run prisma:migrate:deploy`
7. Build and start: `npm run build && npm start`

See [PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md) for details.

## ✅ Project Status

**Current Phase:** 2 (Controllers & Services) - Complete ✅

- ✅ 15 API endpoints implemented
- ✅ Document versioning with auto-tracking
- ✅ Team collaboration with role-based access
- ✅ Authentication and authorization
- ✅ Rate limiting and transaction support
- ✅ Production-ready error handling
- ⏳ Integration tests (Phase 3)
- ⏳ Performance optimization (Phase 3)

See [PROJECT_STATUS.md](./docs/PROJECT_STATUS.md) for full roadmap.

## 🤝 Contributing

1. Follow [CODE_STANDARDS.md](./docs/CODE_STANDARDS.md)
2. Ensure all tests pass: `npm test`
3. Lint code: `npm run lint`
4. Create meaningful commit messages
5. Submit PR with description

## 📞 Support

- **Setup Issues:** See [00_START_HERE.md](./docs/00_START_HERE.md)
- **API Questions:** See [API_REFERENCE.md](./docs/API_REFERENCE.md)
- **Deployment:** See [PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md)
- **Common Issues:** See [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
- **Questions:** See [FAQ.md](./docs/FAQ.md)

## 📄 License

[Your License Here]

## 🎯 Next Steps

1. **Read:** [00_START_HERE.md](./docs/00_START_HERE.md) for setup
2. **Learn:** [API_REFERENCE.md](./docs/API_REFERENCE.md) for API
3. **Build:** [CODE_STANDARDS.md](./docs/CODE_STANDARDS.md) for standards
4. **Deploy:** [PRODUCTION_DEPLOYMENT.md](./docs/PRODUCTION_DEPLOYMENT.md) for production

---

**Documentation:** See [DOCS_GUIDE.md](./DOCS_GUIDE.md) for complete index

**Start with:** [docs/00_START_HERE.md](./docs/00_START_HERE.md) 🚀

*Status: Phase 2 Complete | Last Updated: 2026-05-23*
