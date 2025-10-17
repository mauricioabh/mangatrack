# 🎭 Mock Data vs Real Database Guide

This guide explains how to switch between mock data and real database data in MangaTrack, including all the new features and development tools.

## 🔄 How It Works

Your MangaTrack app is designed to work with **both** mock data and real database data seamlessly:

- **Real Database**: Your existing Prisma + Neon setup works exactly as before
- **Mock Data**: MSW (Mock Service Worker) intercepts API calls in development
- **Production**: Always uses real database (MSW is disabled)
- **Dev Tools**: Easy switching through the header dropdown

## 🎛️ Switching Between Data Sources

### Method 1: Dev Tools Dropdown (Recommended)

1. Start your development server: `npm run dev`
2. Look for the **🔧 Dev Tools** button in the header
3. Click the dropdown and select **"Switch to Mock Data"** or **"Switch to Real Data"**
4. The page will reload automatically with the new data source

### Method 2: Environment Variable

Add this to your `.env.local` file:

```bash
# Set to 'true' to use mock data, 'false' to use real database
NEXT_PUBLIC_USE_MOCK=false
```

### Method 3: Browser Console

```javascript
// Enable mock data
localStorage.setItem("use-mock-data", "true");
window.location.reload();

// Disable mock data (use real database)
localStorage.setItem("use-mock-data", "false");
window.location.reload();
```

## 📊 What You'll See

### Mock Data Mode 🎭

#### **Manga Library (6 Popular Series)**

- **One Piece** - Adventure, Shounen (1000+ chapters)
- **Attack on Titan** - Action, Drama (139 chapters)
- **Demon Slayer** - Action, Supernatural (205 chapters)
- **My Hero Academia** - Action, School (400+ chapters)
- **Jujutsu Kaisen** - Action, Supernatural (250+ chapters)
- **Tokyo Ghoul** - Action, Horror (143 chapters)

#### **Sample User Data**

- **Name**: John Doe
- **Tier**: Premium
- **Bookmarks**: 3 manga bookmarked
- **Reading History**: Progress on multiple chapters
- **Notifications**: 5 unread notifications

#### **Realistic Features**

- **Cover Images**: High-quality manga covers
- **Chapter Lists**: Complete chapter information
- **Genres**: Proper genre categorization
- **Descriptions**: Detailed manga descriptions
- **Reading Progress**: Visual progress indicators

#### **Console Indicators**

- **Mock Data**: "🎭 MSW Mock Data Enabled"
- **API Calls**: Intercepted by MSW
- **No Database**: No actual database queries

### Real Database Mode 🗄️

#### **Your Actual Data**

- **Real Users**: Actual Clerk users and their data
- **Database Content**: Whatever is in your Neon database
- **User Authentication**: Real Clerk authentication
- **Data Persistence**: Changes are saved to database

#### **Console Indicators**

- **Real Data**: "🗄️ Using Real Database Data"
- **API Calls**: Direct to your API endpoints
- **Database Queries**: Actual Prisma database operations

## 🛠️ Development Tools Integration

### Dev Tools Dropdown Features

The **🔧 Dev Tools** button in the header provides:

#### **Data Source Management**

- **Switch to Mock Data**: Enable mock data system
- **Switch to Real Data**: Use actual database
- **Visual Indicator**: Shows current data source

#### **Testing Tools**

- **Sentry Testing**: Test error reporting
- **Email Simulation**: Test email notifications
- **Browser Notifications**: Test native notifications

#### **Development Utilities**

- **Error Testing**: Trigger various error types
- **Email Testing**: Simulate different notification types
- **Notification Testing**: Test browser notification system

## 🚀 Development Workflow

### For UI Development

```bash
# Use mock data for consistent UI testing
# Click "Switch to Mock Data" in Dev Tools dropdown
```

**Benefits:**

- ✅ **Consistent Data**: Same data every time you reload
- ✅ **Fast Development**: No database queries
- ✅ **Offline Development**: Works without database connection
- ✅ **UI Testing**: Perfect for testing layouts and components

### For Database Testing

```bash
# Use real database to test data operations
# Click "Switch to Real Data" in Dev Tools dropdown
```

**Benefits:**

- ✅ **Real Testing**: Test actual database operations
- ✅ **User Authentication**: Test with real Clerk users
- ✅ **Data Persistence**: Changes are saved
- ✅ **Production Parity**: Same as production environment

### For Feature Testing

```bash
# Test specific features with appropriate data source
# Use Dev Tools to switch as needed
```

**Examples:**

- **Email Testing**: Use real data to test email notifications
- **Error Testing**: Use mock data to test error handling
- **Payment Testing**: Use real data to test Stripe integration

## 🔧 Customizing Mock Data

### Adding More Manga

Edit `src/mocks/data.ts` to add more manga:

```typescript
export const mockMangas = [
  // ... existing manga
  {
    id: "7",
    title: "Your New Manga",
    slug: "your-new-manga",
    description: "A great new manga series",
    coverImage: "https://example.com/cover.jpg",
    genres: ["Action", "Adventure"],
    status: "ONGOING",
    author: "Author Name",
    totalChapters: 50,
    // ... rest of the data
  },
];
```

### Modifying User Data

Edit `src/mocks/data.ts` to change user information:

```typescript
export const mockUser = {
  id: "user-1",
  name: "Your Name", // Change this
  email: "your@email.com", // Change this
  tier: "PREMIUM", // Or "BASIC"
  emailNotifications: true,
  // ... rest of the data
};
```

### Adding Notifications

Edit `src/mocks/data.ts` to add more notifications:

```typescript
export const mockNotifications = [
  // ... existing notifications
  {
    id: "notification-6",
    type: "NEW_CHAPTER",
    title: "New Chapter Available",
    message: "Chapter 100 of Your Manga is now available!",
    mangaId: "7",
    chapterId: "chapter-100",
    read: false,
    createdAt: new Date().toISOString(),
  },
];
```

## 🎯 Benefits by Use Case

### Mock Data Benefits

#### **UI/UX Development**

- ✅ **Consistent Testing**: Same data every time
- ✅ **Fast Iteration**: No database setup required
- ✅ **Offline Development**: Works without internet
- ✅ **Component Testing**: Perfect for testing UI components

#### **Feature Development**

- ✅ **Error Testing**: Test error states easily
- ✅ **Edge Cases**: Test with specific data scenarios
- ✅ **Performance**: No database latency
- ✅ **Isolation**: Test features independently

### Real Database Benefits

#### **Integration Testing**

- ✅ **End-to-End Testing**: Test complete user flows
- ✅ **Authentication**: Test with real Clerk users
- ✅ **Data Persistence**: Verify data is saved correctly
- ✅ **Production Parity**: Same as production environment

#### **Feature Validation**

- ✅ **Email Testing**: Test actual email delivery
- ✅ **Payment Testing**: Test Stripe integration
- ✅ **Notification Testing**: Test real notification system
- ✅ **Performance**: Test with real database queries

## 🚨 Important Notes

### Production Safety

1. **MSW Disabled**: Mock Service Worker is completely disabled in production
2. **Environment Check**: `NODE_ENV=production` disables mock data
3. **Database Only**: Production always uses real database

### Data Integrity

1. **No Interference**: Mock data never touches your real database
2. **API Compatibility**: Mock endpoints match your real API structure
3. **Type Safety**: Mock data uses the same TypeScript types

### Development Best Practices

1. **Start with Mock**: Use mock data for initial development
2. **Test with Real**: Switch to real data for integration testing
3. **Use Dev Tools**: Leverage the dropdown for easy switching
4. **Document Changes**: Update mock data when adding new features

## 🐛 Troubleshooting

### Mock Data Not Working

**Symptoms:**

- No mock data showing
- API calls going to real endpoints
- Console shows "Using Real Database Data"

**Solutions:**

1. Check Dev Tools dropdown shows "Switch to Mock Data"
2. Verify `NEXT_PUBLIC_USE_MOCK=true` in `.env.local`
3. Check console for "🎭 MSW Mock Data Enabled"
4. Try refreshing the page

### Real Data Not Working

**Symptoms:**

- Mock data still showing
- API calls intercepted by MSW
- Console shows "MSW Mock Data Enabled"

**Solutions:**

1. Click "Switch to Real Data" in Dev Tools dropdown
2. Verify `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`
3. Check console for "🗄️ Using Real Database Data"
4. Verify database connection

### Dev Tools Not Showing

**Symptoms:**

- No Dev Tools button in header
- Missing development utilities

**Solutions:**

1. Ensure you're running `npm run dev`
2. Check `NODE_ENV=development`
3. Verify the component is imported in layout
4. Check browser console for errors

### API Endpoints Not Working

**Symptoms:**

- 404 errors on API calls
- Mock data not loading
- Real data not loading

**Solutions:**

1. Check API route files exist
2. Verify MSW handlers are correct
3. Check database connection
4. Review console for error messages

## 🎉 Advanced Usage

### Custom Mock Scenarios

Create specific test scenarios:

```typescript
// Test empty state
export const emptyMockData = {
  mangas: [],
  user: { ...mockUser, bookmarks: [] },
  notifications: [],
};

// Test error state
export const errorMockData = {
  mangas: null, // Will trigger error handling
  user: null,
  notifications: [],
};
```

### Integration with Testing

Use mock data in your tests:

```typescript
// Jest test with mock data
import { mockMangas } from '../mocks/data';

test('displays manga list', () => {
  render(<MangaList mangas={mockMangas} />);
  expect(screen.getByText('One Piece')).toBeInTheDocument();
});
```

### Performance Testing

Compare performance between mock and real data:

```typescript
// Mock data - fast, no database queries
console.time("mock-data-load");
// Load mock data
console.timeEnd("mock-data-load");

// Real data - includes database queries
console.time("real-data-load");
// Load real data
console.timeEnd("real-data-load");
```

## 🎯 Happy Coding!

Now you have a comprehensive mock data system that integrates perfectly with your development workflow:

- ✅ **Easy Switching**: Dev Tools dropdown for instant switching
- ✅ **Comprehensive Data**: Realistic mock data for all features
- ✅ **Development Tools**: Built-in testing utilities
- ✅ **Production Safe**: Automatically disabled in production
- ✅ **Flexible**: Easy to customize and extend

Use mock data for rapid UI development and real data for integration testing. The Dev Tools dropdown makes switching effortless! 🚀
