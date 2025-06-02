# AI Todo - Smart Task Management 🧠✅

A modern, AI-powered task management application featuring intelligent task processing, Google OAuth authentication, and a beautiful drag-and-drop interface.

## 🚀 Key Features

### 🎯 Task Management
- **Kanban Board**: Drag-and-drop interface with three columns (Not Started, In Progress, Completed)
- **Calendar View**: Visual calendar with task scheduling and date-based organization
- **Smart Task Input**: AI-powered natural language processing for task creation
- **Task Timer**: Built-in Pomodoro timer with task-specific tracking
- **Hashtag System**: Organize tasks with clickable hashtags for easy filtering

### 🤖 AI-Powered Features
- **Natural Language Processing**: Create tasks using everyday language
- **Smart Priority Detection**: AI automatically detects and assigns priority levels
- **Date Extraction**: Intelligent parsing of due dates from natural language
- **Task Enhancement**: AI suggestions for improving task descriptions

### 🔐 Authentication & Security
- **Google OAuth 2.0**: Secure authentication with Google accounts
- **JWT Tokens**: Stateless authentication with automatic token management
- **User Profiles**: Personalized experience with user avatars and settings

### 🎨 Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Tabbed Navigation**: Easy switching between Tasks and Calendar views
- **Header Integration**: Compact timer and navigation in the app header
- **Settings Modal**: Comprehensive user preferences and account management

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **Lucide React** - Beautiful, consistent icons
- **Atlaskit Pragmatic Drag and Drop** - Smooth drag-and-drop functionality
- **Axios** - HTTP client for API communication
- **Date-fns** - Modern date manipulation library
- **Framer Motion** - Smooth animations and transitions

### Backend
- **NestJS** - Progressive Node.js framework with TypeScript
- **TypeScript** - Type-safe development
- **PostgreSQL** - Robust relational database
- **TypeORM** - Object-relational mapping with decorators
- **Passport.js** - Authentication middleware
- **JWT** - JSON Web Tokens for stateless auth
- **Swagger/OpenAPI** - API documentation

### AI & NLP Libraries
- **OpenAI API** - Advanced language processing
- **Natural.js** - Natural language processing toolkit
- **Compromise.js** - Natural language understanding
- **Moment.js** - Date parsing and manipulation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- Google OAuth credentials

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aitodo
   ```

2. **Install dependencies**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server-new
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env` file in `server-new` directory:
   ```env
   # Database
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=your_db_user
   DATABASE_PASSWORD=your_db_password
   DATABASE_NAME=aitodo
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # OpenAI (optional)
   OPENAI_API_KEY=your_openai_api_key
   
   # Server
   PORT=5001
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   cd server-new
   npm run migration:run
   ```

5. **Start the development servers**
   ```bash
   # Start backend server (from server-new directory)
   npm run start:dev
   
   # Start frontend server (from client directory)
   cd ../client
   npm start
   ```

   The application will be available at:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5001`
   - API Documentation: `http://localhost:5001/api/docs`

## 🎯 How to Use

### Getting Started
1. **Sign in** with your Google account
2. **Create tasks** using the floating "+" button
3. **Switch views** between Tasks (Kanban) and Calendar using the header tabs
4. **Drag and drop** tasks between columns to update their status
5. **Start timers** on tasks for focused work sessions

### Task Creation Examples

The AI understands natural language input:

```
"Buy groceries tomorrow at 5 PM"           → Task with due date
"Call mom this weekend - important"         → High priority task
"Finish project report by Friday urgent"    → Urgent priority with deadline
"Workout at gym #fitness #health"          → Task with hashtags
"Meeting with John next Tuesday 2 PM"       → Scheduled task
```

### Features in Detail

#### Kanban Board
- **Three columns**: Not Started, In Progress, Completed
- **Drag & drop**: Move tasks between columns
- **Task cards**: Show title, due date, priority, and hashtags
- **Quick actions**: Edit, delete, start timer directly from cards

#### Calendar View
- **Monthly calendar**: Visual representation of tasks by date
- **Task creation**: Click on any date to create tasks
- **Task filtering**: Filter by hashtags across calendar view
- **Date navigation**: Easy month-to-month navigation

#### Timer Functionality
- **Pomodoro timer**: 25-minute focused work sessions
- **Header integration**: Timer displays in the app header when active
- **Task association**: Timers are linked to specific tasks
- **Controls**: Play, pause, and stop functionality

## 📱 Mobile Experience

- **Responsive design** that works on all screen sizes
- **Touch-friendly** drag and drop interface
- **Optimized navigation** for mobile devices
- **Fast loading** with efficient API calls

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth flow
- `GET /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/user` - Get current user profile

### Tasks
- `GET /api/tasks` - Fetch user's tasks
- `POST /api/tasks` - Create new task (with AI processing)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### AI Features
- `POST /api/ai/process-task` - Process natural language task input
- `POST /api/ai/enhance-task` - Get AI suggestions for task improvement

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## 🏗️ Project Structure

```
aitodo/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── KanbanBoard.js  # Main kanban interface
│   │   │   ├── TaskCalendar.js # Calendar view
│   │   │   ├── Login.js        # Authentication
│   │   │   ├── Settings.js     # User settings
│   │   │   └── ...
│   │   ├── App.js             # Main app component
│   │   └── App.css            # Global styles
│   └── package.json           # Frontend dependencies
├── server-new/                # NestJS backend
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # Authentication module
│   │   │   ├── tasks/         # Task management
│   │   │   ├── users/         # User management
│   │   │   └── ai/            # AI processing
│   │   ├── database/          # Database entities & migrations
│   │   ├── common/            # Shared utilities
│   │   └── main.ts            # Application entry point
│   └── package.json           # Backend dependencies
└── README.md                  # This file
```

## 🚀 Deployment

### Environment Setup
1. Set up PostgreSQL database
2. Configure Google OAuth credentials
3. Set environment variables
4. Run database migrations

### Production Build
```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../server-new
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure database exists and migrations are run

2. **Google OAuth not working**
   - Verify Google OAuth credentials
   - Check redirect URLs in Google Console
   - Ensure HTTPS in production

3. **AI features not working**
   - Check OpenAI API key configuration
   - Verify API quota and billing
   - Check network connectivity

### Development Tips
- Use browser dev tools to check API responses
- Check server logs for detailed error messages
- Verify JWT tokens are being sent with requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🎉 What Makes This Special

This application showcases modern web development practices:

- **Full-stack TypeScript** for type safety across the entire application
- **AI integration** that actually enhances user productivity
- **Modern authentication** with Google OAuth and JWT
- **Beautiful UI/UX** with smooth animations and responsive design
- **Scalable architecture** using NestJS modules and React components
- **Database best practices** with TypeORM and PostgreSQL

Perfect for developers wanting to learn:
- Modern React development with hooks
- NestJS backend architecture
- AI/NLP integration in web applications
- Authentication and authorization patterns
- Database design and ORM usage
- Responsive UI design principles

---

**Happy task managing! 🚀**