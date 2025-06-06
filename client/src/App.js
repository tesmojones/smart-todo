import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Sparkles, Pause, Play, X } from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import TaskInput from './components/TaskInput';
import Login from './components/Login';
import Settings from './components/Settings';
import TabbedNavigation from './components/TabbedNavigation';
import { API_BASE, API_ENDPOINTS } from './config/api';
import './App.css';

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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  


  // Function to play tick sound
  const playTickSound = () => {
    try {
      // Create audio context for classic clock tick sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();
      
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure classic clock tick - sharp, high-pitched click
      oscillator.frequency.setValueAtTime(3000, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.01);
      oscillator.type = 'square';
      
      // High-pass filter for crisp tick sound
      filterNode.type = 'highpass';
      filterNode.frequency.setValueAtTime(1000, audioContext.currentTime);
      filterNode.Q.setValueAtTime(5, audioContext.currentTime);
      
      // Very sharp attack and immediate decay for classic "tik" sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.001);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.02);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.02);
    } catch (error) {
      // Silently fail if audio context is not supported
      console.log('Audio not supported:', error);
    }
  };

  // Timer countdown effect
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      const interval = setInterval(() => {
        // Play tick sound only in the last minute (60 seconds)
        if (timeRemaining <= 60) {
          playTickSound();
        }
        
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
    } else {
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
  


  // Listen for settings open event from dropdown
  useEffect(() => {
    const handleOpenSettings = () => {
      setShowSettingsModal(true);
    };

    window.addEventListener('openSettings', handleOpenSettings);
    return () => {
      window.removeEventListener('openSettings', handleOpenSettings);
    };
  }, []);
  


  // Check authentication status
  const checkAuth = async () => {
    const token = getToken();
    
    try {
      const response = await axios.get(API_ENDPOINTS.AUTH.USER);
      setUser(response.data.user);
      return true;
    } catch (error) {
      setUser(null);
      removeToken(); // Clear invalid token
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`);
      setTasks(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        removeToken(); // Clear invalid token
      }
    }
  };

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    if (userData) {
      fetchTasks();
    } else {
      // Handle logout - clear token
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
    // Check for JWT token in URL (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setToken(token);
      // Clean up URL and redirect to main page if on callback path
      if (window.location.pathname === '/auth/callback') {
        window.history.replaceState({}, document.title, '/');
      } else {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Handle callback path without token (redirect to main page)
    if (window.location.pathname === '/auth/callback' && !token) {
      window.history.replaceState({}, document.title, '/');
    }
    
    // Only check auth if we have a token
    const currentToken = getToken();
    
    if (currentToken) {
      checkAuth().then((isAuthenticated) => {
        if (isAuthenticated) {
          fetchTasks();
          // Note: user state is already set in checkAuth function
          // No need to call handleLogin here as setUser is already called
        }
      });
    } else {
      setAuthLoading(false);
    }
  }, []);

 
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

  // Handle hashtag click - navigate to calendar and filter by hashtag
  const handleHashtagClick = (hashtag) => {
    setSelectedHashtag(hashtag);
    setActiveTab('reports');
  };







  // Show loading while checking authentication
  if (authLoading) {

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

    return <Login onLogin={handleLogin} />;
  }



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
          
          {/* Centered Timer Display */}
          <div className="header-center">
            {activeTimerTask && (
              <div className="timer-content-header">
                <div className="timer-main-display">
                  <div className="timer-countdown-large">{formatTime(timeRemaining)}</div>
                  <div className="timer-task-info">
                    <div className="timer-task-title-large">{activeTimerTask.title}</div>
                    <div className="timer-status-indicator">
                      <div className={`timer-status-dot ${isTimerRunning ? 'running' : 'paused'}`}></div>
                      <span className="timer-status-text">{isTimerRunning ? 'Running' : 'Paused'}</span>
                    </div>
                  </div>
                </div>
                <div className="timer-controls-modern">
                  {isTimerRunning ? (
                     <button className="timer-btn-modern timer-pause" onClick={pauseTimer}>
                       <Pause size={18} />
                     </button>
                   ) : (
                     <button className="timer-btn-modern timer-play" onClick={resumeTimer}>
                       <Play size={18} />
                     </button>
                   )}
                   <button className="timer-btn-modern timer-stop" onClick={stopTimer}>
                     <X size={18} />
                   </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="header-right">
            {/* Tabbed Navigation */}
            <TabbedNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
            <Login onLogin={handleLogin} />
          </div>
        </div>
      </header>

      <main className="app-main">
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
          user={user}
          onLogout={() => handleLogin(null)}
        />
      </main>

      <footer className="app-footer">
        
      </footer>
      
      {/* Task Input - positioned as floating button */}
      <TaskInput 
        onCreateTask={createTaskWithDate}
        selectedDate={selectedDate}
        isLoading={isLoading}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
            
            <div className="modal-body">
              <Settings 
                user={user}
                onUpdateUser={(updatedUser) => setUser(updatedUser)}
                onLogout={() => {
                  handleLogin(null);
                  setShowSettingsModal(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;