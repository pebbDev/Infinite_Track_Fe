# Environment Variables Configuration

This document explains how to configure environment variables for the Infinite Track Frontend application.

## Setup

1. Copy the example environment file:

   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file with your actual configuration values.

## Available Environment Variables

### API Configuration

| Variable            | Description                  | Default Value | Example                          |
| ------------------- | ---------------------------- | ------------- | -------------------------------- |
| `API_BASE_URL`      | Base URL for API endpoints   | `/api`        | `https://api.yourdomain.com/api` |
| `API_AUTH_ENDPOINT` | Authentication endpoint path | `/auth`       | `/auth`                          |
| `API_VERSION`       | API version                  | `v1`          | `v1`                             |

### Application Configuration

| Variable          | Description         | Default Value    | Example          |
| ----------------- | ------------------- | ---------------- | ---------------- |
| `APP_NAME`        | Application name    | `Infinite Track` | `Infinite Track` |
| `APP_VERSION`     | Application version | `2.0.1`          | `2.0.1`          |
| `APP_ENVIRONMENT` | Environment mode    | `development`    | `production`     |

### Authentication Configuration

| Variable           | Description                     | Default Value | Example            |
| ------------------ | ------------------------------- | ------------- | ------------------ |
| `SESSION_TIMEOUT`  | Session timeout in milliseconds | `3600000`     | `3600000` (1 hour) |
| `REMEMBER_ME_DAYS` | Remember me duration in days    | `7`           | `30`               |

### Localization Configuration

| Variable           | Description                  | Default Value  | Example        |
| ------------------ | ---------------------------- | -------------- | -------------- |
| `DEFAULT_LANGUAGE` | Default application language | `id`           | `en`           |
| `TIMEZONE`         | Application timezone         | `Asia/Jakarta` | `Asia/Jakarta` |

### Debug Configuration

| Variable     | Description       | Default Value | Example |
| ------------ | ----------------- | ------------- | ------- |
| `DEBUG_MODE` | Enable debug mode | `true`        | `false` |
| `LOG_LEVEL`  | Logging level     | `debug`       | `error` |

### Security Configuration

| Variable           | Description            | Default Value | Example  |
| ------------------ | ---------------------- | ------------- | -------- |
| `CSRF_TOKEN_NAME`  | CSRF token field name  | `_token`      | `_token` |
| `COOKIE_SECURE`    | Use secure cookies     | `false`       | `true`   |
| `COOKIE_SAME_SITE` | Cookie SameSite policy | `lax`         | `strict` |

## Usage in Code

### Importing Configuration

```javascript
// Import specific configurations
import { API_CONFIG, AUTH_CONFIG } from "./src/js/config/env.js";

// Import all configurations
import ENV from "./src/js/config/env.js";
```

### Using API Configuration

```javascript
import { API_CONFIG } from "./src/js/config/env.js";

// Access API URLs
console.log(API_CONFIG.LOGIN_URL); // /api/auth/login
console.log(API_CONFIG.LOGOUT_URL); // /api/auth/logout
console.log(API_CONFIG.PROFILE_URL); // /api/auth/profile
```

### Using Authentication Configuration

```javascript
import { AUTH_CONFIG } from "./src/js/config/env.js";

// Access storage keys
localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER_DATA, userData);

// Access timeout settings
setTimeout(logout, AUTH_CONFIG.SESSION_TIMEOUT);
```

### Environment-based Logging

```javascript
import { envLog, APP_CONFIG } from "./src/js/config/env.js";

// Log with level checking
envLog("debug", "Debug message"); // Only logs if LOG_LEVEL allows
envLog("error", "Error message"); // Always logs

// Check environment
if (APP_CONFIG.isDevelopment()) {
  console.log("Running in development mode");
}
```

## Environment Examples

### Development Environment (.env)

```env
API_BASE_URL=http://localhost:8000/api
APP_ENVIRONMENT=development
DEBUG_MODE=true
LOG_LEVEL=debug
```

### Production Environment (.env)

```env
API_BASE_URL=https://api.yourdomain.com/api
APP_ENVIRONMENT=production
DEBUG_MODE=false
LOG_LEVEL=error
COOKIE_SECURE=true
```

### Testing Environment (.env)

```env
API_BASE_URL=http://localhost:3001/api
APP_ENVIRONMENT=test
DEBUG_MODE=true
LOG_LEVEL=info
```

## Security Notes

- **Never commit `.env` files to version control**
- Always use `.env.example` as a template
- Use strong, unique values for production
- Regularly rotate sensitive configuration values
- Use HTTPS URLs in production environments

## Build Process

The webpack configuration automatically injects these environment variables into the application bundle using `webpack.DefinePlugin`. This means:

1. Environment variables are available at build time
2. Only specified variables are included in the bundle
3. Variables are replaced with their actual values during compilation
4. No runtime dependency on environment files

## Troubleshooting

### Environment Variables Not Loading

- Ensure `.env` file exists in the project root
- Check for syntax errors in `.env` file
- Verify webpack configuration includes `DefinePlugin`
- Restart development server after changing `.env`

### Values Not Updating

- Clear webpack cache: `npm run build -- --clean`
- Restart development server
- Check browser cache and hard refresh

### Production Deployment

- Use your hosting platform's environment variable system
- Don't rely on `.env` files in production
- Use build-time environment injection for static deployments
