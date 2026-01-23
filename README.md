# Festival Timeline Management App

A collaborative web and mobile application for managing festival events with visual timeline organization by category.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3+-orange.svg)](https://bun.sh/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020.svg)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

## Live Demo

- **Frontend**: https://borisnikolic.github.io/timeline-app
- **Backend API**: https://festival-timeline-api.onrender.com

## Quick Start

```bash
# 1. Install Bun
brew install oven-sh/bun/bun

# 2. Setup PostgreSQL
brew install postgresql@16
brew services start postgresql@16
createdb festival_timeline

# 3. Backend setup
cd backend
bun install
cp .env.example .env
bun run db:migrate
bun run db:seed
bun run dev  # Runs on http://localhost:3000

# 4. Frontend setup (new terminal)
cd frontend
bun install
cp .env.example .env
bun run dev  # Runs on http://localhost:5173

# 5. Access the app
# URL: http://localhost:5173/auth
# Login: admin@festival.app / admin123
```

## Features

### Core Features
- **Visual Timeline** - Events organized in horizontal category lanes with drag support
- **Multi-Timeline Support** - Create and manage multiple festival timelines
- **Team Collaboration** - Invite users via email to collaborate on timelines
- **Role-Based Access** - Admin, Editor, and Viewer roles with permission enforcement
- **Status Tracking** - Progress tracking with statuses (Not Started, In Progress, Completed) and priorities (High, Medium, Low)
- **Data Export** - CSV and Excel export with complete event data
- **Mobile Responsive** - Works on devices 375px+ width
- **Virtual Scrolling** - Handles 200+ events smoothly

### Email Invitations (New!)
- **Invite via Email** - Send invitation links to any email address
- **New User Registration** - Invitees can create accounts directly from invitation link
- **Existing User Support** - Existing users are prompted to log in
- **Role Assignment** - Assign Admin, Editor, or Viewer roles when inviting
- **Invitation Management** - Resend or cancel pending invitations
- **Secure Tokens** - 256-bit entropy tokens with bcrypt hashing

### Mobile App (Pyramid Festival)
- **Festival Schedule** - Browse events by day with stage filtering
- **My Events** - Save favorite events and track your personal schedule
- **Push Notifications** - Get reminders before events start
- **Offline Support** - View cached schedule without internet
- **iOS & Android** - Native apps via Expo

### UX Enhancements
- **Quick Status Toggle** - Click status badge to update in 1 click
- **Visual Priority Indicators** - Color-coded borders (red=high, yellow=medium, gray=low)
- **Event Duplication** - Copy events with pre-filled form
- **Keyboard Shortcuts** - N (new event), / (search), E (export), ESC (close)
- **Quick Date Presets** - Today, Tomorrow, Next Week, Next Month buttons
- **Status Dashboard** - Real-time event count aggregation
- **Text Search** - Filter events by title/description with debouncing
- **Bulk Status Updates** - Multi-select and batch update events

## Documentation

- **[PROJECT.md](PROJECT.md)** - Comprehensive project documentation (features, architecture, database schema, implementation status)
- **[CLAUDE.md](CLAUDE.md)** - Development guide for Claude Code instances
- **[.specify/memory/constitution.md](.specify/memory/constitution.md)** - Project principles and quality standards

## Tech Stack

**Frontend**: React 18, TypeScript, Vite, TailwindCSS, Zustand, React Query, react-window

**Mobile**: React Native 0.81, Expo 54, React Navigation, React Query, Expo Notifications

**Backend**: Bun 1.3+, Express, TypeScript, PostgreSQL 16, Passport.js, JWT, bcrypt, Nodemailer

**Testing**: Vitest, Playwright, React Testing Library, Supertest

**Deployment**: GitHub Pages (frontend), Render (backend API + PostgreSQL), Expo (mobile builds)

## Project Structure

```
timeline_app/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── api/      # Route handlers (events, categories, invitations, etc.)
│   │   ├── services/ # Business logic (EmailService, InvitationService, etc.)
│   │   ├── db/       # Database migrations and queries
│   │   └── middleware/
│   └── .env.example
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── .env.example
├── ReactNative/       # Expo mobile app (Pyramid Festival)
│   ├── src/
│   │   ├── screens/  # ScheduleScreen, MyEventsScreen, SettingsScreen
│   │   ├── components/ # EventCard, DayPicker, StageFilter
│   │   ├── hooks/    # useEvents, useReminders
│   │   ├── services/ # API client, notifications
│   │   └── theme/    # Colors, typography
│   └── app.json      # Expo config
├── specs/             # Feature specifications
├── CLAUDE.md         # Development guide
├── PROJECT.md        # Full documentation
└── README.md         # This file
```

## Development Commands

**Backend**:
```bash
bun run dev           # Start development server (hot reload with bun --watch)
bun run test          # Run tests
bun run db:migrate    # Run database migrations
bun run db:seed       # Seed initial data
bun run lint          # Check code quality
```

**Frontend**:
```bash
bun run dev           # Start Vite dev server (HMR enabled)
bun run test          # Run component tests
bun run test:e2e      # Run E2E tests
bun run build         # Production build
bun run lint          # Check code quality
```

**React Native** (Pyramid Festival App):
```bash
cd ReactNative
npm install           # Install dependencies
npx expo start        # Start Expo dev server
npx expo start --ios  # Start with iOS simulator
npx expo start --android  # Start with Android emulator
```

## Running Mobile App on Device

### Prerequisites
1. Install [Expo Go](https://expo.dev/client) on your iOS or Android device
2. Ensure your phone and computer are on the same WiFi network

### Steps

```bash
# 1. Navigate to React Native folder
cd ReactNative

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npx expo start
```

### Connecting Your Device

**Option 1: QR Code (Recommended)**
- After running `npx expo start`, a QR code appears in the terminal
- **iOS**: Open the Camera app and scan the QR code
- **Android**: Open Expo Go app and scan the QR code

**Option 2: Manual URL**
- In the Expo dev server terminal, press `?` to see options
- Copy the `exp://` URL shown
- Open Expo Go and enter the URL manually

### Development Options
- Press `j` to open debugger
- Press `r` to reload the app
- Press `m` to toggle menu
- Shake device to open developer menu

### Building for Production
```bash
# Build for iOS (requires Apple Developer account)
npx eas build --platform ios

# Build for Android
npx eas build --platform android

# Build APK for direct installation
npx eas build --platform android --profile preview
```

## Environment Variables

**Backend (.env)**:
```env
# Database
DATABASE_URL=postgresql://localhost/festival_timeline

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

# Server
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Email (SMTP) - Required for invitation emails
# Gmail: Use App Password (https://myaccount.google.com/apppasswords)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Frontend URL for invitation links
# Development: http://localhost:5173
# Production: https://borisnikolic.github.io/timeline-app
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env)**:
```env
VITE_API_URL=http://localhost:3000
```

## Deployment

### Frontend (GitHub Pages)
The frontend is deployed to GitHub Pages at https://borisnikolic.github.io/timeline-app

```bash
cd frontend
bun run build
# Deploy dist/ folder to gh-pages branch
```

### Backend (Render)
The backend API is deployed to Render at https://festival-timeline-api.onrender.com

Environment variables to configure on Render:
- `DATABASE_URL` - PostgreSQL connection string (provided by Render PostgreSQL)
- `JWT_SECRET` - Secure secret for JWT tokens
- `CORS_ORIGIN` - Frontend URL (https://borisnikolic.github.io)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - Email configuration
- `FRONTEND_URL` - https://borisnikolic.github.io/timeline-app

## Implementation Status

### Core Features
- **Phase 1-3**: Setup and Foundation (34/34 tasks)
- **User Story 1**: Quick Event Creation (18/18 tasks)
- **User Story 2**: Category Organization (15/15 tasks)
- **User Story 3**: Team Assignment (6/6 tasks)
- **User Story 4**: Status & Priority Tracking (10/10 tasks)
- **User Story 5**: Event Editing & Deletion (10/10 tasks)
- **User Story 6**: Event List View with Sorting (17/17 tasks)
- **User Story 7**: Data Export (11/11 tasks)
- **Phase 10**: Authentication (14/14 tasks)

### Feature 001: Multi-Timeline Support
- Timeline CRUD operations
- Timeline membership and roles
- Dashboard with timeline listing

### Feature 002: Email Timeline Invites (New!)
- Email invitation system with secure tokens
- New user registration via invitation
- Existing user invitation flow
- Invitation management (resend, cancel)
- Role assignment on invite

**Total**: Production ready

## Testing

```bash
# Backend tests
cd backend && bun run test

# Frontend tests
cd frontend && bun run test

# E2E tests (requires both servers running)
cd frontend && bun run test:e2e
```

## Troubleshooting

**Database connection fails**:
- Ensure PostgreSQL is running: `brew services list`
- Verify DATABASE_URL in backend/.env

**Port conflicts**:
- Kill process on port 3000: `lsof -ti :3000 | xargs kill -9`
- Or change PORT in backend/.env

**Authentication errors**:
- Ensure JWT_SECRET is set in backend/.env
- Check CORS_ORIGIN matches frontend URL

**Email not sending**:
- Verify SMTP credentials in backend/.env
- For Gmail, use App Password (not regular password)
- Check SMTP_HOST is correct (smtp.gmail.com for Gmail)

See [CLAUDE.md](CLAUDE.md) for detailed troubleshooting guide.

## Contributing

1. Follow TypeScript strict mode conventions
2. Use parameterized SQL queries for security
3. Write tests for new features
4. Ensure mobile responsiveness (375px+)
5. Run `bun run lint` before committing

## License

MIT

## Support

For development guidance, see:
- [CLAUDE.md](CLAUDE.md) - Development workflows and architecture
- [PROJECT.md](PROJECT.md) - Complete project documentation
- [.specify/memory/constitution.md](.specify/memory/constitution.md) - Quality standards

---

**Version**: 1.2.0 | **Status**: Production Ready | **Last Updated**: 2026-01-23
