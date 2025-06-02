import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Palette, Database, Shield, Info, LogOut } from 'lucide-react';

const Settings = ({ user, onUpdateUser, onLogout }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      timezone: 'UTC',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      weeklyReports: false,
    },
    appearance: {
      theme: 'light',
      language: 'en',
      dateFormat: 'MM/DD/YYYY',
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      publicProfile: false,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const settingSections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'about', label: 'About', icon: Info },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const renderProfileSettings = () => (
    <div className="settings-section">
      <h3>Profile Settings</h3>
      <div className="setting-group">
        <label className="setting-label">Name</label>
        <input
          type="text"
          className="setting-input"
          value={settings.profile.name}
          onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
          placeholder="Enter your name"
        />
      </div>
      <div className="setting-group">
        <label className="setting-label">Email</label>
        <input
          type="email"
          className="setting-input"
          value={settings.profile.email}
          onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      <div className="setting-group">
        <label className="setting-label">Timezone</label>
        <select
          className="setting-select"
          value={settings.profile.timezone}
          onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Settings</h3>
      <div className="setting-group">
        <div className="setting-toggle">
          <label className="setting-label">Email Notifications</label>
          <input
            type="checkbox"
            className="setting-checkbox"
            checked={settings.notifications.emailNotifications}
            onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
          />
        </div>
        <p className="setting-description">Receive email notifications for important updates</p>
      </div>
      <div className="setting-group">
        <div className="setting-toggle">
          <label className="setting-label">Push Notifications</label>
          <input
            type="checkbox"
            className="setting-checkbox"
            checked={settings.notifications.pushNotifications}
            onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
          />
        </div>
        <p className="setting-description">Receive browser push notifications</p>
      </div>
      <div className="setting-group">
        <div className="setting-toggle">
          <label className="setting-label">Task Reminders</label>
          <input
            type="checkbox"
            className="setting-checkbox"
            checked={settings.notifications.taskReminders}
            onChange={(e) => handleSettingChange('notifications', 'taskReminders', e.target.checked)}
          />
        </div>
        <p className="setting-description">Get reminded about upcoming due dates</p>
      </div>
      <div className="setting-group">
        <div className="setting-toggle">
          <label className="setting-label">Weekly Reports</label>
          <input
            type="checkbox"
            className="setting-checkbox"
            checked={settings.notifications.weeklyReports}
            onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
          />
        </div>
        <p className="setting-description">Receive weekly productivity reports</p>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h3>Appearance Settings</h3>
      <div className="setting-group">
        <label className="setting-label">Theme</label>
        <select
          className="setting-select"
          value={settings.appearance.theme}
          onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>
      <div className="setting-group">
        <label className="setting-label">Language</label>
        <select
          className="setting-select"
          value={settings.appearance.language}
          onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
      <div className="setting-group">
        <label className="setting-label">Date Format</label>
        <select
          className="setting-select"
          value={settings.appearance.dateFormat}
          onChange={(e) => handleSettingChange('appearance', 'dateFormat', e.target.value)}
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <h3>Privacy Settings</h3>
      <div className="setting-group">
        <div className="setting-toggle">
          <label className="setting-label">Data Sharing</label>
          <input
            type="checkbox"
            className="setting-checkbox"
            checked={settings.privacy.dataSharing}
            onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
          />
        </div>
        <p className="setting-description">Share anonymized data to improve the service</p>
      </div>
      <div className="setting-group">
        <div className="setting-toggle">
          <label className="setting-label">Analytics</label>
          <input
            type="checkbox"
            className="setting-checkbox"
            checked={settings.privacy.analytics}
            onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
          />
        </div>
        <p className="setting-description">Allow usage analytics for better experience</p>
      </div>
      <div className="setting-group">
        <div className="setting-toggle">
          <label className="setting-label">Public Profile</label>
          <input
            type="checkbox"
            className="setting-checkbox"
            checked={settings.privacy.publicProfile}
            onChange={(e) => handleSettingChange('privacy', 'publicProfile', e.target.checked)}
          />
        </div>
        <p className="setting-description">Make your profile visible to other users</p>
      </div>
    </div>
  );

  const renderAboutSettings = () => (
    <div className="settings-section">
      <h3>About</h3>
      <div className="about-content">
        <div className="about-item">
          <strong>Version:</strong> 1.0.0
        </div>
        <div className="about-item">
          <strong>Build:</strong> 2024.01.15
        </div>
        <div className="about-item">
          <strong>Developer:</strong> Tesmo Team
        </div>
        <div className="about-item">
          <strong>License:</strong> MIT
        </div>
        <div className="about-item">
          <strong>Support:</strong> support@tesmo.com
        </div>
        <div className="about-item">
          <strong>Documentation:</strong> 
          <a href="#" className="about-link">View Docs</a>
        </div>
        <div className="about-item">
          <strong>Privacy Policy:</strong> 
          <a href="#" className="about-link">Read Policy</a>
        </div>
      </div>
    </div>
  );

  const renderLogoutSettings = () => (
    <div className="settings-section">
      <h3>Account</h3>
      <div className="logout-content">
        <div className="user-info-section">
          {user && (
            <div className="current-user">
              <img src={user.picture} alt={user.name} className="user-avatar-large" />
              <div className="user-details">
                <h4>{user.name}</h4>
                <p>{user.email}</p>
              </div>
            </div>
          )}
        </div>
        <div className="logout-section">
          <p className="logout-description">
            Sign out of your account. You'll need to sign in again to access your tasks.
          </p>
          <button 
            className="logout-btn-settings"
            onClick={onLogout}
          >
            <LogOut className="logout-icon" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'about':
        return renderAboutSettings();
      case 'logout':
        return renderLogoutSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>
          <SettingsIcon className="settings-icon" />
          Settings
        </h2>
        {saveMessage && (
          <div className={`save-message ${saveMessage.includes('Error') ? 'error' : 'success'}`}>
            {saveMessage}
          </div>
        )}
      </div>

      <div className="settings-content">
        <div className="settings-sidebar">
          {settingSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                className={`settings-nav-btn ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <IconComponent className="settings-nav-icon" />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="settings-main">
          {renderActiveSection()}
          
          {activeSection !== 'about' && activeSection !== 'logout' && (
            <div className="settings-actions">
              <button 
                className="save-btn"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;