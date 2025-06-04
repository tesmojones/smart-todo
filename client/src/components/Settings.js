import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Bell, Save } from 'lucide-react';

const Settings = ({ user, onUpdateUser, onLogout }) => {
  const [settings, setSettings] = useState({
    profile: {
      whatsappNumber: user?.whatsappNumber || ''
    },
    notifications: {
      waNotifications: true,
      taskReminders: true
    }
  });

  // Load notification settings from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        setSettings(prev => ({
          ...prev,
          notifications: {
            waNotifications: parsedNotifications.waNotifications ?? true,
            taskReminders: parsedNotifications.taskReminders ?? true
          }
        }));
      } catch (error) {
        console.error('Error parsing notification settings:', error);
      }
    }
  }, []);

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
    setSaveMessage('');
    
    try {
      // Save profile changes
      const profileChanges = {};
      let hasProfileChanges = false;
      
      if (settings.profile.whatsappNumber !== user?.whatsappNumber) {
        profileChanges.whatsappNumber = settings.profile.whatsappNumber;
        hasProfileChanges = true;
      }
      
      if (hasProfileChanges) {
        await axios.put('/api/users/profile', profileChanges);
        
        // Update user object with new data
        if (onUpdateUser) {
          onUpdateUser({ ...user, ...profileChanges });
        }
      }
      
      // Save notification preferences (you can extend this to save to backend)
      localStorage.setItem('notificationSettings', JSON.stringify(settings.notifications));
      
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };



  const renderSettings = () => (
    <div className="modern-settings">
      {/* Profile Section */}
      <div className="settings-card">
        <div className="card-content">
          <div className="input-group">
            <label>WhatsApp Number</label>
            <input
              type="tel"
              value={settings.profile.whatsappNumber}
              onChange={(e) => handleSettingChange('profile', 'whatsappNumber', e.target.value)}
              placeholder="Enter your WhatsApp number"
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="settings-card">
        <div className="card-content">
          <div className="toggle-group">
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-title">WhatsApp Notifications</span>
                <span className="toggle-description">Receive task updates via WhatsApp</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.waNotifications}
                  onChange={(e) => handleSettingChange('notifications', 'waNotifications', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <span className="toggle-title">Task Reminders</span>
                <span className="toggle-description">Get reminders for upcoming deadlines</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications.taskReminders}
                  onChange={(e) => handleSettingChange('notifications', 'taskReminders', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modern-settings-container">
      {saveMessage && (
          <div className={`alert ${saveMessage.includes('Error') ? 'alert-error' : 'alert-success'}`}>
            {saveMessage}
          </div>
        )}

      <div className="settings-body">
        {renderSettings()}
        
        <div className="save-section">
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={isLoading}
          >
            <Save className="save-icon" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;