# API Configuration

This directory contains centralized API configuration for the Tesmo Todo client application.

## Files

### `api.js`
Centralized configuration for all API endpoints and base URLs.

## Environment Configuration

The API base URL can be configured using environment variables:

### Environment Variables

- `REACT_APP_API_BASE_URL`: Sets the base URL for the API server

### Usage

1. **Development**: Create a `.env.local` file in the client root:
   ```
   REACT_APP_API_BASE_URL=http://localhost:3001
   ```

2. **Staging**: Create a `.env.staging` file:
   ```
   REACT_APP_API_BASE_URL=https://staging-api.tesmo.my.id
   ```

3. **Production**: Set environment variable in your deployment:
   ```
   REACT_APP_API_BASE_URL=https://api.tesmo.my.id
   ```

### Default Configuration

If no environment variable is set, the application defaults to:
```
http://api.tesmo.my.id:2053
```

## API Endpoints

All API endpoints are now centralized in `api.js`:

- `API_ENDPOINTS.AUTH.USER` - User authentication endpoint
- `API_ENDPOINTS.AUTH.GOOGLE` - Google OAuth endpoint
- `API_ENDPOINTS.TASKS` - Tasks API endpoint
- `API_ENDPOINTS.USERS.PROFILE` - User profile endpoint

## Migration from Hardcoded URLs

Previously, API URLs were hardcoded throughout the application. This refactoring:

1. ✅ Centralizes all API configuration
2. ✅ Enables environment-specific configuration
3. ✅ Makes switching between development/staging/production easier
4. ✅ Improves maintainability
5. ✅ Follows React best practices for environment configuration

## Files Updated

- `src/App.js` - Updated to use centralized API configuration
- `src/components/Login.js` - Updated to use centralized API configuration
- `src/components/Settings.js` - Updated to use centralized API configuration