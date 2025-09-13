# Mishu Tests

Automated QA tests for https://mishu-web--pr67-faq-0n1j2wio.web.app/ using Playwright.

## Setup and Installation

1. Install dependencies:
```bash
npm install
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
# Smoke tests
npm run test:smoke

# WhatsApp tests
npm run test:whatsapp

# Authentication tests
npm run test:auth

# Run with UI mode
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed
```

### View test reports
```bash
npm run test:report
```

## Environment Variables

For CI/CD or custom test credentials, set these environment variables:
- `TEST_EMAIL`: Email for test login
- `TEST_PASSWORD`: Password for test login
- `BASE_URL`: Base URL for testing (defaults to https://mishu.co.il)

## Recent Updates

- Fixed WebKit browser launch issues in CI
- Updated all test URLs to use environment variables
- Added comprehensive API test coverage (auth, WhatsApp, user profile, system health)
- Implemented global authentication setup for session reuse
- Enhanced error handling and selector robustness
- Fixed QR code selectors with fallback mechanisms
- Improved user menu and logout functionality selectors
- Resolved offline behavior test error handling
- Enhanced FAQ and contact form selectors with graceful degradation
- Fixed strict mode violations in signup tests
- Replaced networkidle waits with domcontentloaded for better CI stability

## Git Setup (if needed)

```bash
git init
git add .
git commit -m "Initial commit with Playwright setup"
git remote add origin https://github.com/NahuelJaffe/mishu-tests.git
git push -u origin main --force
```

