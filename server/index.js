const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const natural = require('natural');
const compromise = require('compromise');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const OpenAI = require('openai');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Simple date parsing function as fallback
const parseDate = (text) => {
  const datePatterns = [
    { pattern: /tomorrow/i, offset: 1 },
    { pattern: /today/i, offset: 0 },
    { pattern: /next week/i, offset: 7 },
    { pattern: /this weekend/i, offset: 5 },
    { pattern: /friday/i, offset: 5 },
    { pattern: /monday/i, offset: 1 },
    { pattern: /tuesday/i, offset: 2 },
    { pattern: /wednesday/i, offset: 3 },
    { pattern: /thursday/i, offset: 4 },
    { pattern: /saturday/i, offset: 6 },
    { pattern: /sunday/i, offset: 7 }
  ];
  
  for (const { pattern, offset } of datePatterns) {
    if (pattern.test(text)) {
      return moment().add(offset, 'days').toDate();
    }
  }
  
  // Try to parse specific date formats
  const timeMatch = text.match(/(\d{1,2})\s*(pm|am)/i);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]);
    const isPM = timeMatch[2].toLowerCase() === 'pm';
    const adjustedHour = isPM && hour !== 12 ? hour + 12 : hour;
    return moment().hour(adjustedHour).minute(0).toDate();
  }
  
  return null;
};
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Middleware
app.use(cors({
  origin: 'http://127.0.0.1:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  name: 'connect.sid', // Explicit session name
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true, // Changed to true to ensure session persistence
  saveUninitialized: true, // Changed to true to create sessions
  rolling: false, // Don't refresh on each request
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    path: '/',
    httpOnly: false // Allow client-side access for debugging
  }
}));

// Debug middleware to log session info
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  console.log('Is authenticated:', req.isAuthenticated ? req.isAuthenticated() : false);
  next();
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database table
const initDatabase = async () => {
  try {
    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        due_date TIMESTAMP,
        priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        completed BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        is_repetitive INTEGER DEFAULT 0 CHECK (is_repetitive IN (0, 1)),
        next_occurrence TIMESTAMP,
        position INTEGER DEFAULT 0,
        user_id VARCHAR(255)
      )
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        picture VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add completed_at column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
      `);
    } catch (alterError) {
      // Column might already exist, ignore error
    }
    

    
    // Add is_repetitive column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_repetitive INTEGER DEFAULT 0 CHECK (is_repetitive IN (0, 1));
      `);
    } catch (alterError) {
      // Column might already exist, ignore error
    }
    
    // Migrate existing task_type data to is_repetitive
    try {
      await pool.query(`
        UPDATE tasks SET is_repetitive = CASE 
          WHEN task_type = 'repeatedly' THEN 1 
          ELSE 0 
        END 
        WHERE task_type IS NOT NULL;
      `);
    } catch (migrateError) {
      // Migration might fail if task_type doesn't exist, ignore error
    }
    
    // Drop old task_type column if it exists
    try {
      await pool.query(`
        ALTER TABLE tasks DROP COLUMN IF EXISTS task_type;
      `);
    } catch (dropError) {
      // Column might not exist, ignore error
    }
    
    // Drop description column if it exists (no longer needed)
    try {
      await pool.query(`
        ALTER TABLE tasks DROP COLUMN IF EXISTS description;
      `);
    } catch (dropError) {
      // Column might not exist, ignore error
    }
    
    // Drop category column if it exists (no longer needed)
    try {
      await pool.query(`
        ALTER TABLE tasks DROP COLUMN IF EXISTS category;
      `);
    } catch (dropError) {
      // Column might not exist, ignore error
    }
    
    // Drop original_input column if it exists (no longer needed)
    try {
      await pool.query(`
        ALTER TABLE tasks DROP COLUMN IF EXISTS original_input;
      `);
    } catch (dropError) {
      // Column might not exist, ignore error
    }
    
    // Add status column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed'));
      `);
    } catch (alterError) {
      // Column might already exist, ignore error
    }
    
    // Add next_occurrence column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_occurrence TIMESTAMP;
      `);
    } catch (alterError) {
      // Column might already exist, ignore error
    }
    
    // Add position column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
      `);
    } catch (alterError) {
      // Column might already exist, ignore error
    }

    // Add user_id column if it doesn't exist (for existing databases)
    try {
      await pool.query(`
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id VARCHAR(255);
      `);
    } catch (alterError) {
      // Column might already exist, ignore error
    }
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.log('Database initialization failed, using in-memory storage:', err.message);
  }
};

// Initialize database on startup
initDatabase();

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE google_id = $1',
      [profile.id]
    );

    if (existingUser.rows.length > 0) {
      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE google_id = $1',
        [profile.id]
      );
      return done(null, existingUser.rows[0]);
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      google_id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value
    };

    await pool.query(
      'INSERT INTO users (id, google_id, email, name, picture) VALUES ($1, $2, $3, $4, $5)',
      [newUser.id, newUser.google_id, newUser.email, newUser.name, newUser.picture]
    );

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
}));

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Recurring task management
const createRecurringTask = async (originalTask) => {
  try {
    const newTask = {
      id: uuidv4(),
      title: originalTask.title,
      dueDate: originalTask.dueDate,
      priority: originalTask.priority,
      isRepetitive: 1,
      completed: false,
      tags: originalTask.tags || [],
      createdAt: new Date(),
      nextOccurrence: new Date(Date.now() + 24 * 60 * 60 * 1000) // Next day
    };

    await pool.query(
      'INSERT INTO tasks (id, title, due_date, priority, completed, tags, created_at, is_repetitive, next_occurrence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [newTask.id, newTask.title, newTask.dueDate, newTask.priority, newTask.completed, newTask.tags, newTask.createdAt, newTask.isRepetitive, newTask.nextOccurrence]
    );
    
    console.log(`Created recurring task: ${newTask.title}`);
    return newTask;
  } catch (error) {
    console.error('Error creating recurring task:', error);
  }
};

// Check and create recurring tasks
const processRecurringTasks = async () => {
  try {
    const now = new Date();
    const result = await pool.query(
      'SELECT * FROM tasks WHERE is_repetitive = $1 AND next_occurrence <= $2',
      [1, now]
    );
    
    for (const task of result.rows) {
      // Create new instance of the recurring task
      await createRecurringTask({
        title: task.title,
        dueDate: task.due_date,
        priority: task.priority,
        tags: task.tags
      });
      
      // Update the next occurrence for the original task
      const nextOccurrence = new Date(task.next_occurrence);
      nextOccurrence.setDate(nextOccurrence.getDate() + 1);
      
      await pool.query(
        'UPDATE tasks SET next_occurrence = $1 WHERE id = $2',
        [nextOccurrence, task.id]
      );
    }
  } catch (error) {
    console.error('Error processing recurring tasks:', error);
  }
};

// Run recurring task check every hour
setInterval(processRecurringTasks, 60 * 60 * 1000);

// Also run on startup after a short delay
setTimeout(processRecurringTasks, 5000);

// In-memory storage fallback
let tasks = [];
let userPatterns = {
  commonTasks: {},
  timePatterns: {},
  priorityKeywords: ['urgent', 'important', 'asap', 'critical', 'high priority']
};

// AI Helper Functions
class AITaskProcessor {
  static async parseWithOpenAI(input) {
    if (!openai) {
      console.log('OpenAI not configured, falling back to basic parsing');
      return this.parseNaturalLanguage(input);
    }

    try {
      const prompt = `Parse this task input and extract structured information. Return a JSON object with these fields:
- title: Clean task title (remove date/time references)
- priority: one of "low", "medium", "high", "urgent"
- dueDate: ISO date string if mentioned, null otherwise
- tags: array of hashtags without # symbol
- createdAt: ISO date string for when task should be created (e.g., if "tomorrow" then tomorrow's date)

Input: "${input}"

Current date/time: ${new Date().toISOString()}

Return only valid JSON:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 200
      });

      const result = JSON.parse(response.choices[0].message.content.trim());
      
      // Validate and clean the result
      return {
        title: result.title || input,
        dueDate: result.dueDate ? new Date(result.dueDate) : null,
        priority: ['low', 'medium', 'high', 'urgent'].includes(result.priority) ? result.priority : 'medium',
        tags: Array.isArray(result.tags) ? result.tags : [],
        createdAt: result.createdAt ? new Date(result.createdAt) : new Date()
      };
    } catch (error) {
      console.error('OpenAI parsing failed:', error);
      return this.parseNaturalLanguage(input);
    }
  }

  static parseNaturalLanguage(input) {
    // Ensure input is a string
    const inputText = typeof input === 'string' ? input : String(input || '');
    
    if (!inputText.trim()) {
      return {
        title: inputText,
        dueDate: null,
        priority: 'medium',
        tags: [],
        createdAt: new Date()
      };
    }
    
    const doc = compromise(inputText);
    const dueDate = parseDate(inputText);
    
    // Extract task title
    let title = inputText;
    if (dueDate) {
      // Remove common date phrases from title
      title = title.replace(/\b(tomorrow|today|next week|this weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\s*(pm|am))\b/gi, '').trim();
    }
    
    // Extract priority
    let priority = 'medium';
    if (/urgent|important|asap|critical/i.test(inputText)) {
      priority = 'high';
    } else if (/low|later|someday/i.test(inputText)) {
      priority = 'low';
    }
    
    // Extract tags
    const tags = [];
    const tagMatches = inputText.match(/#\w+/g);
    if (tagMatches) {
      tags.push(...tagMatches.map(tag => tag.substring(1)));
    }
    
    // Clean title
    title = title.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
    
    // Determine createdAt based on input
    let createdAt = new Date();
    if (/tomorrow/i.test(inputText)) {
      createdAt = moment().add(1, 'day').toDate();
    } else if (/next week/i.test(inputText)) {
      createdAt = moment().add(1, 'week').toDate();
    } else if (/next month/i.test(inputText)) {
      createdAt = moment().add(1, 'month').toDate();
    }
    
    return {
      title: title || 'New Task',
      dueDate,
      priority,
      tags,
      createdAt
    };
  }
  

  
  static generateRecommendations(userPatterns) {
    const recommendations = [];
    const today = moment().format('dddd').toLowerCase();
    
    // Day-based recommendations
    const dayPatterns = {
      monday: ['Plan week', 'Review goals', 'Workout'],
      friday: ['Weekly review', 'Clean desk', 'Plan weekend'],
      sunday: ['Meal prep', 'Plan next week', 'Relax']
    };
    
    if (dayPatterns[today]) {
      dayPatterns[today].forEach(task => {
        recommendations.push({
          title: task,
          reason: `You often do this on ${today}s`,
          confidence: 0.8
        });
      });
    }
    
    // Time-based recommendations
    const hour = moment().hour();
    if (hour >= 9 && hour <= 11) {
      recommendations.push({
        title: 'Check emails',
        reason: 'Good time for morning tasks',
        confidence: 0.7
      });
    }
    
    return recommendations.slice(0, 3); // Return top 3
  }
}

// Authentication Routes

// Google OAuth login
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://127.0.0.1:3000/login' }),
  (req, res) => {
    // User is already authenticated by passport.authenticate
    // Just save the session and redirect
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error:', saveErr);
        return res.redirect('http://127.0.0.1:3000/login');
      }
      
      console.log('User successfully authenticated:', req.user);
      console.log('Session after login:', req.session);
      
      // Successful authentication, redirect to frontend
      res.redirect('http://127.0.0.1:3000');
    });
  }
);

// Logout
app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Get current user
app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture
      }
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Routes

// Get all tasks
app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    let allTasks;
    try {
      const result = await pool.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY status, position ASC, created_at DESC', [req.user.id]);
      allTasks = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        dueDate: row.due_date,
        priority: row.priority,
        completed: row.completed,
        status: row.status || 'not_started',
        tags: row.tags || [],
        createdAt: row.created_at,
        completedAt: row.completed_at,
        taskType: row.is_repetitive === 1 ? 'repeatedly' : 'once',
        nextOccurrence: row.next_occurrence,
        position: row.position || 0
      }));
    } catch (dbError) {
      console.log('Database query failed, using in-memory storage');
      allTasks = tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(allTasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create task with AI processing
app.post('/api/tasks', requireAuth, async (req, res) => {
  console.log('\n=== TASK CREATION DEBUG START ===');
  console.log('Request timestamp:', new Date().toISOString());
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  
  try {
    const { input, title, dueDate, priority, text, taskType } = req.body;
    console.log('Extracted fields:', { input, title, dueDate, priority, text, taskType });
    
    // Extract taskType from input object if it exists there
    let actualTaskType = taskType;
    if (input && typeof input === 'object' && input.taskType) {
      actualTaskType = input.taskType;
      console.log('TaskType extracted from input object:', actualTaskType);
    }
    console.log('Final taskType:', actualTaskType);
    
    let taskData;
    if (input) {
      // Handle both string input and object with text property
      const inputText = typeof input === 'string' ? input : (input.text || text || '');
      console.log('Processing input text:', inputText);
      
      if (inputText) {
        console.log('Using AI to parse natural language input...');
        // Use AI to parse natural language input with OpenAI
        taskData = await AITaskProcessor.parseWithOpenAI(inputText);
        console.log('AI parsing result:', JSON.stringify(taskData, null, 2));
      } else {
        console.log('No input text found, using fallback structured data');
        // Fallback to structured data
        taskData = { title: title || 'New Task', dueDate, priority: priority || 'medium', tags: [], createdAt: new Date() };
        console.log('Fallback taskData:', JSON.stringify(taskData, null, 2));
      }
    } else if (text) {
      console.log('Processing direct text input:', text);
      // Handle direct text input from frontend
      taskData = await AITaskProcessor.parseWithOpenAI(text);
      console.log('AI parsing result for direct text:', JSON.stringify(taskData, null, 2));
    } else {
      console.log('Using provided structured data');
      // Use provided structured data
      taskData = { title, dueDate, priority: priority || 'medium', tags: [], createdAt: new Date() };
      console.log('Structured taskData:', JSON.stringify(taskData, null, 2));
    }
    
    // Calculate next occurrence for recurring tasks
    let nextOccurrence = null;
    const isRepetitive = actualTaskType === 'repeatedly' ? 1 : 0;
    console.log('Is repetitive task:', isRepetitive);
    
    if (isRepetitive === 1) {
      nextOccurrence = new Date();
      nextOccurrence.setDate(nextOccurrence.getDate() + 1); // Next day
      console.log('Next occurrence calculated:', nextOccurrence.toISOString());
    }
    
    const newTask = {
      id: uuidv4(),
      ...taskData,
      isRepetitive,
      nextOccurrence,
      completed: false,
      status: 'not_started',
      createdAt: taskData.createdAt || (req.body.createdAt ? new Date(req.body.createdAt) : new Date()),
    };
    
    console.log('Final task object before database insert:', JSON.stringify(newTask, null, 2));
    
    try {
      console.log('Attempting database insert...');
      const insertQuery = 'INSERT INTO tasks (id, title, due_date, priority, completed, status, tags, created_at, is_repetitive, next_occurrence, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';
      const insertValues = [newTask.id, newTask.title, newTask.dueDate, newTask.priority, newTask.completed, newTask.status, newTask.tags, newTask.createdAt, newTask.isRepetitive, newTask.nextOccurrence, req.user.id];
      
      console.log('SQL Query:', insertQuery);
      console.log('SQL Values:', insertValues);
      
      await pool.query(insertQuery, insertValues);
      console.log('Database insert successful!');
      
      console.log('Sending response to client:', JSON.stringify(newTask, null, 2));
      res.json(newTask);
    } catch (dbError) {
      console.error('Database insert failed:', dbError.message);
      console.error('Database error stack:', dbError.stack);
      console.log('Falling back to in-memory storage');
      tasks.push(newTask);
      console.log('In-memory storage updated. Total tasks:', tasks.length);
      res.json(newTask);
    }
    
    // Update user patterns
    const taskKeyword = newTask.title.toLowerCase().split(' ')[0];
    userPatterns.commonTasks[taskKeyword] = (userPatterns.commonTasks[taskKeyword] || 0) + 1;
    console.log('User patterns updated. Task keyword:', taskKeyword);
    console.log('Updated common tasks:', userPatterns.commonTasks);
    
    console.log('=== TASK CREATION DEBUG END ===\n');
    
  } catch (error) {
    console.error('\n=== TASK CREATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body that caused error:', JSON.stringify(req.body, null, 2));
    console.error('=== TASK CREATION ERROR END ===\n');
    res.status(500).json({ error: error.message });
  }
});

// Update task
app.put('/api/tasks/:id', requireAuth, async (req, res) => {
  console.log('Received PUT request to update task with ID:', req.params.id);
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Sync status and completed fields
    if (updates.status === 'completed') {
      updates.completed = true;
      updates.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'completed') {
      updates.completed = false;
      updates.completedAt = null;
    }
    
    // If task is being marked as completed via completed field, update status
    if (updates.completed === true) {
      updates.status = 'completed';
      updates.completedAt = new Date().toISOString();
    } else if (updates.completed === false) {
      updates.status = updates.status || 'not_started';
      updates.completedAt = null;
    }
    
    // If title is being updated, extract hashtags and update tags
    if (updates.title) {
      const tagMatches = updates.title.match(/#\w+/g);
      if (tagMatches) {
        updates.tags = tagMatches.map(tag => tag.substring(1));
        // Clean title by removing hashtags
        updates.title = updates.title.replace(/#\w+/g, '').replace(/\s+/g, ' ').trim();
      } else {
        // If no hashtags found, clear tags
        updates.tags = [];
      }
    }
    console.log(updates);
    
    // Handle position updates for reordering within columns
    if (updates.hasOwnProperty('position') && updates.hasOwnProperty('status')) {
      try {
        // Get all tasks in the target column
        const columnTasks = await pool.query(
          'SELECT id, position FROM tasks WHERE status = $1 ORDER BY position ASC',
          [updates.status]
        );
        
        // Reorder positions
        const targetPosition = updates.position;
        const taskId = id;
        
        // Update positions of other tasks in the column
        for (let i = 0; i < columnTasks.rows.length; i++) {
          const task = columnTasks.rows[i];
          if (task.id !== taskId) {
            let newPosition = i;
            if (i >= targetPosition) {
              newPosition = i + 1;
            }
            await pool.query(
              'UPDATE tasks SET position = $1 WHERE id = $2',
              [newPosition, task.id]
            );
          }
        }
      } catch (positionError) {
        console.log('Position update failed:', positionError);
      }
    }
    
    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramCount = 1;
      
      Object.keys(updates).forEach(key => {
        const dbField = key === 'dueDate' ? 'due_date' : 
                       key === 'createdAt' ? 'created_at' : 
                       key === 'completedAt' ? 'completed_at' : 
                       key === 'taskType' ? 'is_repetitive' : key;
        
        let value = updates[key];
        if (key === 'taskType') {
          value = value === 'repeatedly' ? 1 : 0;
        }
        
        updateFields.push(`${dbField} = $${paramCount}`);
        values.push(value);
        paramCount++;
      });
      
      values.push(id); // Add id as parameter
      values.push(req.user.id); // Add user_id as last parameter
      
      const result = await pool.query(
        `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = $${paramCount} AND user_id = $${paramCount + 1} RETURNING *`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      const updatedTask = {
        id: result.rows[0].id,
        title: result.rows[0].title,
        dueDate: result.rows[0].due_date,
        priority: result.rows[0].priority,
        completed: result.rows[0].completed,
        status: result.rows[0].status || 'not_started',
        tags: result.rows[0].tags || [],
        createdAt: result.rows[0].created_at,
        completedAt: result.rows[0].completed_at,
        taskType: result.rows[0].is_repetitive === 1 ? 'repeatedly' : 'once',
        nextOccurrence: result.rows[0].next_occurrence,
        position: result.rows[0].position || 0
      };
      
      res.json(updatedTask);
    } catch (dbError) {
      console.log('Database update failed, using in-memory storage');
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      res.json(tasks[taskIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *', [id, req.user.id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (dbError) {
      console.log('Database delete failed, using in-memory storage');
      const taskIndex = tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });
      tasks.splice(taskIndex, 1);
      res.json({ message: 'Task deleted successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get AI recommendations
app.get('/api/recommendations', requireAuth, (req, res) => {
  try {
    const recommendations = AITaskProcessor.generateRecommendations(userPatterns);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Process voice input
app.post('/api/voice-to-task', requireAuth, (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'No transcript provided' });
    }
    
    const taskData = AITaskProcessor.parseNaturalLanguage(transcript);

    
    res.json({
      success: true,
      taskData,
      message: 'Voice input processed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user patterns and analytics
app.get('/api/analytics', async (req, res) => {
  try {
    let analytics;
    try {
      const totalResult = await pool.query('SELECT COUNT(*) FROM tasks');
      const completedResult = await pool.query('SELECT COUNT(*) FROM tasks WHERE completed = true');
      const pendingResult = await pool.query('SELECT COUNT(*) FROM tasks WHERE completed = false');
      
      analytics = {
        userPatterns,
        totalTasks: parseInt(totalResult.rows[0].count),
        completedTasks: parseInt(completedResult.rows[0].count),
        pendingTasks: parseInt(pendingResult.rows[0].count)
      };
    } catch (dbError) {
      console.log('Database analytics query failed, using in-memory storage');
      analytics = {
        userPatterns,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.completed).length,
        pendingTasks: tasks.filter(t => !t.completed).length
      };
    }
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});