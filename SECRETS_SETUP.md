# 🔐 GitHub Secrets Configuration

## Required Secrets

Configure these secrets in your GitHub repository settings:

### Authentication
- `TEST_EMAIL` - Test user email address
- `TEST_PASSWORD` - Test user password

### Application URLs
- `BASE_URL` - Base URL for the application (default: https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/)

## How to Set Up Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** > **Actions**
4. Click **New repository secret**
5. Add each secret with its corresponding value

## Example Secrets

```
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-secure-password
BASE_URL=https://your-app-url.com/
```

## Security Notes

- Never commit real credentials to the repository
- Use strong, unique passwords for test accounts
- Regularly rotate test credentials
- Use environment-specific URLs for different testing stages

## Local Development

For local development, create a `.env` file in the project root:

```bash
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-secure-password
BASE_URL=https://your-app-url.com/
```

Add `.env` to your `.gitignore` file to prevent accidental commits.