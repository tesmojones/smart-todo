import React from 'react';
import { Kanban, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import './TabbedNavigation.css';

const TabbedNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'tasks',
      label: 'Tasks',
      icon: Kanban,
      title: 'Task Board - Manage your tasks'
    },
    {
      id: 'report',
      label: 'Reports',
      icon: BarChart3,
      title: 'Analytics & Reports - View your productivity insights'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      title: 'Settings - Configure your preferences'
    }
  ];

  return (
    <div className="tabbed-navigation">
      <div className="tab-list" role="tablist">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              title={tab.title}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`${tab.id}-panel`}
            >
              <IconComponent className="tab-icon" size={18} />
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TabbedNavigation;