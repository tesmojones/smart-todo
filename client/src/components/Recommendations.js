import React from 'react';
import { Sparkles, Plus, RefreshCw, Lightbulb, TrendingUp, Clock } from 'lucide-react';

const Recommendations = ({ recommendations, onAddTask, onRefresh }) => {
  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#22c55e'; // Green
    if (confidence >= 0.6) return '#eab308'; // Yellow
    return '#f97316'; // Orange
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const handleAddRecommendation = (recommendation) => {
    onAddTask(recommendation);
  };

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h2>
          <Sparkles className="section-icon" />
          AI Recommendations
        </h2>
        <button 
          className="refresh-btn"
          onClick={onRefresh}
          title="Refresh recommendations"
        >
          <RefreshCw className="btn-icon" />
          Refresh
        </button>
      </div>

      <div className="recommendations-intro">
        <div className="intro-card">
          <Lightbulb className="intro-icon" />
          <div className="intro-content">
            <h3>Personalized Suggestions</h3>
            <p>
              Based on your task patterns, time of day, and habits, our AI suggests 
              tasks you might want to add. These recommendations get smarter over time!
            </p>
          </div>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="empty-recommendations">
          <TrendingUp className="empty-icon" />
          <h3>No recommendations yet</h3>
          <p>
            Add more tasks to help our AI learn your patterns and provide 
            personalized suggestions.
          </p>
          <div className="tips">
            <h4>Tips to get better recommendations:</h4>
            <ul>
              <li>Add tasks regularly to establish patterns</li>
              <li>Use consistent naming for similar tasks</li>
              <li>Include time-based tasks (daily, weekly routines)</li>
              <li>Mark tasks as complete to show your preferences</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="recommendation-card">
              <div className="recommendation-header">
                <div className="recommendation-title">
                  <h3>{recommendation.title}</h3>
                  <div 
                    className="confidence-badge"
                    style={{ backgroundColor: getConfidenceColor(recommendation.confidence) }}
                  >
                    {Math.round(recommendation.confidence * 100)}%
                  </div>
                </div>
                
                <button
                  className="add-recommendation-btn"
                  onClick={() => handleAddRecommendation(recommendation)}
                  title="Add this task"
                >
                  <Plus className="btn-icon" />
                  Add
                </button>
              </div>
              
              <div className="recommendation-details">
                <div className="reason">
                  <Clock className="detail-icon" />
                  <span>{recommendation.reason}</span>
                </div>
                
                <div className="confidence-info">
                  <TrendingUp className="detail-icon" />
                  <span>{getConfidenceLabel(recommendation.confidence)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ai-insights">
        <h3>
          <Sparkles className="section-icon" />
          How AI Recommendations Work
        </h3>
        
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon-wrapper">
              <Clock className="insight-icon" />
            </div>
            <h4>Time Patterns</h4>
            <p>
              Analyzes when you typically add certain types of tasks and suggests 
              similar ones at optimal times.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon-wrapper">
              <TrendingUp className="insight-icon" />
            </div>
            <h4>Habit Recognition</h4>
            <p>
              Identifies recurring tasks and routines to proactively suggest 
              what you might need to do next.
            </p>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon-wrapper">
              <Lightbulb className="insight-icon" />
            </div>
            <h4>Context Awareness</h4>
            <p>
              Considers day of week, time of day, and your completion patterns 
              to make relevant suggestions.
            </p>
          </div>
        </div>
      </div>

      <div className="recommendation-tips">
        <h4>💡 Pro Tips</h4>
        <ul>
          <li><strong>Accept good suggestions:</strong> Adding recommended tasks helps the AI learn your preferences</li>
          <li><strong>Ignore irrelevant ones:</strong> The AI will learn from what you don't add too</li>
          <li><strong>Be consistent:</strong> Regular task patterns lead to better recommendations</li>
          <li><strong>Use natural language:</strong> The more context you provide, the smarter suggestions become</li>
        </ul>
      </div>
    </div>
  );
};

export default Recommendations;