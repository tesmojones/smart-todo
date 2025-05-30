import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Brain } from 'lucide-react';
import KanbanBoard from './components/KanbanBoard';
import TaskInput from './components/TaskInput';

import TaskReport from './components/TaskReport';
import './App.css';

const API_BASE = 'http://localhost:5001/api';

function App() {
  const [tasks, setTasks] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };





  useEffect(() => {
    fetchTasks();
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
      const response = await axios.post(`${API_BASE}/tasks`, {
        input,
        ...additionalData
      });
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
      const response = await axios.post(`${API_BASE}/tasks`, {
        input,
        createdAt: selectedDate.toISOString(),
        ...additionalData
      });
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Brain className="logo-icon" />
            <h1>AI Todo</h1>
            <span className="tagline">Smart Task Management</span>
          </div>
          
          <div className="header-actions">
            {browserSupportsSpeechRecognition && (
              <button 
                className={`voice-btn ${listening ? 'listening' : ''}`}
                onClick={toggleListening}
                title={listening ? 'Stop listening' : 'Start voice input'}
              >
                {listening ? <MicOff /> : <Mic />}
                {listening ? 'Stop' : 'Voice'}
              </button>
            )}
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
          />
        </div>
      </main>

      <footer className="app-footer">
        
      </footer>
      
      {/* Task Input - positioned as floating button */}
      <TaskInput 
        onCreateTask={createTaskWithDate}
        selectedDate={new Date()}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;