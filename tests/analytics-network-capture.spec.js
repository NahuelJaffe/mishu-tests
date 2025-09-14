const { test, expect } = require('@playwright/test');
const { disableAnalytics, gotoWithAnalyticsDisabled } = require('./analytics-helper');

// Explicit analytics providers to assert against
const ANALYTICS_PROVIDERS = [
  'google-analytics.com',
  'googletagmanager.com',
  'googleadservices.com',
  'googlesyndication.com',
  'doubleclick.net',
  'mixpanel.com',
  'amplitude.com',
  'segment.io',
  'heap.io',
  'hotjar.com'
];

// Utility to check if a URL hits any analytics provider
function isAnalyticsUrl(url) {
  const u = (typeof url === 'string') ? url : url.toString();
  return ANALYTICS_PROVIDERS.some(domain => u.includes(domain));
}

// This test records a HAR and also listens to requests, then asserts
// that no requests were made to known analytics providers.
test('Analytics Network Capture - should not make requests to analytics providers', async ({ browser }) => {
  // Create an isolated context so we can record a HAR without affecting other tests
  const context = await browser.newContext({
    recordHar: {
      path: 'test-results/analytics-network.har',
      mode: 'minimal'
    }
  });
  const page = await context.newPage();

  // Capture requests during the run
  const requestUrls = [];
  page.on('request', req => {
    requestUrls.push(req.url());
  });

  // Ensure analytics disabling is applied as early as possible
  await disableAnalytics(page);

  // Navigate with disableAnalytics=1 param
  await gotoWithAnalyticsDisabled(page, '/');

  // Give time for any late resources to attempt loading
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Close the context to flush HAR
  await context.close();

  // Filter any analytics requests
  const analyticsRequests = requestUrls.filter(isAnalyticsUrl);

  // Assert: there should be none
  expect(analyticsRequests, `Found analytics requests: \n${analyticsRequests.join('\n')}`).toHaveLength(0);
});
