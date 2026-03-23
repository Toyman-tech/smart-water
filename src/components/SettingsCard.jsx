'use client';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, update } from 'firebase/database';

export default function SettingsCard({ currentSettings }) {
  const [settings, setSettings] = useState({
    height: 100,
    lowThreshold: 80,
    highThreshold: 20
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentSettings) {
      setSettings({
        height: currentSettings.tank_height || 100,
        lowThreshold: currentSettings.low_threshold || 80,
        highThreshold: currentSettings.high_threshold || 20
      });
    }
  }, [currentSettings]);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: parseInt(e.target.value) || 0
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsRef = ref(db, 'settings');
      await update(settingsRef, {
        tank_height: settings.height,
        low_threshold: settings.lowThreshold,
        high_threshold: settings.highThreshold
      });
      alert('Settings updated via Stream successfully!');
    } catch (error) {
      console.error('Error saving settings: ', error);
      alert('Failed to save settings. Please verify Firebase Config.');
    }
    setSaving(false);
  };

  return (
    <div className="glass-panel settings-card">
      <h2 className="text-gradient">System Configuration</h2>
      
      <div className="input-group">
        <label>Tank Height (cm)</label>
        <input 
          type="number" 
          name="height" 
          value={settings.height} 
          onChange={handleChange} 
        />
        <small>Distance from sensor to bottom of tank.</small>
      </div>
      
      <div className="input-group">
        <label>Low Threshold (cm)</label>
        <input 
          type="number" 
          name="lowThreshold" 
          value={settings.lowThreshold} 
          onChange={handleChange} 
        />
        <small>Distance to start the pump (e.g. 80cm = nearly empty).</small>
      </div>

      <div className="input-group">
        <label>High Threshold (cm)</label>
        <input 
          type="number" 
          name="highThreshold" 
          value={settings.highThreshold} 
          onChange={handleChange} 
        />
        <small>Distance to stop the pump (e.g. 20cm = nearly full).</small>
      </div>

      <button 
        className="btn-primary" 
        onClick={handleSave} 
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Configuration'}
      </button>

      <style jsx>{`
        .settings-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }
        h2 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 10px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        small {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
