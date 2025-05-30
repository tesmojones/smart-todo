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
  ChevronLeft,
  ChevronRight,
  List,
  MoreVertical,
  Trash2,
  Home
} from 'lucide-react';
import TaskReport from './TaskReport';


const TaskCard = ({ task, onUpdateTask, onDeleteTask, onHashtagClick, onEdit }) => {
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

  return (
    <div
      ref={ref}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.8 : 1,
      }}
    >
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

const KanbanColumn = ({ column, tasks, onUpdateTask, onDeleteTask, onHashtagClick, onEdit }) => {
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
            />
          </div>
        ))}
        <DropZone columnId={column.id} index={tasks.length} />
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, onUpdateTask, onDeleteTask, onHashtagClick, onCreateTask, onCreateTaskRegular, activeTab, setActiveTab, selectedHashtag, onClearHashtag }) => {
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

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
      <div className="kanban-header">
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
        <div className="date-navigation">
          <button 
            className="date-nav-btn today-btn" 
            onClick={goToToday}
            title="Go to today"
          >
            <Home size={18} />
          </button>
          <button 
            className="date-nav-btn" 
            onClick={goToPreviousDay}
            title="Previous day"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="current-date">
            {formatDisplayDate(selectedDate)}
          </div>
          <button 
            className="date-nav-btn" 
            onClick={goToNextDay}
            title="Next day"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>



      {/* Content Area - Kanban Board or Task Report */}
      {activeTab === 'tasks' ? (
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
            />
          ))}
        </div>
      ) : (
        <div className="task-report-container">
          <TaskReport 
            tasks={tasks}
            selectedHashtag={selectedHashtag}
            onClearHashtag={onClearHashtag}
            onCreateTask={onCreateTask}
          />
        </div>
      )}



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