# AI Todo - Smart Task Management 🧠✅

A cutting-edge todo application powered by artificial intelligence, featuring natural language processing, smart prioritization, personalized recommendations, and voice recognition.

## 🚀 Key AI Features

### 1. Natural Language Processing (NLP) for Task Creation
- **What it does**: Allows users to add tasks using everyday language
- **Examples**: 
  - "Buy groceries tomorrow at 5 PM"
  - "Call mom this weekend - important"
  - "Finish project report by Friday urgent"
- **How it works**: Uses advanced NLP models to parse natural language and extract:
  - Task title
  - Due dates and times
  - Priority levels
  - Tags and categories

### 2. Smart Prioritization
- **What it does**: AI automatically calculates priority scores for tasks
- **Factors considered**:
  - Due date proximity
  - Urgency keywords ("urgent", "asap", "critical")
  - User-defined priority levels
  - Historical completion patterns
- **Result**: Tasks are automatically sorted by AI-calculated importance

### 3. Personalized Task Recommendations
- **What it does**: Suggests tasks based on user patterns and habits
- **Examples**:
  - "You often add a workout on Mondays—add one now?"
  - "Time for your weekly review"
  - "Don't forget to meal prep for the week"
- **How it works**: Analyzes past task creation patterns, completion rates, and timing

### 4. Voice Recognition for Hands-Free Input
- **What it does**: Add tasks using voice commands
- **Benefits**: 
  - Enhanced accessibility
  - Perfect for mobile use
  - Hands-free operation
- **How it works**: Converts speech to text, then processes through NLP pipeline

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **React Speech Recognition** - Voice input capabilities
- **Lucide React** - Beautiful icons
- **Date-fns** - Date manipulation
- **Framer Motion** - Smooth animations
- **Axios** - API communication

### Backend
- **Node.js & Express** - Server framework
- **MongoDB** - Database (with in-memory fallback)
- **Natural.js** - Natural language processing
- **Compromise.js** - Text analysis
- **Chrono-node** - Date/time parsing
- **Moment.js** - Date handling

### AI & NLP Libraries
- **Natural** - Tokenization, stemming, classification
- **Compromise** - Natural language understanding
- **Chrono-node** - Smart date/time extraction

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (optional - app works with in-memory storage)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aitodo
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

### Manual Setup

If you prefer to set up each part separately:

1. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm start
   ```

### Environment Variables (Optional)

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aitodo
OPENAI_API_KEY=your_openai_key_here  # Optional for enhanced AI features
```

## 🎯 How to Use

### Adding Tasks with Natural Language

1. **Simple tasks**:
   - "Buy milk"
   - "Call dentist"

2. **Tasks with dates**:
   - "Meeting with John tomorrow at 3 PM"
   - "Submit report by Friday"
   - "Vacation planning next week"

3. **Tasks with priorities**:
   - "Fix urgent bug in production"
   - "Important: Review contract"
   - "Low priority: organize photos"

4. **Tasks with tags**:
   - "Workout at gym #fitness #health"
   - "Buy groceries #shopping #weekly"

### Using Voice Input

1. Click the microphone button in the header
2. Speak your task naturally
3. The AI will process your speech and create the task
4. Review and confirm the parsed information



## 📊 Analytics & Insights

The app provides detailed analytics including:

- **Completion rates** and productivity trends
- **Priority distribution** across your tasks
- **AI scoring patterns** and recommendations
- **Common task types** and habits
- **Weekly activity** summaries
- **Personalized productivity tips**

## 🎨 Features Overview

### Core Functionality
- ✅ Create, edit, delete tasks
- ✅ Mark tasks as complete
- ✅ Smart sorting and filtering
- ✅ Responsive design for all devices

### AI-Powered Features
- 🧠 Natural language task creation
- 📊 Intelligent priority scoring
- 💡 Personalized recommendations
- 🎤 Voice recognition input
- 📈 Pattern analysis and insights

### User Experience
- 🎨 Modern, intuitive interface
- 📱 Mobile-friendly design
- ⚡ Real-time updates
- 🌙 Beautiful gradient backgrounds
- 🔄 Smooth animations

## 🚀 Advanced Features

### Smart Recommendations
The AI learns from your behavior:
- Time-based suggestions (morning routines, weekly tasks)
- Habit recognition (recurring tasks)
- Context-aware recommendations

### Voice Commands
Supported voice patterns:
- "Add task [description]"
- "Remind me to [action] [when]"
- "Create urgent task [description]"
- "Schedule [task] for [time]"

### Natural Language Examples

The NLP engine understands various formats:

```
"Buy groceries tomorrow at 5 PM"           → Task: Buy groceries, Due: Tomorrow 5 PM
"Call mom this weekend - important"         → Task: Call mom, Due: This weekend, Priority: High
"Finish project report by Friday urgent"    → Task: Finish project report, Due: Friday, Priority: Urgent
"Workout at gym #fitness #health"          → Task: Workout at gym, Tags: fitness, health
"Meeting with John next Tuesday 2 PM"       → Task: Meeting with John, Due: Next Tuesday 2 PM
```

## 🔧 Development

### Project Structure
```
aitodo/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main app component
│   │   └── App.css        # Styles
│   └── public/            # Static files
├── server/                # Node.js backend
│   ├── index.js          # Main server file
│   └── package.json      # Server dependencies
└── package.json          # Root package file
```

### API Endpoints

- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create new task (with NLP processing)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/recommendations` - Get AI recommendations
- `POST /api/voice-to-task` - Process voice input
- `GET /api/analytics` - Get user analytics

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

1. **Voice recognition not working**
   - Ensure you're using HTTPS or localhost
   - Check browser permissions for microphone access
   - Try a different browser (Chrome recommended)

2. **MongoDB connection issues**
   - The app will fall back to in-memory storage
   - Install and start MongoDB locally if needed
   - Check the connection string in your .env file

3. **NLP not parsing correctly**
   - Try more specific language
   - Include time indicators ("tomorrow", "next week")
   - Use priority keywords ("urgent", "important")

### Browser Compatibility

- ✅ Chrome (recommended for voice features)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Voice recognition requires modern browser support

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure all dependencies are properly installed
4. Try restarting the development servers

## 🎉 What Makes This Special

This isn't just another todo app - it's a showcase of how AI can enhance everyday productivity tools:

- **Natural interaction**: Talk to your todo list like you would to a human assistant
- **Intelligent automation**: Let AI handle the boring parts (prioritization, scheduling)
- **Personalized experience**: The app learns and adapts to your habits
- **Modern technology**: Built with the latest web technologies and AI libraries

Perfect for developers wanting to learn about:
- Natural Language Processing in web apps
- Voice recognition implementation
- AI-powered user experiences
- Modern React development
- Full-stack JavaScript applications

---

**Happy task managing! 🚀**