# Glow Flow Salon Management Backend

Multi-tenant Salon Management SaaS Backend built with NestJS, TypeScript, Prisma, and PostgreSQL.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **API Style**: REST
- **Validation**: DTO + class-validator
- **Documentation**: Swagger

## Architecture

### Multi-Tenancy

Every business entity includes `salonId` which is automatically set from the authenticated user's context (`req.user.currentSalonId`). Never accept `salonId` from request body/query for private APIs.

### Clean Architecture

- **Controller**: HTTP layer only
- **Service**: Business logic
- **Repository**: Prisma data access
- No business logic in controllers

### Response Format

All API responses follow a consistent structure:

```json
{
  "data": ...,
  "meta": {...}
}
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Seed the database (optional):
   ```bash
   npm run prisma:seed
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api`
Swagger documentation at `http://localhost:3000/api/docs`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Salons
- `POST /api/salons` - Create salon
- `GET /api/salons/my-salons` - Get user salons

### Settings
- `GET /api/settings` - Get salon settings
- `PATCH /api/settings` - Update salon settings
- `GET /api/public/salons/:slug/settings` - Get public salon settings

### Other Modules
All other modules (Users, Clients, Staff, Services, Appointments, Sales, Inventory, Reports, Public Booking, Client Portal) are implemented as skeletons and return stub responses.

## Database Schema

The Prisma schema includes all required models:
- User
- Salon
- SalonSettings
- SalonMember
- Client
- Staff
- Service
- Appointment
- Sale
- Product

All business tables include:
- `id` (UUID)
- `salonId` (UUID, foreign key)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - JWT token expiration (default: 7d)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Development

```bash
# Development
npm run start:dev

# Build
npm run build

# Production
npm run start:prod

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Security

- Role-based access control (RBAC)
- JWT authentication
- Encrypted integration settings
- No sensitive data in responses
- Input validation with DTOs

## License

Private - All rights reserved
