import React from 'react';
import { BarChart3, TrendingUp, Clock, Target, Brain, RefreshCw, Calendar, Flag } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const Analytics = ({ analytics, tasks, onRefresh }) => {
  if (!analytics) {
    return (
      <div className="analytics-container">
        <div className="analytics-header">
          <h2>
            <BarChart3 className="section-icon" />
            Analytics & Insights
          </h2>
          <button className="refresh-btn" onClick={onRefresh}>
            <RefreshCw className="btn-icon" />
            Refresh
          </button>
        </div>
        <div className="loading-state">
          <Brain className="loading-icon" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate additional metrics
  const completionRate = analytics.totalTasks > 0 
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) 
    : 0;

  // Priority distribution
  const priorityStats = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  // Weekly task creation pattern
  const thisWeek = {
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  };
  
  const thisWeekTasks = tasks.filter(task => {
    const taskDate = parseISO(task.createdAt);
    return isWithinInterval(taskDate, thisWeek);
  });



  // Most common task types
  const taskTypes = Object.entries(analytics.userPatterns.commonTasks || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const getCompletionRateColor = (rate) => {
    if (rate >= 80) return '#22c55e';
    if (rate >= 60) return '#eab308';
    if (rate >= 40) return '#f97316';
    return '#ef4444';
  };

  const priorityColors = {
    urgent: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#22c55e'
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>
          <BarChart3 className="section-icon" />
          Analytics & Insights
        </h2>
        <button className="refresh-btn" onClick={onRefresh}>
          <RefreshCw className="btn-icon" />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Target className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>{analytics.totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <TrendingUp className="stat-icon" style={{ color: getCompletionRateColor(completionRate) }} />
          </div>
          <div className="stat-content">
            <h3 style={{ color: getCompletionRateColor(completionRate) }}>{completionRate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Clock className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>{analytics.pendingTasks}</h3>
            <p>Pending Tasks</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Calendar className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>{thisWeekTasks.length}</h3>
            <p>This Week</p>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="analytics-section">
        <h3>
          <Flag className="section-icon" />
          Priority Distribution
        </h3>
        <div className="priority-chart">
          {Object.entries(priorityStats).map(([priority, count]) => {
            const percentage = analytics.totalTasks > 0 ? (count / analytics.totalTasks) * 100 : 0;
            return (
              <div key={priority} className="priority-bar">
                <div className="priority-label">
                  <span className="priority-name">{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
                  <span className="priority-count">{count} tasks</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: priorityColors[priority]
                    }}
                  />
                </div>
                <span className="percentage">{Math.round(percentage)}%</span>
              </div>
            );
          })}
        </div>
      </div>



      {/* Common Task Types */}
      {taskTypes.length > 0 && (
        <div className="analytics-section">
          <h3>
            <TrendingUp className="section-icon" />
            Most Common Task Types
          </h3>
          <div className="task-types-list">
            {taskTypes.map(([type, count], index) => (
              <div key={type} className="task-type-item">
                <div className="type-rank">#{index + 1}</div>
                <div className="type-info">
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count} times</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="analytics-section">
        <h3>
          <Brain className="section-icon" />
          AI Insights
        </h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>🎯 Productivity Tip</h4>
            <p>
              {completionRate >= 80 
                ? "Excellent! You're completing most of your tasks. Consider taking on more challenging goals."
                : completionRate >= 60
                ? "Good progress! Try breaking down larger tasks into smaller, manageable pieces."
                : "Focus on completing existing tasks before adding new ones. Quality over quantity!"}
            </p>
          </div>
          
          <div className="insight-card">
            <h4>⚡ Priority Balance</h4>
            <p>
              {(priorityStats.urgent || 0) > (analytics.totalTasks * 0.3)
                ? "You have many urgent tasks. Consider better planning to reduce last-minute pressure."
                : (priorityStats.low || 0) > (analytics.totalTasks * 0.5)
                ? "Most tasks are low priority. Great for stress management!"
                : "Good priority balance. You're managing urgent and routine tasks well."}
            </p>
          </div>
          
          <div className="insight-card">
            <h4>📈 Weekly Trend</h4>
            <p>
              {thisWeekTasks.length > 5
                ? "Very active week! Make sure to balance productivity with rest."
                : thisWeekTasks.length > 2
                ? "Steady progress this week. Keep up the good work!"
                : "Light week. Consider adding some goals to stay motivated."}
            </p>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="analytics-section">
        <h3>💡 Optimization Tips</h3>
        <div className="tips-list">
          <div className="tip-item">
            <strong>Use Natural Language:</strong> The AI gets smarter when you describe tasks naturally ("Call mom tomorrow evening" vs "Call mom").
          </div>
          <div className="tip-item">
            <strong>Set Due Dates:</strong> Tasks with deadlines get better AI scoring and help with time management.
          </div>
          <div className="tip-item">
            <strong>Mark Tasks Complete:</strong> This helps the AI learn your completion patterns and improve recommendations.
          </div>
          <div className="tip-item">
            <strong>Use Voice Input:</strong> Try the voice feature for quick task entry, especially on mobile devices.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;