# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint checks
```

### Authentication Testing
When implementing OAuth features, test the authentication flow by:
1. Ensuring the backend is running on `http://localhost:8080`
2. Setting up Google OAuth credentials in `.env.local`
3. Testing the login flow at `/auth` page

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.1.8 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS with Pretendard font
- **State Management**: Zustand
- **API Client**: Axios + React Query (TanStack Query)
- **Form Handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React + React Icons
- **PWA**: next-pwa for mobile app experience
- **Testing**: Jest + React Testing Library

### Project Structure
The codebase follows a feature-based architecture:

```
src/
├── app/              # Next.js App Router pages
├── features/         # Feature modules (domain logic)
│   └── [feature]/
│       ├── components/   # Feature-specific components
│       ├── hooks/        # Feature-specific hooks
│       ├── services/     # API service layer
│       ├── stores/       # Zustand stores
│       └── types/        # TypeScript types
├── shared/          # Shared modules
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Common hooks
│   ├── lib/         # External library configs
│   ├── services/    # Shared services
│   └── types/       # Common types
└── styles/         # Design tokens and animations
```

### Key Design Patterns

1. **Feature-Based Organization**: Each feature (auth, checkin, workspace) is self-contained with its own components, hooks, services, and types.

2. **Service Layer Pattern**: API calls are abstracted into service classes (e.g., `auth.service.ts`, `checkin.service.ts`) for better organization and reusability.

3. **Component Patterns**:
   - Functional components with TypeScript interfaces
   - Props interface defined for all components
   - Separation of presentational and container components

4. **State Management**: Zustand stores for global state, React Query for server state caching

5. **Form Handling**: React Hook Form with Zod schemas for validation

### Important Implementation Guidelines

1. **Authentication Flow**: Google OAuth implementation with callback handling at `/auth/callback`

2. **Real-time Features**: WebSocket integration for live updates (checkins, reactions)

3. **Mobile-First Design**: All components should be responsive with touch-friendly interactions

4. **Performance Considerations**:
   - Use dynamic imports for heavy components
   - Implement virtual scrolling for large lists
   - Optimize bundle size (target < 200KB initial)

5. **Accessibility**: 
   - Semantic HTML elements
   - ARIA labels for interactive elements
   - Keyboard navigation support
   - WCAG AA color contrast

### Domain-Specific Features

1. **Checkin System**:
   - Condition score: 1-10 slider with color coding (1-3: red, 4-6: yellow, 7-10: green)
   - Message: Text area for daily thoughts
   - Emoji reactions: ❤️ 👍 🔥 💪 🤗 ☕

2. **Team Feed**:
   - Card layout for checkins
   - Real-time updates via WebSocket
   - Non-checked-in members shown with opacity

3. **Workspace Management**:
   - Team creation and invitation system
   - Member management
   - Settings and permissions

### Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Testing Approach
- Unit tests with Jest and React Testing Library
- Component testing focuses on user interactions
- Service layer testing with mocked API responses
- Run tests with `npm test` (when implemented)