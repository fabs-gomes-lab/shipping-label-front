# shipping-label-front

React web interface for the USPS shipping label generation system. Consumes the Laravel API and allows authenticated users to create, list, and download their shipping labels.

## Overview

Single-page application offering login, paginated label listing, new label creation (with origin/destination addresses and package dimensions), and a detail view with label download. The authentication token is persisted in localStorage and automatically attached to every request.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript 5.7 |
| Bundler | Vite 6 |
| Routing | React Router 7 |
| HTTP | Axios 1.7 |
| Styles | CSS Modules (no UI framework) |
| Icons | Tabler Icons (CDN) |
| Package manager | npm |

## Prerequisites

- Node.js 18+
- npm 9+
- Laravel API running (see backend project)

## Installation and setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd shipping-label-front

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and adjust VITE_API_BASE_URL if needed

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Laravel API base URL | `http://localhost:8000/api` |

## Available scripts

```bash
npm run dev      # Development server with HMR
npm run build    # Production build (tsc + vite build)
npm run preview  # Preview the production build
```

## Project structure

```
src/
├── components/       # Reusable components
│   ├── Badge         # Status badge (success, danger, info, neutral)
│   ├── Button        # Button with primary/secondary/icon variants and loading state
│   ├── Card          # Thin-bordered card wrapper
│   ├── ErrorMessage  # Standardized error display
│   ├── Input         # Text field with label and error message
│   ├── Loading       # Loading spinner
│   └── Modal         # Generic modal with overlay and Esc-to-close
├── contexts/
│   └── AuthContext   # Global authentication state
├── hooks/
│   ├── useAuth            # AuthContext consumer
│   └── useShippingLabels  # Paginated label fetching
├── pages/
│   ├── Login         # Login page
│   ├── LabelsList    # Paginated listing with create modal
│   ├── CreateLabel   # Creation form (works as page or modal)
│   └── LabelDetails  # Label details with download
├── routes/
│   └── ProtectedRoute  # Redirects to /login if unauthenticated
├── services/
│   ├── http.ts           # Axios instance with auth and 401 interceptors
│   └── api/
│       ├── authService          # POST /auth/login
│       ├── shippingLabelService # GET/POST /shipping-labels
│       └── healthService        # GET /health-check
├── types/
│   ├── api.ts           # ApiError
│   ├── auth.ts          # LoginRequest, User, LoginResponse
│   └── shippingLabel.ts # ShippingLabel, AddressRequest/Response, Parcel, etc.
└── utils/
    └── usStates.ts      # All 50 US states + DC
```

## Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Authentication |
| `/` | — | Redirects to `/labels` |
| `/labels` | Protected | Paginated label listing |
| `/labels/new` | Protected | Creation form (also accessible via modal from the listing) |
| `/labels/:id` | Protected | Label details |

## Authentication

Login returns a Bearer token saved to `localStorage` (`auth_token`). The Axios interceptor automatically attaches it to the `Authorization` header on every request. On a `401` response, the token is cleared and the user is redirected to `/login`.

## API endpoints

```
POST  /api/auth/login
GET   /api/shipping-labels?page=N
GET   /api/shipping-labels/:id
POST  /api/shipping-labels
GET   /api/health-check
```

## Production build

```bash
npm run build
```

The output is generated in `dist/` and can be served by any static file server (Nginx, Apache, Vercel, etc.). Since this is a SPA, configure the server to redirect all routes to `index.html`.

Nginx example:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

## What I'd do next

Given the 4-hour scope, several improvements were intentionally left out. These are the natural next steps in order of priority:

### Forms and validation

- **Form library** (React Hook Form + Zod) to replace the manual validation. Would simplify the create-label form significantly, centralize validation rules and provide better integration with TypeScript types.
- **Field-level validation feedback** as the user types, instead of only on submit.
- **Address autocomplete** using a service like Google Places or USPS Address Verification API to reduce typos and failed labels.

### UX improvements

- **Toast notifications** for success and error feedback instead of inline messages only.
- **Optimistic UI** on label creation, showing the new label in the list immediately with a "processing" state, then reconciling with the server response.
- **Label preview** — embed the PDF or PNG inline on the details page instead of relying solely on the download button.
- **Address book** — save reusable addresses per user so they don't need to retype frequent senders and recipients.
- **Filters and search** on the labels list (by status, date range, tracking code, recipient name).
- **Pagination improvements** — page-size selector and jump-to-page input for larger label histories.

### Testing

- **Unit tests** for utility functions, formatters and validation helpers using Vitest.
- **Component tests** for forms and key interactions using React Testing Library.
- **End-to-end tests** with Playwright covering the login → create label → download flow.

### Accessibility and i18n

- **Accessibility audit** — proper ARIA labels, keyboard navigation, focus management on forms, and screen-reader testing.
- **Internationalization structure** (react-i18next) even if only English is supported now, to prepare for future locales.
- **High-contrast and dark mode** support.

### Architecture and DX

- **Error boundary** at the route level to catch unexpected React errors gracefully and report them to a monitoring tool.
- **API response caching** with React Query or SWR to reduce redundant requests and improve perceived performance.
- **Refresh token handling** when the backend supports it, with automatic retry on 401.
- **CI pipeline** with GitHub Actions running lint, type-check and tests on every PR.
- **Bundle analysis** and code splitting per route to keep the initial load light.

### Production readiness

- **Environment-specific builds** with proper handling of API base URL and feature flags.
- **Error monitoring** (Sentry or similar) to catch runtime errors in production.
- **Analytics** to understand usage patterns and prioritize the next iterations.

