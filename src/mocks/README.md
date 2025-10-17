# Mock Service Worker (MSW) Setup

This directory contains the Mock Service Worker setup for MangaTrack, which provides mock data for development and testing.

## Files

- `handlers.ts` - Contains all the mock API handlers and data
- `browser.ts` - Browser-specific MSW setup
- `server.ts` - Node.js server-specific MSW setup

## Mock Data

The mock data includes:

### Manga Data

- 6 popular manga series (One Piece, Attack on Titan, Demon Slayer, etc.)
- Complete chapter information
- Cover images from Unsplash
- Genres, status, and descriptions

### User Data

- Sample user profile with avatar
- Bookmark data
- Reading history
- Notifications

## API Endpoints

The following endpoints are mocked:

- `GET /api/manga/search` - Search manga with filters
- `GET /api/manga/:slug` - Get manga details by slug
- `GET /api/manga/bookmarks` - Get user bookmarks
- `POST /api/manga/bookmark` - Add bookmark
- `DELETE /api/manga/bookmark` - Remove bookmark
- `GET /api/reading-history` - Get reading history
- `POST /api/reading-history` - Add reading history
- `GET /api/user/profile` - Get user profile
- `GET /api/notifications` - Get notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read

## Usage

MSW is automatically initialized in development mode through the `MSWProvider` component in the root layout. The mock data will be available immediately when you start the development server.

## Development

To add new mock data or endpoints:

1. Update the mock data arrays in `handlers.ts`
2. Add new handlers for additional endpoints
3. The changes will be reflected immediately in the browser

## Production

MSW is only active in development mode. In production, the app will use real API endpoints.



