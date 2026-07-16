# 🎭 E2E Tests for MangaTrack

This directory contains end-to-end tests for the MangaTrack application using Playwright.

## 🚀 Quick Start

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests with Browser UI

```bash
npm run test:e2e:headed
```

### Run Tests with Playwright UI

```bash
npm run test:e2e:ui
```

### View Test Report

```bash
npm run test:e2e:report
```

## 📁 Test Files

### `basic-functionality.spec.ts`

Basic functionality tests:

- Homepage loading
- Authentication redirects
- Protected route access

### `dashboard-loading.spec.ts`

Dashboard functionality tests:

- Dashboard loading with user data
- Empty state display
- Navigation functionality

### Unit (Jest, `*.test.ts`)

- `consumet/mappers.test.ts` — Consumet search/detail/chapter mappers
- `consumet/ids.test.ts` — `~` encoding for slashy chapter ids
- `reading-progress.test.ts` — continue-reading helpers

### `example.spec.ts`

Simple example tests:

- Homepage loading
- Search page accessibility

## 🎯 Test Scenarios Covered

### ✅ **Authentication & User Management**

- Protected route access
- Dashboard access with authentication
- User authentication flows

### ✅ **Basic Functionality**

- Homepage loading
- Page navigation
- Protected route redirects

## 🛠️ Configuration

### Playwright Config (`playwright.config.ts`)

- **Test Directory**: `./tests`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Auto Server**: Starts dev server automatically

### Environment Setup

Tests automatically:

- Start the development server
- Handle authentication states
- Grant necessary permissions

## 🚨 Important Notes

### **Test Environment**

- Tests run against `localhost:3000`
- Development server starts automatically
- Browser permissions are managed automatically

### **Authentication**

- Tests use Clerk authentication with setup
- Authentication state is stored and reused
- Protected routes are tested with proper authentication

## 🐛 Troubleshooting

### **Common Issues**

#### Tests Fail to Start

```bash
# Ensure dev server can start
npm run dev

# Check if port 3000 is available
netstat -an | findstr :3000
```

#### Browser Not Found

```bash
# Reinstall browsers
npx playwright install
```

### **Debug Mode**

```bash
# Run with debug output
DEBUG=pw:api npm run test:e2e

# Run specific test with debug
npx playwright test tests/example.spec.ts --debug
```

## 🎉 Happy Testing!

Your MangaTrack application now has comprehensive E2E test coverage for essential functionality! 🚀
