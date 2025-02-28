import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const themeOptions = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 
  'night', 'coffee', 'winter'
];

const Settings = () => {
  const { user, updateUserSettings } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState('light');

  useEffect(() => {
    // Load user's saved theme or default to 'light'
    const theme = localStorage.getItem('theme') || 'light';
    setSelectedTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateUserSettings({ theme });
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Theme Selection */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Theme Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themeOptions.map((theme) => (
              <div
                key={theme}
                className={`card bg-base-100 cursor-pointer hover:shadow-xl transition-shadow
                  ${selectedTheme === theme ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleThemeChange(theme)}
              >
                <div className="card-body" data-theme={theme}>
                  <h3 className="card-title capitalize">{theme}</h3>
                  
                  {/* Theme Preview */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button className="btn btn-primary">Primary</button>
                      <button className="btn btn-secondary">Secondary</button>
                      <button className="btn btn-accent">Accent</button>
                    </div>
                    <div className="flex gap-2">
                      <div className="badge badge-primary">Primary</div>
                      <div className="badge badge-secondary">Secondary</div>
                      <div className="badge badge-accent">Accent</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <progress className="progress progress-primary" value="40" max="100" />
                      <progress className="progress progress-secondary" value="60" max="100" />
                      <progress className="progress progress-accent" value="80" max="100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Settings Sections */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">Chat Settings</h2>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Send messages on Enter</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show read receipts</span>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Show typing indicators</span>
              <input type="checkbox" className="toggle toggle-primary" defaultChecked />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;