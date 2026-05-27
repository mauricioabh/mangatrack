# MangaTrack Setup Guide

> Documentación extendida: [AGENTS.md](./AGENTS.md), carpeta [docs/](./docs/), reglas en `.cursor/rules/`.

Complete setup guide for the MangaTrack application with authentication, email notifications, and premium features.

## 🚀 Quick Start

1. **Copy environment variables**

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your environment variables in `.env.local`**
   - Get Clerk keys from [clerk.com](https://clerk.com)
   - Get Stripe keys from [stripe.com](https://stripe.com)
   - Get Resend key from [resend.com](https://resend.com) for email
   - Set up a Neon PostgreSQL database at [neon.tech](https://neon.tech)

3. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:sync
   npm run db:cleanup-catalog
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables Required

### Database

- `DATABASE_URL` - Your Neon PostgreSQL connection string

### Clerk Authentication

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `CLERK_WEBHOOK_SECRET` - From Clerk webhooks (optional)

### Stripe Payments

- `STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhooks
- `STRIPE_PREMIUM_MONTHLY_PRICE_ID` - Create a product in Stripe
- `STRIPE_PREMIUM_YEARLY_PRICE_ID` - Create a product in Stripe

### Email Service (Resend)

- `RESEND_API_KEY` - From Resend dashboard

### App Configuration

- `NEXT_PUBLIC_APP_URL` - Your app URL (http://localhost:3000 for dev)
- `NODE_ENV` - Environment (development/production)

## ✅ Features Implemented

### 🔐 **Authentication & User Management**

- ✅ Clerk integration with Google OAuth and email/password
- ✅ User registration and login
- ✅ Protected routes with middleware
- ✅ User profile management with avatars
- ✅ Tier-based user system (Basic/Premium)
- ✅ Email notification preferences

### 🗄️ **Database & Data Management**

- ✅ Prisma ORM with PostgreSQL
- ✅ Neon schema for users, bookmarks, reading history, notifications
- ✅ Catalog (manga/chapters) from MangaDex API — not stored in PostgreSQL
- ✅ User tier system with limits
- ✅ Notification system with email preferences

### 🎨 **UI Components & Design**

- ✅ ShadCN UI components
- ✅ Responsive design for all screen sizes
- ✅ Dark/light theme support with system preference detection
- ✅ Modern, clean interface with smooth animations
- ✅ Toast notifications with Sonner
- ✅ Loading states and error handling

### 📱 **Core Pages & Features**

- ✅ Landing page with authentication
- ✅ Dashboard with user library and statistics
- ✅ Advanced search page with filters
- ✅ Manga detail page with chapters
- ✅ Manga reader with vertical/horizontal modes
- ✅ Settings page with profile and preferences management
- ✅ Notification dropdown in header

### 🔌 **API Routes & Backend**

- ✅ User profile management endpoints
- ✅ Manga search with advanced filtering
- ✅ Reading history tracking
- ✅ Stripe payment integration
- ✅ Webhook handlers for Clerk and Stripe
- ✅ Email notification system
- ✅ Development testing endpoints

### 📧 **Email System**

- ✅ Resend integration for email delivery
- ✅ HTML and plain text email templates
- ✅ New chapter notification emails
- ✅ Manga update notification emails
- ✅ System notification emails
- ✅ User email preference management
- ✅ Email testing and simulation tools

### 🛡️ **Security & Validation**

- ✅ Input validation with Zod schemas
- ✅ Secure API endpoints with authentication
- ✅ Clerk security features
- ✅ Data sanitization and type safety

### 🛠️ **Development Tools**

- ✅ Dev Tools dropdown in header
- ✅ Email notification simulation
- ✅ Browser notification testing

### 💳 **Premium Features**

- ✅ Stripe payment processing
- ✅ Premium subscription management
- ✅ Customer portal for subscription management
- ✅ Tier-based feature access
- ✅ Automatic tier upgrades

## 🎯 Next Steps

### To Complete the Project:

1. **Set up external services**
   - Configure webhooks in Clerk and Stripe dashboards
   - Set up domain in Clerk settings
   - Configure email templates in Resend
   - Set up monitoring alerts in Sentry

2. **Add sample data**
   - Use the database seeding script
   - Test with mock data system
   - Verify all features work correctly

3. **Deploy to production**
   - Deploy to Vercel with environment variables
   - Configure production webhooks
   - Set up monitoring and alerts

### For Production:

1. **Security Configuration**
   - Review input validation schemas
   - Configure authentication settings
   - Set up secure API endpoints

2. **Performance Optimization**
   - Enable caching for better performance
   - Optimize database queries
   - Set up CDN for static assets

3. **Monitoring & Analytics**
   - Set up error handling and logging
   - Monitor application performance
   - Track user interactions

## 🗄️ Database Schema

The app includes these main models:

- **User** - User accounts with tier-based limits and email preferences
- **Manga** - Manga series information with metadata
- **Chapter** - Individual chapters with pages and reading status
- **UserManga** - User's bookmarked manga with reading progress
- **ReadingHistory** - Detailed reading progress tracking
- **Notification** - In-app and email notifications
- **NotificationType** - Enum for different notification types

## 📡 API Endpoints

### Public Endpoints

- `GET /api/manga/search` - Search manga with filters

### Authenticated Endpoints

- `GET /api/user/profile` - Get user profile
- `PATCH /api/user/profile` - Update user profile
- `PATCH /api/user/preferences` - Update user preferences
- `DELETE /api/user/delete` - Delete user account
- `GET /api/manga/bookmarks` - Get user's bookmarked manga
- `POST /api/manga/bookmark` - Bookmark a manga
- `DELETE /api/manga/bookmark` - Remove manga bookmark
- `GET /api/chapters/[chapterId]` - Get chapter details
- `POST /api/reading-history` - Mark chapter as read
- `GET /api/reading-history` - Get user's reading history
- `POST /api/stripe/create-checkout` - Create payment session
- `POST /api/stripe/create-portal` - Create customer portal

### Development Endpoints

- `POST /api/test-email` - Send test email
- `POST /api/simulate-email-notification` - Simulate email notifications

### Webhook Endpoints

- `POST /api/webhooks/clerk` - Clerk user sync
- `POST /api/webhooks/stripe` - Stripe payment events

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:generate       # Generate Prisma client
npm run db:sync           # Push schema to Neon (.env.local)
npm run db:cleanup-catalog # Drop legacy mangas/chapters tables if any
npm run db:studio         # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
```

## 🎭 Development Features

The app includes development utilities:

- **Email Testing**: Test email notifications with various scenarios
- **Browser Notifications**: Test native browser notifications
- **Development Tools**: Built-in utilities in header dropdown

## 🔧 Development Tools

### Dev Tools Dropdown

Access development utilities from the header:

- **Email Simulation**: Test different types of email notifications
- **Browser Notifications**: Test native browser notifications

### Testing Features

- **Email Testing**: Simulate email notifications
- **Notification Testing**: Test browser notifications

## 🚨 Important Notes

1. **Environment Variables**: All sensitive keys must be set in `.env.local`
2. **Database**: Use Neon for PostgreSQL hosting
3. **Security**: Input validation and authentication provide protection
4. **Email**: Resend handles all email delivery
5. **Production**: Development tools are automatically disabled in production

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection**
   - Verify `DATABASE_URL` is correct
   - Check Neon database is running
   - Run `npm run db:push` to sync schema

2. **Authentication Issues**
   - Verify Clerk keys are correct
   - Check webhook configuration
   - Ensure redirect URLs are set

3. **Email Not Working**
   - Verify `RESEND_API_KEY` is correct
   - Check Resend dashboard for delivery status
   - Use email testing tools in Dev Tools

4. **Development Tools Not Working**
   - Check if you're in development mode
   - Verify environment variables are set
   - Check browser console for errors

## 🎉 Success!

Once everything is set up, you should have:

- ✅ A fully functional manga tracking app
- ✅ User authentication with Clerk
- ✅ Email notifications with Resend
- ✅ Payment processing with Stripe
- ✅ Development tools for testing
- ✅ Input validation and security

The MangaTrack project is now ready for development and production! 🚀
