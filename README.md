# Buy Lead App

A production-ready full-stack TypeScript application for managing buyer leads with Next.js frontend and Node.js backend.

## 🚀 Live Demo

**Frontend**: https://frontend-cif9vfjni-bharath-wajs-projects-a57c3e59.vercel.app

## ✨ Features

- 🔐 Demo authentication with JWT
- 📊 Server-side rendered buyer list with pagination and filters
- 📝 Create and edit buyer leads with validation
- 📁 CSV import/export functionality
- 🔒 Role-based access control and ownership enforcement
- ⚡ Rate limiting for API endpoints
- 📱 Responsive and accessible UI
- 🔄 Optimistic concurrency control
- 📈 Buyer history tracking
- 🛠️ Enhanced error handling and debugging

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, React Hook Form, Zod
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL/SQLite
- **Authentication**: JWT with demo login
- **Validation**: Zod (shared between frontend and backend)
- **Testing**: Vitest
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)

## 📁 Project Structure

```
/
├─ frontend/                 # Next.js app router + UI
│  ├─ app/
│  │  ├─ api/              # Next.js API routes
│  │  │  ├─ auth/          # Authentication endpoints
│  │  │  └─ buyers/        # Buyer management endpoints
│  │  ├─ buyers/           # Buyer pages and components
│  │  └─ login/            # Login page
│  ├─ components/          # Reusable UI components
│  ├─ lib/                 # Utilities and API client
│  └─ package.json
├─ backend/                 # API server + Prisma migrations
│  ├─ src/
│  │  ├─ routes/           # Express routes
│  │  ├─ services/         # Business logic
│  │  ├─ validators/       # Zod schemas
│  │  └─ middleware/       # Auth, rate limiting
│  ├─ prisma/              # Database schema and migrations
│  └─ package.json
└─ README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL (or use SQLite for local development)

### Setup

1. **Clone and install dependencies:**
```bash
git clone https://github.com/AJ-coder-st/Buy-Lead-App.git
cd Buy-Lead-App
pnpm install
```

2. **Setup environment variables:**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

3. **Setup database:**
```bash
cd backend
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

4. **Start development servers:**
```bash
# From root directory
pnpm dev
```

Or start individually:
```bash
# Backend (port 3001)
cd backend && pnpm dev

# Frontend (port 3000)
cd frontend && pnpm dev
```

## 🔧 Recent Fixes & Improvements

### Vercel Deployment Issues Fixed

- ✅ **Replaced legacy API files** with proper Next.js route handlers under `app/api/`
- ✅ **Removed incorrect Vercel configuration** that was misrouting API requests
- ✅ **Fixed build configuration** by disabling `output: 'standalone'` to avoid Windows symlink issues
- ✅ **Enhanced error handling** with detailed error messages in production
- ✅ **Added comprehensive API routes** for all buyer operations

### API Routes Added

- `GET/POST /api/auth/demo-login` - Demo authentication
- `GET /api/auth/me` - User information
- `GET/POST /api/buyers` - List and create buyers
- `GET/PUT/DELETE /api/buyers/[id]` - Individual buyer operations
- `GET /api/buyers/[id]/history` - Buyer change history
- `POST /api/buyers/import-csv` - CSV import functionality
- `GET /api/buyers/export.csv` - CSV export functionality

### Error Handling Improvements

- ✅ **Enhanced Error Boundary** with detailed error messages and stack traces
- ✅ **API response validation** to catch malformed responses
- ✅ **Better error logging** for debugging production issues
- ✅ **Graceful fallbacks** for failed API calls

## 📊 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/buyer_leads"
# Or for SQLite: "file:./dev.db"
JWT_SECRET="your-jwt-secret-key"
REDIS_URL="" # Optional for rate limiting
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🎯 Usage

### Demo Login
1. Visit the live demo: https://frontend-cif9vfjni-bharath-wajs-projects-a57c3e59.vercel.app
2. Click "Sign in as Demo User" to access the application
3. Explore buyer management features

### CSV Import
1. Navigate to the Import page
2. Download the template CSV file
3. Fill in buyer data following the template format
4. Upload the CSV file for bulk import

### Buyer Management
- **View**: Browse all buyers with pagination and filters
- **Create**: Add new buyer leads with validation
- **Edit**: Update existing buyer information
- **Delete**: Remove buyer records
- **Export**: Download buyer data as CSV

## 🧪 Testing

Run tests with:
```bash
pnpm test
```

Tests include:
- Unit tests for validation functions
- API endpoint tests
- CSV import validation tests

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Render)
1. Set production environment variables
2. Run migrations: `pnpm prisma migrate deploy`
3. Build: `pnpm build`
4. Start: `pnpm start`

## 🔒 Security Features

- JWT-based authentication with HTTP-only cookies
- Rate limiting on create/update operations
- Input validation on all endpoints
- CORS and security headers configured
- Server-side enforcement of data ownership rules

## 📈 Performance

- Server-side rendering for SEO and performance
- Optimized database queries with Prisma
- Client-side caching and optimistic updates
- Responsive design for all screen sizes

## 🐛 Troubleshooting

### Common Issues

1. **"Something went wrong" error**: Check browser console for detailed error messages
2. **API errors**: Verify environment variables are set correctly
3. **Build failures**: Ensure all dependencies are installed with `pnpm install`

### Debug Mode

The error boundary now shows detailed error information in production, making it easier to identify and fix issues.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Vercel for seamless deployment
- Prisma for the amazing ORM
- Tailwind CSS for beautiful styling

---

**Live Demo**: https://frontend-cif9vfjni-bharath-wajs-projects-a57c3e59.vercel.app

**Repository**: https://github.com/AJ-coder-st/Buy-Lead-App