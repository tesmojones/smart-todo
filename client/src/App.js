import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Brain } from 'lucide-react';
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
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

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

  // Handle voice input
  const handleVoiceInput = async () => {
    if (!transcript) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/voice-to-task`, {
        transcript: transcript
      });
      
      if (response.data.success) {
        // Create task from voice input
        await createTask(response.data.taskData.title, {
          input: transcript,
          ...response.data.taskData
        });
        resetTranscript();
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
    }
    setIsLoading(false);
  };

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



  // Start/stop voice recognition
  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      if (transcript) {
        handleVoiceInput();
      }
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    console.warn('Browser does not support speech recognition.');
  }

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
            <Brain className="logo-icon" />
            <h1>AI Todo</h1>
            <span className="tagline">Smart Task Management</span>
          </div>
          
          <div className="header-right">
            <div className="voice-controls">
              {browserSupportsSpeechRecognition ? (
                <>
                  <button 
                    className={`voice-btn ${listening ? 'listening' : ''}`}
                    onClick={listening ? SpeechRecognition.stopListening : SpeechRecognition.startListening}
                    disabled={isLoading}
                  >
                    {listening ? <MicOff size={20} /> : <Mic size={20} />}
                    {listening ? 'Stop' : 'Voice'}
                  </button>
                </>
              ) : (
                <span className="voice-not-supported">Voice not supported</span>
              )}
            </div>
            
            {/* User info */}
            <Login onLogin={handleLogin} />
          </div>
        </div>
        
        {transcript && (
          <div className="voice-transcript">
            <span className="transcript-label">Voice Input:</span>
            <span className="transcript-text">"{transcript}"</span>
            {!listening && (
              <button 
                className="process-voice-btn"
                onClick={handleVoiceInput}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Add Task'}
              </button>
            )}
          </div>
        )}
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