# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Essential Commands
```powershell
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Running the Application
- Development server runs on `http://localhost:3001` (or `http://localhost:3000` if port 3001 is not set)
- Root path (`/`) redirects to `/homepage`

### Testing
- No test framework is currently configured in this project
- Manual testing should be done on the dev server

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth with custom backend integration
- **State Management**: React Context API (AuthContext)
- **UI Components**: Radix UI primitives via shadcn/ui
- **Icons**: Lucide React

### Project Structure
```
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── candidate/         # Candidate dashboard & features
│   ├── company/           # Company/recruiter dashboard
│   ├── interviewer/       # Interviewer dashboard
│   ├── api/               # API routes (Next.js server endpoints)
│   └── layout.tsx         # Root layout with AuthProvider
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── candidate/        # Candidate-specific components
│   ├── layout/           # Layout components
│   ├── resume/           # Resume builder components
│   └── ui/               # shadcn/ui components
├── contexts/             # React Context providers
│   └── auth-context.tsx  # Global authentication state
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API clients
│   ├── api/             # API endpoint definitions
│   ├── supabaseClient.ts # Supabase client initialization
│   ├── auth.ts          # Authentication utilities
│   └── utils.ts         # General utilities
├── types/               # TypeScript type definitions
└── middleware.ts        # Next.js middleware for auth routing
```

### Authentication Flow

**Multi-Role Authentication System**
- Three user roles: `candidate`, `recruiter` (maps to `/company`), `interviewer`
- Backend API runs at `NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:8000`)
- Frontend uses cookie-based JWT tokens (`access_token`, `refresh_token`)

**Authentication Methods:**
1. **Email/Password**: Direct login via backend API (`/auth/login`)
2. **OAuth**: Google/GitHub via Supabase Auth, handled in `/oauth-callback`

**Middleware Logic** (`middleware.ts`):
- Unauthenticated users → redirected to `/auth/candidate`
- Authenticated users accessing `/auth/*` → redirected to role-specific dashboard
- Protected routes: `/candidate`, `/company`, `/interviewer`
- Role is fetched from backend API (`/auth/user`) and stored in cookie

**Session Management**:
- Tokens stored in localStorage AND cookies
- User object cached in localStorage
- Periodic session validation (every 5 minutes)
- Automatic logout on token expiry (401 responses)

### Backend Integration

**API Structure:**
- All API calls go through `lib/api.ts` with centralized error handling
- `handleResponse()` function automatically handles 401 errors and triggers logout
- Backend base URL: `process.env.NEXT_PUBLIC_BACKEND_URL`

**Key Backend Endpoints:**
- `POST /auth/login` - Email/password authentication
- `GET /auth/user` - Validate token and get user data
- `GET /resume/*` - Resume management (currently commented out)
- Dashboard data fetched from `/api/candidate/dashboard` (Next.js API route)

**Database:**
- Uses Supabase (PostgreSQL) via `@supabase/supabase-js`
- Schema defined in `database_schema.sql` with tables for candidates, applications, interviews, etc.
- Most API routes currently use mock data (marked with TODO comments)

### Component Architecture

**shadcn/ui Integration:**
- Components are in `components/ui/` and can be added via CLI
- Configuration in `components.json`
- Uses CSS variables for theming (defined in `app/globals.css`)
- Tailwind config extends with custom colors and animations

**Key Components:**
- `CandidateDashboard` - Main candidate dashboard with 7 sections (applications, stats, interviews, etc.)
- `AuthProvider` - Wraps entire app, manages authentication state
- UI components follow Radix UI patterns with custom styling

**Styling Patterns:**
- Tailwind utility classes preferred over custom CSS
- Dark mode support via `darkMode: ["class"]` in Tailwind config
- Responsive design using Tailwind breakpoints (sm, md, lg)

## Important Implementation Notes

### Path Aliases
TypeScript paths are configured with `@/*` pointing to root:
```typescript
import { Component } from '@/components/Component'
import { utility } from '@/lib/utils'
import type { Type } from '@/types/type'
```

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Build Configuration Caveats
`next.config.mjs` has relaxed settings for development:
- ESLint errors ignored during builds
- TypeScript errors ignored during builds
- Image optimization disabled

These should be reviewed before production deployment.

### Authentication Implementation
When working with authenticated routes:
1. Always check for `access_token` in localStorage or cookies
2. Use the `handleResponse` helper from `lib/api.ts` for API calls
3. Session expiry is handled globally - no need for per-component logic
4. Middleware automatically redirects based on authentication state

### Role-Based Routing
- Backend returns role: `candidate`, `recruiter`, or `interviewer`
- Frontend routes:
  - `candidate` → `/candidate`
  - `recruiter` → `/company` (important mapping!)
  - `interviewer` → `/interviewer`

### Database Schema
When implementing real data fetching:
1. Use queries from `database_schema.sql` as reference
2. Replace mock data in `lib/mockDashboardData.ts`
3. Uncomment and implement Supabase queries in API routes
4. Use the `candidate_dashboard_stats` view for efficient stat queries

### Adding New Pages
1. Create route in `app/[role]/[page]/page.tsx`
2. Add to middleware matcher if authentication required
3. Follow existing patterns for loading states and error handling

### Component Development
When creating new shadcn/ui components:
```powershell
# Add a new component (requires shadcn CLI)
npx shadcn-ui@latest add [component-name]
```
Components are automatically added to `components/ui/` with proper configuration.

## Common Patterns

### Fetching Authenticated Data
```typescript
const accessToken = localStorage.getItem('access_token')
const response = await fetch(`${API_URL}/endpoint`, {
  headers: { 
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
const data = await handleResponse(response) // Auto-handles 401
```

### Using the Auth Context
```typescript
import { useAuth } from '@/contexts/auth-context'

const { user, isLoading, loginWithEmail, logout } = useAuth()
```

### Mock Data vs Real Data
Currently, most features use mock data from `lib/mockDashboardData.ts`. When implementing real data:
1. Set up database tables using `database_schema.sql`
2. Replace mock imports with API calls
3. Add proper loading and error states
4. Test authentication flow thoroughly
