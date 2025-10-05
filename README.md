# Bahrul Ulum - Frontend

Next.js frontend application for the Bahrul Ulum Course Enrollment Management System.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Go API (bahrululum)

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running on `http://localhost:8080` (see `../bahrululum`)

### Installation

```bash
npm install
```

### Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Features

- **Authentication**: Login and registration with JWT tokens
- **Dashboard**: View user profile and available courses
- **Role-based Access**: Support for user, mentor, and admin roles
- **Responsive Design**: Mobile-friendly interface with dark mode support

## Pages

- `/` - Home page with login/register links
- `/login` - User login (requires 12-character NIP)
- `/register` - User registration
- `/dashboard` - User dashboard (protected, shows profile and courses)

## API Integration

The frontend connects to the Go backend API:

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `GET /api/courses` - Fetch available courses

API client is located in `lib/api.ts`.

## Authentication

- Uses JWT tokens stored in localStorage
- Access token and refresh token management
- Automatic redirect to login for protected routes

## Development Notes

- TypeScript path alias `@/*` points to the root directory
- All client components use `'use client'` directive
- Forms include proper validation and error handling
