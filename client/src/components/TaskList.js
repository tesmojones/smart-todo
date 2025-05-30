import React, { useState } from 'react';
import { Check, X, Edit3, Calendar, Flag, Clock, Tag, Plus, Search, Filter, SortAsc } from 'lucide-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, onHashtagClick }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editIsRepeating, setEditIsRepeating] = useState(false);

  const priorityColors = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  const priorityLabels = {
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low'
  };



  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `Overdue (${format(date, 'MMM d')})`;
    return format(date, 'MMM d, yyyy');
  };

  const getDueDateClass = (dueDate) => {
    if (!dueDate) return '';
    
    const date = new Date(dueDate);
    if (isPast(date)) return 'overdue';
    if (isToday(date)) return 'due-today';
    if (isTomorrow(date)) return 'due-tomorrow';
    return 'due-later';
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'completed':
        return task.completed;
      case 'pending':
        return !task.completed;
      case 'urgent':
        return task.priority === 'urgent' && !task.completed;
      case 'today':
        return task.dueDate && isToday(new Date(task.dueDate)) && !task.completed;
      default:
        return true;
    }
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // First, sort by completion status (uncompleted tasks first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then apply the selected sort criteria
    switch (sortBy) {
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const handleToggleComplete = (task) => {
    onUpdateTask(task.id, { completed: !task.completed });
  };

  const handleStartEdit = (task) => {
    setEditingTask(task.id);
    setEditTitle(task.title);
    setEditIsRepeating(task.taskType === 'repeatedly');
  };

  const handleSaveEdit = (task) => {
    if (editTitle.trim()) {
      onUpdateTask(task.id, { 
        title: editTitle.trim(),
        taskType: editIsRepeating ? 'repeatedly' : 'once'
      });
    }
    setEditingTask(null);
    setEditTitle('');
    setEditIsRepeating(false);
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditTitle('');
    setEditIsRepeating(false);
  };

  const handleKeyPress = (e, task) => {
    if (e.key === 'Enter') {
      handleSaveEdit(task);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className="modern-task-list">
      <div className="task-list-header">
        <div className="header-title">
          <h2>Your Tasks</h2>
          <span className="task-count">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
        </div>
        
        <div className="header-controls">
          <div className="control-group">
            <Filter className="control-icon" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="modern-select"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="urgent">Urgent</option>
              <option value="today">Due Today</option>
            </select>
          </div>
          
          <div className="control-group">
            <SortAsc className="control-icon" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="modern-select"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Created</option>
            </select>
          </div>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="modern-empty-state">
          <div className="empty-icon-wrapper">
            <Calendar className="empty-icon" />
          </div>
          <h3>No tasks found</h3>
          <p>Create your first task using natural language above!</p>
        </div>
      ) : (
        <div className="modern-tasks-grid">
          {sortedTasks.map((task) => (
            <div 
              key={task.id} 
              className={`modern-task-card ${task.completed ? 'completed' : ''} priority-${task.priority}`}
            >
              <div className="task-card-header">
                <div className="task-status">
                  <button
                    className={`status-toggle ${task.completed ? 'completed' : ''}`}
                    onClick={() => handleToggleComplete(task)}
                    title={task.completed ? 'Mark as pending' : 'Mark as complete'}
                  >
                    <Check className="status-icon" />
                  </button>
                </div>
                
                <div className="task-content">
                  {editingTask === task.id ? (
                    <div className="modern-edit-form">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, task)}
                        className="modern-edit-input"
                        autoFocus
                        placeholder="Enter task title..."
                      />
                      <div className="edit-actions">
                        <label className="modern-checkbox">
                          <input
                            type="checkbox"
                            checked={editIsRepeating}
                            onChange={(e) => setEditIsRepeating(e.target.checked)}
                          />
                          <span className="checkbox-label">Repeat task</span>
                        </label>
                        <div className="edit-buttons">
                          <button 
                            className="save-btn"
                            onClick={() => handleSaveEdit(task)}
                            title="Save changes"
                          >
                            <Check className="btn-icon" />
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={handleCancelEdit}
                            title="Cancel editing"
                          >
                            <X className="btn-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="task-info">
                      <h3 
                        className="modern-task-title"
                        onClick={() => handleStartEdit(task)}
                        title="Click to edit"
                      >
                        {task.title}
                      </h3>
                      
                      <div className="task-metadata">
                        <div className="metadata-row">
                          {task.dueDate && (
                            <div className={`modern-due-date ${getDueDateClass(task.dueDate)}`}>
                              <Calendar className="metadata-icon" />
                              <span>{formatDueDate(task.dueDate)}</span>
                            </div>
                          )}
                          
                          <div className={`modern-priority priority-${task.priority}`}>
                            <Flag className="metadata-icon" />
                            <span>{priorityLabels[task.priority]}</span>
                          </div>
                        </div>
                        
                        {task.tags && task.tags.length > 0 && (
                          <div className="modern-tags">
                            {task.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="modern-tag"
                                onClick={() => onHashtagClick && onHashtagClick(tag)}
                                title={`Filter by #${tag}`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="task-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleStartEdit(task)}
                    title="Edit task"
                  >
                    <Edit3 className="action-icon" />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => onDeleteTask(task.id)}
                    title="Delete task"
                  >
                    <X className="action-icon" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="modern-summary">
        <div className="summary-stats">
          <span className="stat-item">
            <span className="stat-number">{sortedTasks.filter(t => !t.completed).length}</span>
            <span className="stat-label">Pending</span>
          </span>
          <span className="stat-divider">•</span>
          <span className="stat-item">
            <span className="stat-number">{sortedTasks.filter(t => t.completed).length}</span>
            <span className="stat-label">Completed</span>
          </span>
          <span className="stat-divider">•</span>
          <span className="stat-item">
            <span className="stat-number">{sortedTasks.length}</span>
            <span className="stat-label">Total</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskList;