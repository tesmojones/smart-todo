import React, { useState, useEffect, useRef, useMemo } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { 
  Calendar, 
  Tag, 
  Save, 
  X,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  List,
  MoreVertical,
  Trash2,
  Home
} from 'lucide-react';
import TaskReport from './TaskReport';


const TaskCard = ({ task, onUpdateTask, onDeleteTask, onHashtagClick, onEdit, activeTimerTask, isTimerRunning, onStartTimer, onPauseTimer, onResumeTimer }) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return combine(
      draggable({
        element,
        getInitialData: () => ({ task }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      })
    );
  }, [task]);

  // Handle click outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const moveToNextDay = () => {
    const currentDate = new Date(task.createdAt);
    currentDate.setDate(currentDate.getDate() + 1);
    onUpdateTask(task.id, { createdAt: currentDate.toISOString() });
    setShowMenu(false);
  };

  const moveToNextWeek = () => {
    const currentDate = new Date(task.createdAt);
    currentDate.setDate(currentDate.getDate() + 7);
    onUpdateTask(task.id, { createdAt: currentDate.toISOString() });
    setShowMenu(false);
  };

  const moveToNextMonth = () => {
    const currentDate = new Date(task.createdAt);
    currentDate.setDate(currentDate.getDate() + 30);
    onUpdateTask(task.id, { createdAt: currentDate.toISOString() });
    setShowMenu(false);
  };

  const deleteTask = () => {
    onDeleteTask(task.id);
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const priorityColors = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  const getPriorityColor = (priority) => {
    return priorityColors[priority] || '#6b7280';
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return AlertTriangle;
      case 'low': return Circle;
      default: return Circle;
    }
  };

  const PriorityIcon = getPriorityIcon(task.priority);

  const isTaskDisabled = activeTimerTask && activeTimerTask.id !== task.id;

  return (
    <div
      ref={ref}
      className={`task-card ${isDragging ? 'dragging' : ''} ${task.status === 'in_progress' ? 'in-progress-task' : ''} ${isTaskDisabled ? 'task-disabled' : ''}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.8 : isTaskDisabled ? 0.5 : 1,
      }}
    >
      {task.status === 'in_progress' && (
        <div 
          className={`task-play-button ${
            activeTimerTask?.id === task.id && isTimerRunning ? 'timer-running' : 
            activeTimerTask?.id === task.id ? 'timer-paused' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            if (activeTimerTask?.id === task.id) {
              if (isTimerRunning) {
                onPauseTimer();
              } else {
                onResumeTimer();
              }
            } else {
              onStartTimer(task);
            }
          }}
        >
          {activeTimerTask?.id === task.id && isTimerRunning ? (
            <Pause size={16} className="play-icon" />
          ) : (
            <Play size={16} className="play-icon" />
          )}
        </div>
      )}
      <div className="task-content">
        <div className="task-header">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => {
                if (editTitle.trim()) {
                  onUpdateTask(task.id, { title: editTitle.trim() });
                } else {
                  setEditTitle(task.title);
                }
                setIsEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (editTitle.trim()) {
                    onUpdateTask(task.id, { title: editTitle.trim() });
                  } else {
                    setEditTitle(task.title);
                  }
                  setIsEditing(false);
                } else if (e.key === 'Escape') {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }
              }}
              className="enhanced-inline-edit"
              autoFocus
            />
          ) : (
            <h3 
              className="task-title" 
              onClick={() => setIsEditing(true)}
            >
              {task.title}
            </h3>
          )}
          
          <div className="task-menu-container" ref={menuRef}>
            <button 
              className="task-menu-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="task-menu-popup">
                <button 
                  className="task-menu-item"
                  onClick={moveToNextDay}
                >
                  Move to Next Day
                </button>
                <button 
                  className="task-menu-item"
                  onClick={moveToNextWeek}
                >
                  Move to Next Week
                </button>
                <button 
                  className="task-menu-item"
                  onClick={moveToNextMonth}
                >
                  Move to Next Month
                </button>
                <button 
                  className="task-menu-item delete-item"
                  onClick={deleteTask}
                >
                  <Trash2 size={14} />
                  Delete Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="task-meta">
        <div className="priority-due-row">
          {task.priority && (
            <div className="meta-item priority-left">
              <PriorityIcon className="meta-icon" />
              <span 
                className="priority-badge"
                style={{
                  backgroundColor: getPriorityColor(task.priority),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                {task.priority}
              </span>
            </div>
          )}

          {task.dueDate && (
            <div className="meta-item due-date-right">
              <Calendar className="meta-icon" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="meta-item">
            <Tag className="meta-icon" />
            <div className="task-tags">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="tag"
                  onClick={() => onHashtagClick && onHashtagClick(tag)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

// DropZone component for precise positioning
const DropZone = ({ columnId, index }) => {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ columnId, dropIndex: index }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [columnId, index]);

  return (
    <div
      ref={ref}
      className={`drop-zone ${isDraggedOver ? 'drop-zone-active' : ''}`}
      style={{
        height: isDraggedOver ? '40px' : '8px',
        backgroundColor: isDraggedOver ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
        border: isDraggedOver ? '2px dashed #667eea' : 'none',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        margin: '2px 0'
      }}
    />
  );
};

const KanbanColumn = ({ column, tasks, onUpdateTask, onDeleteTask, onHashtagClick, onEdit, activeTimerTask, isTimerRunning, onStartTimer, onPauseTimer, onResumeTimer }) => {
  const ref = useRef(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    return dropTargetForElements({
      element,
      getData: () => ({ columnId: column.id }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [column.id]);

  const IconComponent = column.icon;

  return (
    <div className="kanban-column">
      <div className="column-header">
        <div className="column-title">
          <IconComponent className="column-icon" />
          {column.title}
          <span className="task-count">{tasks.length}</span>
        </div>
      </div>
      <div
        ref={ref}
        className={`column-content ${isDraggedOver ? 'dragging-over' : ''}`}
      >
        {tasks.length === 0 && (
          <div className="empty-column-message">No tasks for this column on the selected date.</div>
        )}
        {tasks.map((task, index) => (
          <div key={task.id}>
            <DropZone columnId={column.id} index={index} />
            <TaskCard
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onHashtagClick={onHashtagClick}
              onEdit={onEdit}
              activeTimerTask={activeTimerTask}
              isTimerRunning={isTimerRunning}
              onStartTimer={onStartTimer}
              onPauseTimer={onPauseTimer}
              onResumeTimer={onResumeTimer}
            />
          </div>
        ))}
        <DropZone columnId={column.id} index={tasks.length} />
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, onUpdateTask, onDeleteTask, onHashtagClick, onCreateTask, onCreateTaskRegular, activeTab, setActiveTab, selectedHashtag, onClearHashtag, selectedDate, setSelectedDate }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Pomodoro timer state
  const [activeTimerTask, setActiveTimerTask] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [timerInterval, setTimerInterval] = useState(null);

  // Format date for display
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    const prevDay = new Date(selectedDate);
    prevDay.setDate(prevDay.getDate() - 1);
    setSelectedDate(prevDay);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  // Navigate to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Timer functions
  const startTimer = (task) => {
    setActiveTimerTask(task);
    setIsTimerRunning(true);
    setTimeRemaining(25 * 60); // Reset to 25 minutes
  };

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
      document.title = `${status} ${timeStr} - ${activeTimerTask.title} | AI Todo`;
    } else {
      document.title = 'AI Todo';
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      if (!activeTimerTask) {
        document.title = 'AI Todo';
      }
    };
  }, [activeTimerTask, isTimerRunning, timeRemaining]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter tasks by selected date using YYYYMMDD format (ignore timezone)
  const filterTasksByDate = (taskList) => {
    // Convert selected date to YYYYMMDD format
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const selectedDay = String(selectedDate.getDate()).padStart(2, '0');
    const selectedDateStr = `${selectedYear}${selectedMonth}${selectedDay}`;

    const filteredTasks = taskList.filter(task => {
      if (!task.createdAt) {
        console.log('❌ Task without created_at:', task.title);
        return false;
      }
      // Use the date string as-is (ignore timezone)
      const taskDate = new Date(task.createdAt);
      const taskYear = taskDate.getFullYear();
      const taskMonth = String(taskDate.getMonth() + 1).padStart(2, '0');
      const taskDay = String(taskDate.getDate()).padStart(2, '0');
      const taskDateStr = `${taskYear}${taskMonth}${taskDay}`;
      const matches = taskDateStr === selectedDateStr;
      return matches;
    });
    return filteredTasks;
  };

  // Define columns for the Kanban board
  const columns = {
    'not_started': {
      id: 'not_started',
      title: 'Not Started',
      icon: Circle,
      color: 'bg-gray-100 border-gray-300',
      headerColor: 'bg-gray-50'
    },
    'in_progress': {
      id: 'in_progress', 
      title: 'In Progress',
      icon: Play,
      color: 'bg-blue-100 border-blue-300',
      headerColor: 'bg-blue-50'
    },
    'completed': {
      id: 'completed',
      title: 'Completed', 
      icon: CheckCircle2,
      color: 'bg-green-100 border-green-300',
      headerColor: 'bg-green-50'
    }
  };

  // Set up drag and drop monitoring
  // Group tasks by status and sort by position, filtered by selected date
  const filteredTasks = filterTasksByDate(tasks);
  const tasksByStatus = useMemo(() => ({
    not_started: filteredTasks.filter(task => task.status === 'not_started').sort((a, b) => (a.position || 0) - (b.position || 0)),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress').sort((a, b) => (a.position || 0) - (b.position || 0)),
    completed: filteredTasks.filter(task => task.status === 'completed').sort((a, b) => (a.position || 0) - (b.position || 0))
  }), [filteredTasks]);

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const task = source.data.task;
        const newStatus = destination.data.columnId;
        const dropIndex = destination.data.dropIndex || 0;

        // Calculate new position based on drop location
        const tasksInColumn = tasksByStatus[newStatus] || [];
        let newPosition = dropIndex;
        
        // If moving within the same column, adjust for the task being moved
        if (task.status === newStatus) {
          const currentIndex = tasksInColumn.findIndex(t => t.id === task.id);
          if (currentIndex < dropIndex) {
            newPosition = dropIndex - 1;
          }
        }

        // Update task with new status and position
        onUpdateTask(task.id, { 
          status: newStatus,
          position: newPosition
        });
      },
    });
  }, [onUpdateTask, tasksByStatus]);

  const handleEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdateTask(editingTask, { title: editTitle.trim() });
    }
    setEditingTask(null);
    setEditTitle('');
  };

  const handleCancel = () => {
    setEditingTask(null);
    setEditTitle('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };



  return (
    <div className="kanban-container">
      {/* Active Timer Display */}
      {activeTimerTask && (
        <div className="active-timer-display">
          <div className="timer-circle">
            <div className="timer-progress" style={{
              background: `conic-gradient(#f97316 ${((25 * 60 - timeRemaining) / (25 * 60)) * 360}deg, #e5e7eb 0deg)`
            }}>
              <div className="timer-inner">
                <div className="timer-time">{formatTime(timeRemaining)}</div>
                <div className="timer-task-name">{activeTimerTask.title}</div>
                <div className="timer-controls">
                  {isTimerRunning ? (
                    <button className="timer-pause-btn" onClick={pauseTimer}>
                      <Pause size={20} />
                    </button>
                  ) : (
                    <button className="timer-play-btn" onClick={resumeTimer}>
                      <Play size={20} />
                    </button>
                  )}
                  <button className="timer-stop-btn" onClick={stopTimer}>
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="date-navigation-section">
         
        {/* Content Area - Kanban Board or Task Report */}
        {activeTab === 'tasks' ? (
          <div className="kanban-board-container">
            <div className="kanban-header-section">
              <div className="header-content">
                <div className="kanban-navigation">
                  <div className="home-section">
                    <button 
                      className="nav-button today-button" 
                      onClick={goToToday}
                      title="Go to today"
                    >
                      <Home size={18} />
                    </button>
                  </div>
                  
                  <div className="date-section">
                    <button 
                      className="nav-button" 
                      onClick={goToPreviousDay}
                      title="Previous day"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <h3 className="current-date-header">{formatDisplayDate(selectedDate)}</h3>
                    <button 
                      className="nav-button" 
                      onClick={goToNextDay}
                      title="Next day"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className="kanban-nav">
                    <button 
                      className={`nav-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tasks')}
                    >
                      <List className="nav-icon" />
                    </button>
                    <button 
                      className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
                      onClick={() => setActiveTab('report')}
                    >
                      <Calendar className="nav-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="kanban-board">
              {Object.values(columns).map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  tasks={tasksByStatus[column.id] || []}
                  onUpdateTask={onUpdateTask}
                  onDeleteTask={onDeleteTask}
                  onHashtagClick={onHashtagClick}
                  onEdit={handleEdit}
                  activeTimerTask={activeTimerTask}
                  isTimerRunning={isTimerRunning}
                  onStartTimer={startTimer}
                  onPauseTimer={pauseTimer}
                  onResumeTimer={resumeTimer}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="task-report-container">
            <TaskReport 
              tasks={tasks}
              selectedHashtag={selectedHashtag}
              onClearHashtag={onClearHashtag}
              onCreateTask={onCreateTask}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        )}
      </div>



      {/* Edit Modal */}
      {editingTask && (
        <div className="edit-overlay">
          <div className="edit-modal">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              className="modern-edit-input"
              placeholder="Enter task title..."
              autoFocus
            />
            <div className="edit-actions">
              <div className="edit-buttons">
                <button
                  onClick={handleSave}
                  className="save-btn"
                  title="Save changes"
                >
                  <Save className="btn-icon" />
                </button>
                <button
                  onClick={handleCancel}
                  className="cancel-btn"
                  title="Cancel editing"
                >
                  <X className="btn-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;