# Environment Configuration Guide

This document explains how to configure environment variables for both the client and server components of the AI Todo application.

## Server Configuration

### Available Environment Files

- `.env.example` - Template with all required variables
- `.env.local` - Local development configuration
- `.env.production` - Production configuration

### Setup Instructions

1. For local development:
   ```bash
   # Copy the local development configuration
   cp .env.local .env
   ```

2. For production deployment:
   ```bash
   # Copy the production configuration
   cp .env.production .env
   ```

### Key Environment Variables

- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origin for CORS
  - Local: `http://127.0.0.1:3000`
  - Production: `http://todo.tesmo.my.id`
- `CLIENT_URL` - Frontend application URL
  - Local: `http://127.0.0.1:3000`
  - Production: `http://todo.tesmo.my.id`
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL
  - Local: `http://127.0.0.1:5001/api/auth/google/callback`
  - Production: `http://todo.tesmo.my.id/api/auth/google/callback`

## Client Configuration

### Available Environment Files

- `.env.example` - Template with all required variables
- `.env.local` - Local development configuration
- `.env.production` - Production configuration

### Setup Instructions

1. For local development:
   ```bash
   # The .env.local file is automatically loaded during development
   npm start
   ```

2. For production build:
   ```bash
   # Build with production environment
   npm run build
   ```

### Key Environment Variables

- `REACT_APP_API_BASE_URL` - Backend API URL
  - Local: `http://127.0.0.1:5001`
  - Production: `http://todo.tesmo.my.id`

## Running the Application

### Local Development

1. Start the server:
   ```bash
   cd server
   cp .env.local .env
   npm run start:dev
   ```

2. Start the client:
   ```bash
   cd client
   npm start
   ```

### Production Deployment

1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the server with production environment:
   ```bash
   cd server
   cp .env.production .env
   npm run start:prod
   ```

## Notes

- Always keep sensitive information (API keys, secrets) out of version control
- Add `.env`, `.env.local`, and `.env.production` to your `.gitignore` file
- Only commit `.env.example` as a template for other developers