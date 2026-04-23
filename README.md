# JobPortal Frontend

React + Vite frontend for the [JobPortal](https://jobportal.space/api/docs/) REST API.

## Tech Stack

- **React 19** + **Vite 8**
- **React Router v7** – client-side routing
- **Axios** – HTTP client with JWT interceptor & auto-refresh
- **Tailwind CSS v4** – utility-first styling

## Features

| Area | Details |
|---|---|
| Auth | Register, Login (JWT), auto-refresh on 401 |
| Jobs | Browse, search & filter by keyword / location / type |
| Job Detail | Full description, apply modal |
| Applications | Dashboard with status tracking, withdraw action |
| Employer | Post, edit, delete listings; view incoming applications |

## Getting Started

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env

# Start dev server
npm run dev
```

Open http://localhost:5173

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://jobportal.space/api` | Base URL for the backend API |

## Project Structure

```
src/
├── api/             # Axios client + endpoint helpers
│   ├── client.js    # Axios instance, JWT interceptor, refresh logic
│   ├── auth.js      # register, login, me
│   ├── jobs.js      # CRUD for jobs
│   └── applications.js
├── context/
│   └── AuthContext.jsx  # Auth state, login/register/logout
├── components/
│   ├── Navbar.jsx
│   ├── JobCard.jsx
│   ├── ApplyModal.jsx
│   └── ProtectedRoute.jsx
└── pages/
    ├── HomePage.jsx
    ├── LoginPage.jsx
    ├── RegisterPage.jsx
    ├── JobsPage.jsx
    ├── JobDetailPage.jsx
    ├── DashboardPage.jsx      # Job seeker – my applications
    ├── EmployerJobsPage.jsx   # Employer – manage listings & view applicants
    └── JobFormPage.jsx        # Create / edit a job listing
```

## Auth Flow

1. `POST /api/auth/register/` – creates account
2. `POST /api/auth/login/` – returns `{ access, refresh }` JWTs
3. Access token is attached via `Authorization: Bearer <token>` header
4. On 401, the client automatically uses the refresh token to get a new access token
