import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Sparkles, Pause, Play, X } from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import TaskInput from './components/TaskInput';
import Login from './components/Login';
import TaskReport from './components/TaskReport';
import './App.css';

const API_BASE = 'http://127.0.0.1:5001/api';

// Token management utilities
const getToken = () => localStorage.getItem('jwt_token');
const setToken = (token) => localStorage.setItem('jwt_token', token);
const removeToken = () => localStorage.removeItem('jwt_token');

// Axios interceptor to add token to requests
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Debug: Log user state changes
  useEffect(() => {
    console.log('🔍 [DEBUG] User state changed:', {
      user: user,
      hasUser: !!user,
      userType: typeof user,
      userKeys: user ? Object.keys(user) : 'N/A',
      timestamp: new Date().toISOString()
    });
  }, [user]);

  // Timer countdown effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setActiveTimerTask(null);
            return 25 * 60; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    } else if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [isTimerRunning, timeRemaining]);

  // Update document title with timer information
  useEffect(() => {
    if (activeTimerTask && (isTimerRunning || timeRemaining < 25 * 60)) {
      const timeStr = formatTime(timeRemaining);
      const status = isTimerRunning ? '⏱️' : '⏸️';
      document.title = `${status} ${timeStr} - ${activeTimerTask.title} | Tesmo Todo`;
    } else {
      document.title = 'Tesmo Todo';
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      if (!activeTimerTask) {
        document.title = 'Tesmo Todo';
      }
    };
  }, [activeTimerTask, isTimerRunning, timeRemaining]);
  
  // Debug: Log tasks state changes
  useEffect(() => {
    console.log('📋 [DEBUG] Tasks state changed:', {
      tasksType: typeof tasks,
      tasksLength: Array.isArray(tasks) ? tasks.length : 'not array',
      tasks: tasks,
      timestamp: new Date().toISOString()
    });
  }, [tasks]);
  
  // Debug: Log auth loading state changes
  useEffect(() => {
    console.log('⏳ [DEBUG] Auth loading state changed:', {
      authLoading: authLoading,
      timestamp: new Date().toISOString()
    });
  }, [authLoading]);
  


  // Check authentication status
  const checkAuth = async () => {
    console.log('🔐 [DEBUG] Starting checkAuth...');
    const token = getToken();
    console.log('🎫 [DEBUG] Current token:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'None'
    });
    
    try {
      console.log('📡 [DEBUG] Making auth request to /api/auth/user...');
      const response = await axios.get('http://127.0.0.1:5001/api/auth/user');
      console.log('✅ [DEBUG] Auth request successful:', {
        status: response.status,
        userData: response.data.user,
        hasUserData: !!response.data.user,
      });
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('❌ [DEBUG] Auth check failed:', {
        error: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      setUser(null);
      removeToken(); // Clear invalid token
      return false;
    } finally {
      console.log('🏁 [DEBUG] Setting authLoading to false');
      setAuthLoading(false);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    console.log('📋 [DEBUG] fetchTasks called');
    try {
      const response = await axios.get(`${API_BASE}/tasks`);
      console.log('📋 [DEBUG] fetchTasks response:', {
        status: response.status,
        dataType: typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'not array',
        data: response.data
      });
      setTasks(response.data);
      console.log('📋 [DEBUG] Tasks state updated');
    } catch (error) {
      console.error('❌ [DEBUG] Error fetching tasks:', error);
      if (error.response?.status === 401) {
        console.log('🚫 [DEBUG] 401 error in fetchTasks, clearing user state');
        setUser(null);
        removeToken(); // Clear invalid token
      }
    }
  };

  // Handle login
  const handleLogin = (userData) => {
    console.log('🔑 [DEBUG] handleLogin called with:', {
      userData: userData,
      hasUserData: !!userData,
      userDataType: typeof userData
    });
    setUser(userData);
    if (userData) {
      fetchTasks();
    } else {
      // Handle logout - clear token
      console.log('🚪 [DEBUG] Logging out, removing token');
      removeToken();
    }
  };

  // Timer functions
  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setActiveTimerTask(null);
    setIsTimerRunning(false);
    setTimeRemaining(25 * 60);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };





  useEffect(() => {
    console.log('🚀 [DEBUG] App useEffect starting...');
    // Check for JWT token in URL (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    console.log('🔍 [DEBUG] URL token check:', {
      hasTokenInURL: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
      currentPath: window.location.pathname,
      currentSearch: window.location.search
    });
    
    if (token) {
      console.log('💾 [DEBUG] Saving token from URL to localStorage');
      setToken(token);
      // Clean up URL and redirect to main page if on callback path
      if (window.location.pathname === '/auth/callback') {
        console.log('🔄 [DEBUG] Cleaning up callback URL');
        window.history.replaceState({}, document.title, '/');
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Handle callback path without token (redirect to main page)
    if (window.location.pathname === '/auth/callback' && !token) {
      console.log('⚠️ [DEBUG] Callback path without token, redirecting to main page');
      window.history.replaceState({}, document.title, '/');
    }
    
    // Only check auth if we have a token
    const currentToken = getToken();
    console.log('🎫 [DEBUG] Current token status:', {
      hasToken: !!currentToken,
      tokenSource: token ? 'URL' : (currentToken ? 'localStorage' : 'None')
    });
    
    if (currentToken) {
      console.log('🔐 [DEBUG] Token found, checking authentication...');
      checkAuth().then((isAuthenticated) => {
        console.log('✅ [DEBUG] Authentication check result:', { isAuthenticated });
        if (isAuthenticated) {
          console.log('🎉 [DEBUG] Authentication successful, fetching tasks...');
          fetchTasks();
          // Note: user state is already set in checkAuth function
          // No need to call handleLogin here as setUser is already called
        } else {
          console.log('❌ [DEBUG] Authentication failed');
          // handleLogin is called with null in checkAuth on failure
        }
      });
    } else {
      console.log('🚫 [DEBUG] No token found, setting authLoading to false');
      setAuthLoading(false);
    }
  }, []);



  // Create new task
  const createTask = async (input, additionalData = {}) => {
    setIsLoading(true);
    try {
      // Handle case where input is an object (from TaskInput component)
      let taskData = {};
      if (typeof input === 'object' && input !== null) {
        // Extract properties from the input object
        taskData = {
          title: input.text || input.title,
          input: input.text || input.title,
          taskType: input.taskType,
          aiEnhancements: input.aiEnhancements,
          ...input,
          ...additionalData
        };
      } else {
        // Handle case where input is a string
        taskData = {
          input,
          ...additionalData
        };
      }
      
      const response = await axios.post(`${API_BASE}/tasks`, taskData);
      setTasks(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
    setIsLoading(false);
  };

  // Create task with specific date
  const createTaskWithDate = async (input, selectedDate, additionalData = {}) => {
    setIsLoading(true);
    try {
      // Handle case where input is an object (from TaskInput component)
      let taskData = {};
      if (typeof input === 'object' && input !== null) {
        // Extract properties from the input object
        taskData = {
          title: input.text || input.title,
          input: input.text || input.title,
          taskType: input.taskType,
          aiEnhancements: input.aiEnhancements,
          createdAt: selectedDate.toISOString(),
          ...input,
          ...additionalData
        };
      } else {
        // Handle case where input is a string
        taskData = {
          input,
          createdAt: selectedDate.toISOString(),
          ...additionalData
        };
      }
      
      const response = await axios.post(`${API_BASE}/tasks`, taskData);
      setTasks(prev => [response.data, ...prev]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
    setIsLoading(false);
  };

  // Update task
  const updateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`${API_BASE}/tasks/${taskId}`, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? response.data : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Handle hashtag click - navigate to report and filter by hashtag
  const handleHashtagClick = (hashtag) => {
    setSelectedHashtag(hashtag);
    setActiveTab('report');
  };







  // Show loading while checking authentication
  if (authLoading) {
    console.log('⏳ [DEBUG] Showing auth loading screen');
    return (
      <div className="App">
        <div className="auth-loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    console.log('🔒 [DEBUG] No user found, showing login screen:', {
      user: user,
      userType: typeof user,
      authLoading: authLoading,
      hasToken: !!getToken(),
      timestamp: new Date().toISOString()
    });
    return <Login onLogin={handleLogin} />;
  }

  console.log('🎉 [DEBUG] User authenticated, showing main app:', {
    user: user,
    userId: user?.id,
    userEmail: user?.email,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon-wrapper">
              <CheckSquare className="logo-icon" />
              <Sparkles className="logo-accent" />
            </div>
            <div className="logo-text">
              <h1>Tesmo Todo</h1>
              <span className="tagline">Intelligent Task Management</span>
            </div>
          </div>
          
          <div className="header-right">
            {/* Active Timer Display */}
            {activeTimerTask && (
              <div className="active-timer-display-header">
                <div className="timer-circle-header">
                  <div className="timer-progress-header" style={{
                    background: `conic-gradient(#f97316 ${((25 * 60 - timeRemaining) / (25 * 60)) * 360}deg, #e5e7eb 0deg)`
                  }}>
                    <div className="timer-inner-header">
                      <div className="timer-time-header">{formatTime(timeRemaining)}</div>
                      <div className="timer-task-name-header">{activeTimerTask.title}</div>
                      <div className="timer-controls-header">
                        {isTimerRunning ? (
                          <button className="timer-pause-btn-header" onClick={pauseTimer}>
                            <Pause size={16} />
                          </button>
                        ) : (
                          <button className="timer-play-btn-header" onClick={resumeTimer}>
                            <Play size={16} />
                          </button>
                        )}
                        <button className="timer-stop-btn-header" onClick={stopTimer}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="timer-info-header">
                  <div className="timer-task-title-header">{activeTimerTask.title}</div>
                  <div className="timer-status-header">{isTimerRunning ? 'Running' : 'Paused'}</div>
                </div>
              </div>
            )}
            <Login onLogin={handleLogin} />
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="kanban-wrapper">
          <KanbanBoard 
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onHashtagClick={handleHashtagClick}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedHashtag={selectedHashtag}
            onClearHashtag={() => setSelectedHashtag(null)}
            onCreateTask={createTaskWithDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            activeTimerTask={activeTimerTask}
            setActiveTimerTask={setActiveTimerTask}
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            isTimerRunning={isTimerRunning}
            setIsTimerRunning={setIsTimerRunning}
          />
        </div>
      </main>

      <footer className="app-footer">
        
      </footer>
      
      {/* Task Input - positioned as floating button */}
      <TaskInput 
        onCreateTask={createTaskWithDate}
        selectedDate={selectedDate}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;