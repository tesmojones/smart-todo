import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageCircle, Lightbulb, Minimize2, Maximize2, X } from 'lucide-react';

const TaskInput = ({ onCreateTask, isLoading, selectedDate }) => {
  const [input, setInput] = useState('');
  const [isRepeating, setIsRepeating] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '👋 Hi! I\'m your AI task assistant. Just tell me what you need to do and I\'ll help you create smart tasks with natural language! Use #personal or #office tags to organize your tasks.',
      timestamp: new Date()
    }
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatboxRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle click outside to close chatbox
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && chatboxRef.current && !chatboxRef.current.contains(event.target)) {
        setIsVisible(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isVisible]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setShowSuggestions(false);
    
    // Add loading message
    const loadingMessage = {
      id: Date.now() + 1,
      type: 'bot',
      content: 'Creating your task...',
      isLoading: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    try {
      // Simulate AI processing for natural language
      const processedTask = await processNaturalLanguageTask(currentInput);
      
      // Create the task with type
      const taskWithType = {
        ...processedTask,
        taskType: isRepeating ? 'repeatedly' : 'once',
        text: processedTask.text
      };
      
      if (selectedDate && typeof onCreateTask === 'function' && onCreateTask.length > 1) {
        // Use the version that accepts selectedDate
        await onCreateTask(taskWithType, selectedDate);
      } else {
        // Use the regular version
        await onCreateTask(taskWithType);
      }
      
      // Remove loading message and add success message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          id: Date.now() + 2,
          type: 'bot',
          content: `✅ Perfect! I've created your task: "${processedTask.text}"${processedTask.aiEnhancements ? ` with AI enhancements: ${processedTask.aiEnhancements}` : ''}. What's next?`,
          timestamp: new Date()
        }];
      });
    } catch (error) {
      // Remove loading message and add error message
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          id: Date.now() + 2,
          type: 'bot',
          content: 'Sorry, I had trouble creating that task. Please try again!',
          isError: true,
          timestamp: new Date()
        }];
      });
    }
  };

  // AI-powered natural language processing simulation
  const processNaturalLanguageTask = async (input) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let aiEnhancements = '';
    let processedText = input;
    
    // Simple AI enhancements simulation
    if (input.toLowerCase().includes('next week')) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      aiEnhancements = `Due date set to ${nextWeek.toLocaleDateString()}`;
    } else if (input.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      aiEnhancements = `Due date set to ${tomorrow.toLocaleDateString()}`;
    } else if (input.toLowerCase().includes('next month')) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      aiEnhancements = `Due date set to ${nextMonth.toLocaleDateString()}`;
    }
    
    if (input.toLowerCase().includes('urgent') || input.toLowerCase().includes('important')) {
      aiEnhancements += aiEnhancements ? ', Priority: High' : 'Priority: High';
    }
    
    return { text: processedText, aiEnhancements };
  };

  const suggestions = {
    personal: [
      "🛒 Buy groceries tomorrow at 5 PM",
      "📞 Call mom this weekend - important",
      "🦷 Schedule dentist appointment next week",
      "💪 Workout at gym #fitness #health",
      "☕ Buy coffee beans next month"
    ],
    office: [
      "📊 Finish project report by Friday urgent",
      "📧 Send quarterly review emails",
      "🤝 Schedule team meeting next week",
      "📋 Prepare presentation for client",
      "💻 Update project documentation"
    ]
  };

  const getCurrentSuggestions = () => {
    return suggestions.personal;
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };



  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isVisible) {
    return (
      <div className="chatbot-fab" onClick={() => setIsVisible(true)}>
        <MessageCircle className="fab-icon" />
        <div className="fab-pulse"></div>
      </div>
    );
  }

  return (
    <div ref={chatboxRef} className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chat-header">
        <div className="chat-title">
          <MessageCircle className="chat-icon" />
          <span>AI Task Assistant</span>
        </div>
        <div className="chat-controls">
          <div className="chat-status">
            <div className="status-dot"></div>
            <span>Online</span>
          </div>
          <button 
            className="control-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            className="control-btn"
            onClick={() => setIsVisible(false)}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-content">
                  {message.type === 'bot' && (
                    <div className="bot-avatar">
                      <Sparkles className="avatar-icon" />
                    </div>
                  )}
                  <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                    {message.isLoading ? (
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
      
          {showSuggestions && (
            <div className="suggestions-section">
              <div className="suggestions-header">
                <Lightbulb className="suggestions-icon" />
                <span>Try these AI-powered examples:</span>
              </div>
              <div className="suggestions-grid">
                 {getCurrentSuggestions().map((suggestion, index) => (
                   <button
                     key={index}
                     type="button"
                     className="suggestion-btn"
                     onClick={() => handleSuggestionClick(suggestion)}
                   >
                     {suggestion}
                   </button>
                 ))}
               </div>
            </div>
          )}
          
          <div className="chat-input-container">
            <div className="repeat-checkbox-container">
              <label className="repeat-checkbox-label">
                <input
                  type="checkbox"
                  checked={isRepeating}
                  onChange={(e) => setIsRepeating(e.target.checked)}
                  className="repeat-checkbox"
                />
                <span className="repeat-checkbox-text">
                  <span className="repeat-emoji">🔄</span>
                  Repetitive
                </span>
              </label>
            </div>
             
             <form onSubmit={handleSubmit} className="chat-form">
               <div className="input-wrapper">
                 <input
                   ref={inputRef}
                   type="text"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   placeholder="Tell me what you need to do... (AI-powered)"
                   className="chat-input"
                   disabled={isLoading}
                 />
                 <button 
                   type="submit" 
                   className="send-btn"
                   disabled={!input.trim() || isLoading}
                 >
                   <Send className="send-icon" />
                 </button>
               </div>
             </form>
           </div>
        </>
      )}
    </div>
  );
};

export default TaskInput;