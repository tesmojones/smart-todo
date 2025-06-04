# AI Todo Server (NestJS)

A modern, scalable backend for the AI Todo application built with NestJS, TypeScript, and PostgreSQL.

## Features

- **Authentication**: Google OAuth 2.0 integration with JWT tokens
- **AI-Powered Task Processing**: Natural language task parsing with OpenAI integration
- **Task Management**: Full CRUD operations with advanced features
- **Recommendations**: AI-powered task suggestions
- **Database**: PostgreSQL with TypeORM
- **API Documentation**: Swagger/OpenAPI integration
- **Type Safety**: Full TypeScript implementation

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: Passport.js (Google OAuth, JWT)
- **AI**: OpenAI GPT-3.5-turbo
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator
- **Date Processing**: moment.js

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Google OAuth credentials
- OpenAI API key (optional, for enhanced AI features)

## Installation

1. **Clone and navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/aitodo
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   
   # OpenAI (optional)
   OPENAI_API_KEY=your-openai-api-key
   
   # Server
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   SESSION_SECRET=your-session-secret
   ```

4. **Set up the database**:
   ```bash
   # Create database
   createdb aitodo
   
   # Run migrations
   npm run migration:run
   ```

## Development

1. **Start the development server**:
   ```bash
   npm run start:dev
   ```

2. **Access the API**:
   - Server: http://localhost:3001
   - API Documentation: http://localhost:3001/api
   - Health Check: http://localhost:3001/health

## API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `GET /api/tasks/recommendations` - Get AI recommendations

### AI
- `POST /api/ai/parse-task` - Parse natural language to task

- `GET /api/ai/recommendations` - Get AI recommendations

### Users
- `GET /api/users/profile` - Get user profile

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `googleId` (String, Unique)
- `email` (String, Unique)
- `name` (String)
- `picture` (String, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `lastLogin` (Timestamp, Optional)

### Tasks Table
- `id` (UUID, Primary Key)
- `title` (String)
- `dueDate` (Date, Optional)
- `priority` (Enum: low, medium, high, urgent)
- `completed` (Boolean)
- `status` (Enum: todo, in_progress, done)
- `tags` (String Array)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `completedAt` (Timestamp, Optional)
- `isRepetitive` (Boolean)
- `nextOccurrence` (Date, Optional)
- `position` (Integer)
- `userId` (UUID, Foreign Key)

## AI Features

### Natural Language Processing
The server can parse natural language input into structured task data:

```typescript
// Input: "Buy groceries tomorrow high priority"
// Output:
{
  title: "Buy groceries",
  dueDate: "2024-01-15T00:00:00.000Z",
  priority: "high",
  tags: ["shopping"]
}
```



### AI Recommendations
Get personalized productivity recommendations based on user patterns and task history.

## Scripts

- `npm run build` - Build the application
- `npm run start` - Start the production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run migration:generate` - Generate new migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT token signing | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration time | No | 7d |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes | - |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL | Yes | - |
| `OPENAI_API_KEY` | OpenAI API key for enhanced AI features | No | - |
| `PORT` | Server port | No | 3001 |
| `CORS_ORIGIN` | Frontend URL for CORS | No | http://localhost:3000 |
| `SESSION_SECRET` | Session secret for security | Yes | - |

## Architecture

```
src/
├── common/           # Shared utilities
│   ├── decorators/   # Custom decorators
│   ├── dto/          # Data transfer objects
│   ├── guards/       # Authentication guards
│   └── interfaces/   # TypeScript interfaces
├── config/           # Configuration files
├── database/         # Database related files
│   ├── entities/     # TypeORM entities
│   └── migrations/   # Database migrations
└── modules/          # Feature modules
    ├── ai/           # AI processing
    ├── auth/         # Authentication
    ├── tasks/        # Task management
    └── users/        # User management
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details.