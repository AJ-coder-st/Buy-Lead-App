# Buyer Leads Frontend

Next.js frontend application for the buyer leads management system.

## Features

- 🔐 Demo authentication with JWT
- 📊 Server-side rendered buyers list with real-time filtering
- 📝 Create and edit buyer forms with comprehensive validation
- 📁 CSV import with error handling and preview
- 📱 Responsive design with Tailwind CSS
- ♿ Accessibility-first components and navigation
- 🎨 Modern UI with shadcn/ui components
- 🔄 Optimistic updates and error handling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **UI Components**: Custom components based on shadcn/ui
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Testing**: Vitest + Testing Library

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── buyers/            # Buyer management pages
│   │   ├── [id]/         # Dynamic buyer detail/edit pages
│   │   ├── new/          # Create buyer page
│   │   ├── import/       # CSV import page
│   │   └── page.tsx      # Buyers list page
│   ├── login/            # Authentication pages
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/           # Reusable UI components
│   └── ui/              # Base UI components
├── lib/                 # Utility functions and configurations
│   ├── api.ts           # API client and types
│   ├── utils.ts         # Helper functions
│   └── validators.ts    # Zod schemas and validation
└── styles/              # Additional styles
```

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code
- `pnpm test` - Run tests
- `pnpm test:run` - Run tests once
- `pnpm type-check` - Run TypeScript checks

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Pages & Features

### Authentication (`/login`)
- Demo login with JWT authentication
- Magic link authentication (configured but disabled)
- Automatic redirect to buyers list on success

### Buyers List (`/buyers`)
- Server-side rendered list with pagination (10 items per page)
- Real-time search with debouncing (500ms)
- Advanced filtering by city, property type, status, timeline
- URL-synced filters and pagination
- Sortable columns (updated date, created date)
- Responsive table with mobile-friendly design
- Empty states and loading indicators

### Create Buyer (`/buyers/new`)
- Comprehensive form with validation
- Conditional BHK field (required for Apartment/Villa)
- Budget range validation (max >= min)
- Tag management with add/remove functionality
- Real-time form validation with error messages
- Accessible form controls with ARIA labels

### Buyer Details (`/buyers/[id]`)
- Complete buyer information display
- Contact details with formatted phone numbers
- Property requirements and budget information
- Status badges and tags display
- Change history with diff visualization
- Edit and delete actions

### Edit Buyer (`/buyers/[id]/edit`)
- Pre-populated form with existing data
- Optimistic concurrency control with updatedAt
- Stale data detection and user notification
- Same validation rules as create form

### CSV Import (`/buyers/import`)
- File upload with validation (CSV only, max 5MB, 200 rows)
- Template download with sample data
- File preview before import
- Row-by-row validation with error reporting
- Bulk import with transaction safety
- Import results with success/error breakdown

## Components

### UI Components (`/components/ui/`)
- **Button**: Multiple variants and sizes
- **Input**: Styled input with focus states
- **Select**: Custom select dropdown
- **Label**: Accessible form labels
- **Card**: Container component with header/content
- **Badge**: Status and tag indicators
- **Textarea**: Multi-line text input

### Utility Components
- **LoadingSpinner**: Configurable loading indicator
- **ErrorBoundary**: Error handling with fallback UI

### Form Components
- **BuyerForm**: Comprehensive buyer creation/editing form
- **BuyersFilters**: Advanced filtering interface
- **BuyersList**: Paginated table with actions

## Validation

All forms use Zod schemas for validation:

- **Client-side**: Real-time validation with React Hook Form
- **Server-side**: API validation with error handling
- **Shared schemas**: Consistent validation between frontend/backend

### Validation Rules
- Full name: 2-80 characters
- Phone: 10-15 digits (auto-formatted)
- Email: Valid email format (optional)
- BHK: Required for Apartment/Villa property types
- Budget: Max must be >= Min if both provided
- Notes: Maximum 1000 characters

## Accessibility Features

- Semantic HTML structure
- ARIA labels and descriptions
- Focus management and keyboard navigation
- Screen reader announcements for form errors
- High contrast colors and readable typography
- Responsive design for all screen sizes

## State Management

- **URL State**: Filters and pagination synced with URL
- **Form State**: React Hook Form for complex forms
- **API State**: Axios with error handling and loading states
- **Local State**: React useState for component-specific state

## Error Handling

- **API Errors**: Centralized error handling with toast notifications
- **Form Errors**: Field-level validation with accessible error messages
- **Network Errors**: Retry mechanisms and user feedback
- **Boundary Errors**: React Error Boundary for unexpected errors

## Performance Optimizations

- **Server-side Rendering**: Initial page load with data
- **Debounced Search**: Reduced API calls during typing
- **Optimistic Updates**: Immediate UI feedback
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js automatic optimization

## Testing

Run tests with:
```bash
pnpm test
```

Tests include:
- Utility function tests
- Component unit tests
- Form validation tests
- API integration tests

## Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start production server:
   ```bash
   pnpm start
   ```

3. Or deploy to Vercel/Netlify with automatic builds

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

- Uses Next.js App Router for file-based routing
- Tailwind CSS for utility-first styling
- TypeScript for type safety
- ESLint and Prettier for code quality
- Responsive design with mobile-first approach
