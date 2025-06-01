import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Tag, Locate, Copy, Calendar as CalendarIcon, List } from 'lucide-react';

const TaskCalendar = ({ tasks, selectedHashtag, onClearHashtag, onCreateTask, activeTab, setActiveTab, setSelectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Filter tasks by selected hashtag if any
  const filteredTasks = selectedHashtag 
    ? tasks.filter(task => task.tags && task.tags.includes(selectedHashtag))
    : tasks;

  // Get the first day of the current month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // Get the last day of the current month
  const getLastDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfWeek = (date) => {
    return getFirstDayOfMonth(date).getDay();
  };

  // Get number of days in the month
  const getDaysInMonth = (date) => {
    return getLastDayOfMonth(date).getDate();
  };

  // Process tasks data for the calendar
  const processTasksForCalendar = useCallback(() => {
    const data = {};
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    filteredTasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      const completedDate = task.completedAt ? new Date(task.completedAt) : null;
      
      // Process created tasks
      if (createdDate.getFullYear() === year && createdDate.getMonth() === month) {
        const day = createdDate.getDate();
        if (!data[day]) {
          data[day] = { created: 0, completed: 0, createdTasks: [], completedTasks: [] };
        }
        data[day].created++;
        data[day].createdTasks.push(task.title);
      }
      
      // Process completed tasks
      if (task.completed) {
        if (completedDate) {
          // Use actual completion date if available
          if (completedDate.getFullYear() === year && completedDate.getMonth() === month) {
            const day = completedDate.getDate();
            if (!data[day]) {
              data[day] = { created: 0, completed: 0, createdTasks: [], completedTasks: [] };
            }
            data[day].completed++;
            data[day].completedTasks.push(task.title);
          }
        } else {
          // Fallback: use creation date for completed tasks without completion timestamp
          if (createdDate.getFullYear() === year && createdDate.getMonth() === month) {
            const day = createdDate.getDate();
            if (!data[day]) {
              data[day] = { created: 0, completed: 0, createdTasks: [], completedTasks: [] };
            }
            data[day].completed++;
            data[day].completedTasks.push(task.title);
          }
        }
      }
    });

    setCalendarData(data);
  }, [filteredTasks, currentDate]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Navigate to current month (today)
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle date click to navigate to task board
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(clickedDate);
    setActiveTab('tasks');
  };

  // Copy task data to clipboard
  const copyTasksToClipboard = (day, dayData) => {
    let clipboardText = '';
    
    // Add created tasks
    if (dayData.createdTasks.length > 0) {
      dayData.createdTasks.forEach((task) => {
        clipboardText += ` * ${task}\n`;
      });
    }
    
    // Add completed tasks
    if (dayData.completedTasks.length > 0) {
      dayData.completedTasks.forEach((task) => {
        clipboardText += ` * ${task}\n`;
      });
    }
    
    navigator.clipboard.writeText(clipboardText).then(() => {
      console.log('Tasks copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy tasks to clipboard:', err);
    });
  };

  // Handle adding task for specific day
  const handleAddTaskForDay = (day) => {
    setSelectedDay(day);
    setShowTaskInput(true);
    setTaskInput('');
  };

  // Handle task creation
  const handleCreateTask = async () => {
    if (!taskInput.trim() || !selectedDay) return;
    
    setIsLoading(true);
    try {
      // Create date for the selected day
      const taskDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
      taskDate.setTime(taskDate.getTime() + (12 * 60 * 60 * 1000)); // Set to noon to avoid timezone issues
      
      if (onCreateTask) {
        await onCreateTask(taskInput, taskDate);
      }
      
      setTaskInput('');
      setShowTaskInput(false);
      setSelectedDay(null);
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateTask();
    }
    if (e.key === 'Escape') {
      setShowTaskInput(false);
      setSelectedDay(null);
      setTaskInput('');
    }
  };

  // Format month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDayOfWeek = getFirstDayOfWeek(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = calendarData[day] || { created: 0, completed: 0, createdTasks: [], completedTasks: [] };
      const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      const hasTasks = dayData.createdTasks.length > 0 || dayData.completedTasks.length > 0;
      
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <div className="day-header">
            <div className="day-number clickable" onClick={() => handleDateClick(day)}>{day}</div>
            <div className="day-actions">
              {hasTasks && (
                <button 
                  className="copy-tasks-btn"
                  onClick={() => copyTasksToClipboard(day, dayData)}
                  title="Copy tasks to clipboard"
                >
                  <Copy size={12} />
                </button>
              )}
              <button 
                className="add-task-btn"
                onClick={() => handleAddTaskForDay(day)}
                title="Add task for this day"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
          <div className="day-data">
            {dayData.createdTasks.length > 0 && (
              <div className="task-titles created-titles">
                {dayData.createdTasks.map((title, index) => (
                  <div key={`created-${index}`} className="task-title created-task" title={title}>
                    + {title.length > 15 ? title.substring(0, 15) + '...' : title}
                  </div>
                ))}
              </div>
            )}
            {dayData.completedTasks.length > 0 && (
              <div className="task-titles completed-titles">
                {dayData.completedTasks.map((title, index) => (
                  <div key={`completed-${index}`} className="task-title completed-task" title={title}>
                    ✓ {title.length > 15 ? title.substring(0, 15) + '...' : title}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  useEffect(() => {
    processTasksForCalendar();
  }, [processTasksForCalendar]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="task-report">
      <div className="report-header">
        <div className="header-content">
          {selectedHashtag && (
            <div className="hashtag-filter">
              <Tag size={16} />
              <span>#{selectedHashtag}</span>
              <button 
                onClick={onClearHashtag}
                className="clear-filter-btn"
                title="Clear hashtag filter"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="calendar-navigation">
            <div className="home-section">
              <button onClick={goToToday} className="nav-button today-button" title="Go to current month">
                <Locate size={18} />
              </button>
            </div>
            <div className="date-section">
              <button onClick={goToPreviousMonth} className="nav-button">
                <ChevronLeft size={20} />
              </button>
              <h3 className="current-month">{formatMonthYear(currentDate)}</h3>
              <button onClick={goToNextMonth} className="nav-button">
                <ChevronRight size={20} />
              </button>
            </div>
            
          </div>
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <Plus size={14} className="legend-icon created" />
          <span>Tasks Created</span>
        </div>
        <div className="legend-item">
          <Check size={14} className="legend-icon completed" />
          <span>Tasks Completed</span>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          {weekDays.map(day => (
            <div key={day} className="weekday-header">{day}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {generateCalendarDays()}
        </div>
      </div>

      {/* Task Input Modal */}
      {showTaskInput && (
        <div className="task-input-overlay">
          <div className="task-input-modal">
            <div className="modal-header">
              <h3>Add Task for {formatMonthYear(currentDate)} {selectedDay}</h3>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowTaskInput(false);
                  setSelectedDay(null);
                  setTaskInput('');
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-content">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter your task... (e.g., 'Buy groceries at 5 PM urgent #personal')"
                className="task-input-field"
                autoFocus
                rows={3}
              />
              <div className="modal-actions">
                <button 
                  className="create-task-btn"
                  onClick={handleCreateTask}
                  disabled={!taskInput.trim() || isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Task'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setShowTaskInput(false);
                    setSelectedDay(null);
                    setTaskInput('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;