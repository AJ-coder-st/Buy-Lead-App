# Buyer Leads Backend

Node.js/Express backend API for the buyer leads management system.

## Features

- 🔐 JWT authentication with demo login
- 📊 RESTful API with full CRUD operations
- 🔍 Advanced filtering and pagination
- 📁 CSV import/export functionality
- 🔒 Role-based access control
- ⚡ Rate limiting for API protection
- 📈 Buyer history tracking
- 🔄 Optimistic concurrency control
- ✅ Input validation with Zod
- 🧪 Unit tests with Vitest

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Prisma ORM with PostgreSQL/SQLite
- **Authentication**: JWT with HTTP-only cookies
- **Validation**: Zod schemas
- **Testing**: Vitest
- **Security**: Helmet, CORS, Rate limiting

## API Endpoints

### Authentication
- `POST /auth/demo-login` - Demo user login
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Buyers
- `GET /buyers` - List buyers with pagination and filters
- `GET /buyers/:id` - Get single buyer
- `POST /buyers` - Create new buyer (rate limited)
- `PUT /buyers/:id` - Update buyer (rate limited)
- `DELETE /buyers/:id` - Delete buyer
- `GET /buyers/:id/history` - Get buyer change history

### Import/Export
- `POST /buyers/import-csv` - Import buyers from CSV file
- `GET /buyers/export.csv` - Export buyers to CSV

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   ```

3. **Database setup:**
   ```bash
   # Generate Prisma client
   pnpm prisma:generate
   
   # Run migrations
   pnpm prisma:migrate
   
   # Seed database
   pnpm prisma:seed
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm test:run` - Run tests once
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Fix linting issues
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:seed` - Seed database with demo data
- `pnpm prisma:studio` - Open Prisma Studio

## Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:password@localhost:5432/buyer_leads"  # PostgreSQL for production

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Optional Redis for rate limiting
REDIS_URL=""

# Server
PORT=3001
NODE_ENV=development
```

## Database Schema

### User
- `id` - UUID primary key
- `email` - Unique email address
- `name` - Optional display name
- `role` - User role ('user' | 'admin')
- `createdAt` - Creation timestamp

### Buyer
- `id` - UUID primary key
- `fullName` - Buyer's full name (2-80 chars)
- `email` - Optional email address
- `phone` - Phone number (10-15 digits)
- `city` - City enum (Chandigarh, Mohali, etc.)
- `propertyType` - Property type enum
- `bhk` - BHK enum (required for Apartment/Villa)
- `purpose` - Buy or Rent
- `budgetMin/Max` - Budget range
- `timeline` - Purchase timeline
- `source` - Lead source
- `status` - Current status
- `notes` - Optional notes (max 1000 chars)
- `tags` - JSON array of tags
- `ownerId` - Foreign key to User
- `updatedAt/createdAt` - Timestamps

### BuyerHistory
- `id` - UUID primary key
- `buyerId` - Foreign key to Buyer
- `changedBy` - User ID who made changes
- `changedAt` - Change timestamp
- `diff` - JSON object with field changes

## Validation Rules

- **Phone**: 10-15 digits (non-digits stripped)
- **Email**: Valid email format (optional)
- **BHK**: Required for Apartment and Villa property types
- **Budget**: budgetMax must be >= budgetMin if both provided
- **Notes**: Maximum 1000 characters
- **Tags**: Array of strings (trimmed)

## Security Features

- JWT authentication with HTTP-only cookies
- Rate limiting (10 requests/minute for create/update)
- Input validation on all endpoints
- Ownership checks for data access
- CORS and security headers
- SQL injection protection via Prisma

## CSV Import/Export

### Import Format
CSV must have exact headers:
```
fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status
```

- Maximum 200 rows per import
- Validation errors returned with row numbers
- Only valid rows are inserted (transaction)
- Tags can be JSON array or comma-separated string

### Export
- Respects current filters from list endpoint
- Returns CSV with same headers as import format

## Rate Limiting

- **General API**: 100 requests/minute per IP
- **Create/Update**: 10 requests/minute per user/IP
- Uses in-memory store (fallback to Redis if REDIS_URL set)
- Returns 429 status when limit exceeded

## Error Handling

- Validation errors: 400 with detailed field errors
- Authentication errors: 401 with clear messages
- Authorization errors: 403 with access denied
- Not found errors: 404 with resource not found
- Concurrency conflicts: 409 with stale data message
- Rate limit exceeded: 429 with retry information
- Server errors: 500 with generic message (details in dev mode)

## Testing

Run tests with:
```bash
pnpm test
```

Tests cover:
- Validation functions
- Budget validation logic
- CSV row validation
- Error handling scenarios

## Deployment

1. Set production environment variables
2. Use PostgreSQL for production database
3. Run migrations: `pnpm prisma migrate deploy`
4. Build application: `pnpm build`
5. Start server: `pnpm start`

## Development Notes

- Uses Prisma for type-safe database queries
- Optimistic concurrency with updatedAt timestamps
- History tracking for all buyer changes
- Shared validation schemas with frontend
- Comprehensive error handling and logging
