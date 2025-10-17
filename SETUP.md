# MangaTrack Setup Guide

Complete setup guide for the MangaTrack application with all features and integrations.

## 🚀 Quick Start

1. **Copy environment variables**

   ```bash
   cp env.template .env.local
   ```

2. **Fill in your environment variables in `.env.local`**
   - Get Clerk keys from [clerk.com](https://clerk.com)
   - Get Stripe keys from [stripe.com](https://stripe.com)
   - Get Arcjet key from [arcjet.com](https://arcjet.com) for security
   - Get Resend key from [resend.com](https://resend.com) for email
   - Get Sentry DSN from [sentry.io](https://sentry.io) for monitoring
   - Set up a Neon PostgreSQL database at [neon.tech](https://neon.tech)

3. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
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

### Security (Arcjet)

- `ARCJET_KEY` - From Arcjet dashboard

### Error Monitoring (Sentry)

- `SENTRY_DSN` - From Sentry project settings

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
- ✅ Complete schema for users, manga, chapters, bookmarks, reading history
- ✅ User tier system with limits
- ✅ Notification system with email preferences
- ✅ Database seeding with sample data
- ✅ Mock data system for development

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

### 🛡️ **Security & Monitoring**

- ✅ Arcjet protection with rate limiting
- ✅ Bot detection and DDoS protection
- ✅ Sentry error monitoring and performance tracking
- ✅ Input validation with Zod schemas
- ✅ Secure API endpoints with authentication

### 🛠️ **Development Tools**

- ✅ Dev Tools dropdown in header
- ✅ Mock data toggle for development
- ✅ Sentry error testing tools
- ✅ Email notification simulation
- ✅ Browser notification testing
- ✅ Data source switching (mock vs real)

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
   - Review Arcjet protection settings
   - Configure rate limiting thresholds
   - Set up security monitoring

2. **Performance Optimization**
   - Enable caching for better performance
   - Optimize database queries
   - Set up CDN for static assets

3. **Monitoring & Analytics**
   - Configure Sentry alerts
   - Set up performance monitoring
   - Monitor Arcjet security events

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
- `POST /api/test-sentry-error` - Test Sentry error reporting

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
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
```

## 🎭 Mock Data System

The app includes a comprehensive mock data system for development:

- **MSW Integration**: Mock Service Worker intercepts API calls
- **Realistic Data**: 6 popular manga with complete metadata
- **User Data**: Sample user with bookmarks and reading history
- **Easy Switching**: Toggle between mock and real data
- **Development Tools**: Built-in toggle in header

See [MOCK_DATA_GUIDE.md](MOCK_DATA_GUIDE.md) for detailed usage.

## 🔧 Development Tools

### Dev Tools Dropdown

Access comprehensive development utilities from the header:

- **Data Source Toggle**: Switch between mock and real data
- **Sentry Testing**: Test client, server, and API errors
- **Email Simulation**: Test different types of email notifications
- **Browser Notifications**: Test native browser notifications

### Testing Features

- **Error Testing**: Built-in Sentry error testing tools
- **Email Testing**: Simulate email notifications
- **Notification Testing**: Test browser notifications
- **Data Switching**: Easy toggle between mock and real data

## 🚨 Important Notes

1. **Environment Variables**: All sensitive keys must be set in `.env.local`
2. **Database**: Use Neon for PostgreSQL hosting
3. **Security**: Arcjet provides comprehensive protection
4. **Monitoring**: Sentry tracks errors and performance
5. **Email**: Resend handles all email delivery
6. **Production**: Mock data is automatically disabled in production

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

4. **Sentry Not Working**
   - Verify `SENTRY_DSN` is correct
   - Check Sentry project configuration
   - Use Sentry testing tools in Dev Tools

5. **Mock Data Issues**
   - Check console for MSW status
   - Use Dev Tools toggle to switch data sources
   - Verify `NEXT_PUBLIC_USE_MOCK` environment variable

## 🎉 Success!

Once everything is set up, you should have:

- ✅ A fully functional manga tracking app
- ✅ User authentication with Clerk
- ✅ Email notifications with Resend
- ✅ Error monitoring with Sentry
- ✅ Security protection with Arcjet
- ✅ Payment processing with Stripe
- ✅ Comprehensive development tools
- ✅ Mock data system for development

The MangaTrack project is now ready for development and production! 🚀
