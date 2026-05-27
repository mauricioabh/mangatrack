# MangaTrack

A comprehensive manga tracking and reading application built with Next.js, featuring authentication, email notifications, and premium features.

## ✨ Features

### 🔐 **Authentication & User Management**

- **Clerk Integration**: Secure login with Google OAuth and email/password
- **User Profiles**: Customizable profiles with avatars and preferences
- **Tier System**: Basic and Premium user tiers with different limits
- **Email Notifications**: User preference management for email notifications

### 📚 **Manga Management**

- **Manga Library**: Save and organize your favorite manga series
- **Advanced Search**: Real-time search with filtering by genre, status, and more
- **Bookmarking**: Save manga with tier-based limits (Basic: 50, Premium: unlimited)
- **Reading History**: Track your reading progress across all manga

### 📖 **Reading Experience**

- **Manga Reader**: Smooth reading experience with vertical and horizontal modes
- **Chapter Navigation**: Easy navigation between chapters
- **Auto-mark as Read**: Automatically mark chapters as read
- **Reading Progress**: Visual progress indicators

### 🔔 **Notification System**

- **Email Notifications**: Resend-powered email notifications for new chapters
- **Browser Notifications**: Native browser notifications with permission management
- **In-app Notifications**: Real-time notification dropdown in header
- **Notification Types**: New chapters, manga updates, and system notifications

### 🛡️ **Security & Validation**

- **Input Validation**: Zod-powered validation for all user inputs
- **Secure API**: Protected endpoints with proper authentication
- **Clerk Security**: Built-in security features from Clerk authentication

### 💳 **Premium Features**

- **Stripe Integration**: Secure payment processing for premium subscriptions
- **Tier Management**: Automatic tier upgrades and feature unlocking
- **Customer Portal**: Self-service subscription management

### 🎨 **User Experience**

- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark/Light Mode**: Toggle between themes with system preference detection
- **Modern UI**: Built with ShadCN UI and Tailwind CSS
- **Smooth Animations**: Framer Motion for delightful interactions

### 🛠️ **Development Tools**

- **Dev Tools Dropdown**: Development utilities in header
- **Email Simulation**: Test email notifications with various scenarios
- **Browser Notification Testing**: Test native browser notifications

## 🏗️ Tech Stack

### **Frontend**

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN UI**: Modern component library
- **Framer Motion**: Smooth animations and transitions

### **Backend & Database**

- **Next.js API Routes**: Serverless API endpoints
- **Prisma ORM**: Type-safe database access
- **PostgreSQL**: Robust relational database (Neon)
- **Zod**: Runtime type validation

### **Authentication & Security**

- **Clerk**: Authentication and user management
- **Zod**: Runtime type validation and input sanitization

### **External Services**

- **Resend**: Email delivery service
- **Stripe**: Payment processing
- **Neon**: PostgreSQL database hosting

### **Development Tools**

- **MSW**: Mock Service Worker for development
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 📚 Project docs

- [AGENTS.md](./AGENTS.md) — guía para agentes AI
- [docs/](./docs/) — PRD, fases, ENV, modelo de datos, flujo OpenSpec

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account
- Stripe account (for payments)
- Resend account (for email notifications)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mangatrack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables in `.env.local`:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/mangatrack"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

   # Stripe Payments
   STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   STRIPE_PREMIUM_MONTHLY_PRICE_ID="price_..."
   STRIPE_PREMIUM_YEARLY_PRICE_ID="price_..."

   # Email Service (Resend)
   RESEND_API_KEY="re_..."

   # App Configuration
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:sync
   npm run db:cleanup-catalog
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── manga/          # Manga-related endpoints
│   │   ├── user/           # User management endpoints
│   │   ├── webhooks/       # Webhook handlers
│   │   ├── test-email/     # Email testing endpoints
│   │   └── simulate-email-notification/ # Email simulation
│   ├── dashboard/         # Dashboard page
│   ├── search/            # Search page
│   ├── manga/             # Manga detail pages
│   ├── reader/            # Manga reader
│   ├── settings/          # User settings
│   ├── sign-in/           # Authentication pages
│   └── sign-up/
├── components/            # Reusable components
│   ├── ui/               # ShadCN UI components
│   ├── DevToolsDropdown.tsx # Development tools
│   ├── NotificationDropdown.tsx # Notification system
│   ├── EmailSimulatorButton.tsx # Email testing
│   └── ...               # Other custom components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database connection
│   ├── stripe.ts         # Stripe configuration
│   ├── email.ts          # Email service (Resend)
│   ├── notifications.ts  # Notification management
│   └── validations.ts    # Zod schemas
├── mocks/                # Mock data for development
│   ├── handlers.ts       # MSW request handlers
│   └── data.ts           # Mock data definitions
└── middleware.ts         # Next.js middleware
```

## 🗄️ Database Schema

The app uses Prisma with PostgreSQL. Key models include:

- **User**: User accounts with tier-based limits and email preferences
- **Manga**: Manga series information with metadata
- **Chapter**: Individual chapters with pages and reading status
- **UserManga**: User's bookmarked manga with reading progress
- **ReadingHistory**: Detailed reading progress tracking
- **Notification**: In-app and email notifications
- **NotificationType**: Enum for different notification types

## 🛡️ Security Features

### Input Validation & Security

The app uses **Zod** for comprehensive input validation:

- **Type Safety**: Runtime type checking for all API inputs
- **Data Sanitization**: Automatic sanitization of user inputs
- **Schema Validation**: Structured validation for all data models
- **Error Handling**: Clear validation error messages

## 📧 Email System

### Resend Integration

- **Email Templates**: HTML and plain text templates for notifications
- **Notification Types**: New chapters, manga updates, system notifications
- **User Preferences**: Users can enable/disable email notifications
- **Testing Tools**: Built-in email simulation for development

### Email Features

- **Responsive Design**: Beautiful email templates that work on all devices
- **Branding**: Consistent MangaTrack branding in all emails
- **Action Buttons**: Direct links to the app from emails
- **Unsubscribe**: Easy preference management

## 🐛 Error Handling

### Built-in Error Management

- **Client-side Errors**: JavaScript error handling with user-friendly messages
- **Server-side Errors**: API error responses with proper HTTP status codes
- **Validation Errors**: Clear error messages for input validation failures
- **User Feedback**: Toast notifications for user actions

## 🔧 Development Tools

### Dev Tools Dropdown

Access development utilities from the header:

- **Email Simulation**: Test different types of email notifications
- **Browser Notifications**: Test native browser notifications

## 📡 API Endpoints

### Public Endpoints

- `GET /api/manga/search` - Search manga with filters (no auth required)

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
- `POST /api/stripe/create-checkout` - Create Stripe checkout session
- `POST /api/stripe/create-portal` - Create Stripe customer portal

### Development Endpoints

- `POST /api/test-email` - Send test email
- `POST /api/simulate-email-notification` - Simulate email notifications

### Webhook Endpoints

- `POST /api/webhooks/clerk` - Clerk user sync
- `POST /api/webhooks/stripe` - Stripe payment events

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- All variables from `.env.local`
- Update `NEXT_PUBLIC_APP_URL` to your production URL
- Set `NODE_ENV=production`
- Configure webhook URLs in external services

## 🧪 Testing

### Available Test Commands

```bash
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Testing Features

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API endpoint tests
- **E2E Tests**: Full user flow tests (with Playwright)
- **Mock Data**: Comprehensive test data for all scenarios

## 📊 Performance & Monitoring

### Built-in Monitoring

- **Error Handling**: Comprehensive error handling with user feedback
- **Performance**: Optimized API responses and database queries
- **User Experience**: Smooth interactions with loading states
- **Validation**: Real-time input validation and error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help:

1. Check the [SETUP.md](SETUP.md) for detailed setup instructions
2. Open an issue on GitHub
3. Review the test files for usage examples

---

Built with ❤️ using Next.js, Clerk, Prisma, Resend, and Stripe.
