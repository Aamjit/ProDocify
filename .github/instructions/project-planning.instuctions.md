# ProDocify Project Planning

## 1. Product Vision
ProDocify is an online markdown documentation platform for teams and individuals. It should support:
- Create, edit, organize, and share Markdown files
- Folder-based document structure
- User and team authentication
- Dashboard for managing MD files and folders
- Online MD editor with collaboration and version history
- Sharing, permissions, and activity logging
- Integration with third-party storage and services

## 2. Recommended Tech Stack

### Frontend
- Framework: React 19 or Next.js 14
- Styling: Tailwind CSS or Chakra UI for a consistent design system
- Editor: TipTap or Monaco Editor with Markdown and preview support
- State management: React Query / TanStack Query plus Zustand or Jotai
- Real-time: Socket.IO or WebSocket-based events
- Build tooling: Vite for SPA; Next.js built-in tools for hybrid SSR

### Backend
- Runtime: Node.js + TypeScript
- API: REST with Express.js or NestJS; GraphQL via Apollo Server is optional
- Realtime: Socket.IO or native WebSocket server
- Auth: JWT with refresh tokens; OAuth2 for social login

### Database
- Primary DB: PostgreSQL
- Realtime/session cache: Redis
- Search: PostgreSQL full-text search; Elasticsearch optional later
- Attachments & backups: S3-compatible object storage

### Deployment
- Containerization: Docker
- Cloud: AWS / Azure / GCP
- CI/CD: GitHub Actions or Azure Pipelines

## 3. File Structure

Suggested monorepo layout:

ProDocify/
- backend/
  - src/
    - auth/
    - docs/
    - users/
    - teams/
    - collaboration/
    - shared/
  - tests/
  - package.json
- frontend/
  - src/
    - components/
    - features/
    - hooks/
    - lib/
    - pages/ or app/
    - styles/
  - public/
  - package.json
- infra/
  - docker-compose.yml
  - terraform/ or k8s/
- docs/
- project-planning.md

## 4. Design Patterns
- Domain-driven design for backend modules
- Layered architecture: controllers, services, repositories
- CQRS for separation of queries and commands where collaboration and document reads differ
- Event-driven design for audit logs, notifications, and real-time updates
- Repository and unit-of-work patterns for DB operations
- Feature-based frontend organization for reusable UI and state

## 5. Security Protocols
- Enforce HTTPS/TLS for all traffic
- Strong password policy with rate limiting on auth endpoints
- JWT access tokens with short lifetimes, refresh tokens stored securely
- CSRF protection for cookie-based flows
- Input validation and sanitization for Markdown content
- Content Security Policy (CSP) headers to prevent XSS
- Security headers via Helmet or equivalent middleware
- Role-based access control (RBAC) for document and team permissions
- Data encryption at rest for sensitive data and backups

## 6. Authentication and Session Handling
- Login methods:
  - Email/password
  - OAuth providers: Google, GitHub
  - SSO support planned later
- Session approach:
  - Primary auth via JWT access tokens
  - Refresh token rotation with server-side revocation list
  - Optional secure httpOnly cookies for browser clients
- Profile and team membership management
- Future: multi-factor authentication (MFA)

## 7. Database Handling
- Core tables:
  - users
  - profiles
  - teams
  - folders
  - documents
  - document_versions
  - document_collaborators
  - shares
  - audit_logs
- Versioning model:
  - Separate Markdown content from rendered HTML
  - Store author, timestamp, and change summary per version
- Use transactions for atomic multi-step operations
- Soft deletes for recovery
- Index by user_id, team_id, path, updated_at
- Background cleanup for expired shares and stale sessions

## 8. Real-Time Collaboration
- MVP: live presence, cursor updates, and draft broadcasting
- Future: OT/CRDT for concurrent editing
- Document channels with WebSocket/Socket.IO
- Optimistic UI updates in the editor
- Periodic server-side draft persistence

## 9. Performance Tuning
- Frontend:
  - lazy-load editor and heavy components
  - code-splitting by route
  - cache API responses with React Query
- Backend:
  - optimize DB queries and use pagination
  - cache permissions and metadata in Redis
  - background workers for expensive tasks
  - CDN for static assets
- Observability via metrics, logs, and tracing

## 10. Frontend UX and Look
- Modern, clean workspace interface
- Sidebar document/folder tree
- Markdown editor with split preview
- Top bar for actions, sharing, and history
- Responsive dashboard and mobile-friendly lists
- Dark/light theme toggle
- Quick-create actions and recent documents on the home screen

## 11. Packages and Libraries

Frontend:
- React / Next.js
- TypeScript
- Tailwind CSS or Chakra UI
- TipTap or Monaco Editor
- React Query / TanStack Query
- Zod or Yup for validation
- Framer Motion for UI transitions
- date-fns or dayjs

Backend:
- Node.js + TypeScript
- Express or NestJS
- Prisma or TypeORM
- Zod or Joi
- bcrypt or argon2
- jsonwebtoken
- Socket.IO or ws
- ioredis
- pg or pg-promise
- Passport.js / custom auth
- BullMQ for background jobs
- Pino or Winston for logging

## 12. Testing Strategy
- Unit tests for utilities, auth, and API services
- Integration tests for routes and DB operations
- End-to-end tests for core workflows
- Accessibility testing for UI
- Tools: Jest, Testing Library, Playwright or Cypress
- Critical cases:
  - sign-up / sign-in / reset
  - document create/edit/delete
  - folder nesting and navigation
  - sharing and permissions enforcement
  - version history restore
  - collaboration presence and updates
  - RBAC checks

## 13. Development Guidelines
- Use TypeScript consistently
- Shared lint + formatting: ESLint, Prettier
- Pre-commit hooks via Husky
- Consistent commit and PR conventions
- Feature flags for incremental rollout
- Document APIs with OpenAPI or similar
- Keep components and routes small and testable
- Maintain README and architecture docs

## 14. Vulnerabilities and Mitigations
- XSS: sanitize Markdown output
- CSRF: same-site cookies or CSRF tokens
- Injection: parameterize DB queries
- Broken auth: enforce strong token handling and brute-force defense
- Insecure sharing: expire links and limit scope
- Data leakage: strict ACLs and team boundaries
- Supply chain: lock dependencies and audit regularly

## 15. Future Enhancements
- Full collaborative editing with OT/CRDT
- Offline editing and sync
- Kanban / note board view
- External storage sync: Google Drive, Dropbox
- Rich content embedding and diagrams
- Enterprise workspaces and SSO
- AI-assisted writing, summarization, and search
- Compliance reports and audit dashboards

## 16. Roadmap
1. Scaffold frontend/backend and DB
2. Build auth, profile, onboarding
3. Add document CRUD, editor, folder structure
4. Implement sharing and permissions
5. Add version history and activity audit
6. Add live collaboration and presence
7. Expand search and integrations
8. Harden performance and security

## 17. Summary
ProDocify should launch as a secure, modern markdown collaboration platform. Begin with core document management, then iterate on collaboration, sharing, and integrations while preserving reliability and developer velocity.
