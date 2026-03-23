'use client';

import React, { useState, useEffect, useRef } from 'react';
import LiquidFill from '../components/LiquidFill';
import MetricCard from '../components/MetricCard';
import SettingsCard from '../components/SettingsCard';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Activity, Clock, Droplets, Ruler } from 'lucide-react';

function formatTime(timeStr) {
  if (!timeStr || timeStr === 'Never') return 'Never';
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    const d = new Date();
    d.setHours(parseInt(parts[0], 10));
    d.setMinutes(parseInt(parts[1], 10));
    d.setSeconds(parts[2] ? parseInt(parts[2], 10) : 0);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  }
  return timeStr;
}

export default function Dashboard() {
  const [data, setData] = useState({
    status: null,
    settings: {
      tank_height: 100,
      low_threshold: 80,
      high_threshold: 20
    }
  });

  const [dynamicPumpActive, setDynamicPumpActive] = useState(false);
  const pumpTimeoutRef = useRef(null);
  const lastDataRef = useRef('');

  useEffect(() => {
    // Listen to /status
    const statusRef = ref(db, 'status');
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setData(prev => ({ ...prev, status: val }));

        // Detect if data is actively changing
        const currentDataString = JSON.stringify({
          raw_distance: val.raw_distance,
          water_level_pct: val.water_level_pct
        });
        
        if (lastDataRef.current && lastDataRef.current !== currentDataString) {
          setDynamicPumpActive(true);
          if (pumpTimeoutRef.current) clearTimeout(pumpTimeoutRef.current);
          pumpTimeoutRef.current = setTimeout(() => {
            setDynamicPumpActive(false);
          }, 3000); // Assume pump is inactive if no changes for 3s
        }
        lastDataRef.current = currentDataString;
      }
    });

    // Listen to /settings
    const settingsRef = ref(db, 'settings');
    const unsubscribeSettings = onValue(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(prev => ({ ...prev, settings: snapshot.val() }));
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeSettings();
      if (pumpTimeoutRef.current) clearTimeout(pumpTimeoutRef.current);
    };
  }, []);

  const isPumpActive = data.status?.pump_active || dynamicPumpActive;
  const lastPumpRunFormatted = formatTime(data.status?.last_pump_run);

  return (
    <main className="dashboard">
      <header className="header">
        <h1 className="text-gradient">Smart Water Monitor</h1>
        <p>Real-time system oversight and control</p>
      </header>

      <div className="layout-grid">
        {/* Main Visualization */}
        <section className="col-main">
          <div className="glass-panel text-center main-gauge-card">
            <h2>Current Water Level</h2>
            <div className="gauge-wrapper">
              {data.status ? (
                <LiquidFill percentage={data.status.water_level_pct || 0} />
              ) : (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Waiting for sensor data...</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Metrics Side Panel */}
        <section className="col-side flex-col">
          <MetricCard 
            title="Pump Status" 
            value={data.status ? (isPumpActive ? 'ACTIVE' : 'IDLE') : '--'} 
            icon={<Activity size={28} className={isPumpActive ? 'pulse-anim' : ''} />} 
            highlight={isPumpActive}
          />
          <MetricCard 
            title="Last Pump Run" 
            value={data.status ? lastPumpRunFormatted : '--'} 
            icon={<Clock size={28} />} 
          />
          <MetricCard 
            title="Raw Distance" 
            value={data.status && data.status.raw_distance !== undefined ? parseFloat(data.status.raw_distance).toFixed(1) : '--'} 
            unit="cm"
            icon={<Ruler size={28} />} 
          />
        </section>

        {/* Settings Area */}
        <section className="col-settings">
          <SettingsCard currentSettings={data.settings} />
        </section>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
          width: 100%;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 3rem;
        }
        .header p {
          color: var(--text-secondary);
          font-size: 1.2rem;
        }
        
        .layout-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }

        .col-main, .col-side, .col-settings {
           grid-column: span 1;
        }
        
        @media (min-width: 1024px) {
          .layout-grid {
            grid-template-columns: 2fr 1fr;
            grid-template-areas: 
              "main side"
              "settings settings";
          }
          .col-main { grid-area: main; grid-column: auto; }
          .col-side { grid-area: side; grid-column: auto; }
          .col-settings { grid-area: settings; grid-column: auto; }
        }

        .flex-col {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .main-gauge-card {
          height: 100%;
          min-height: 350px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .main-gauge-card h2 {
          color: var(--text-secondary);
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-size: 1rem;
        }
        .gauge-wrapper {
          padding: 20px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 250px;
          color: var(--text-secondary);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(0, 224, 255, 0.2);
          border-top-color: #00e0ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        :global(.pulse-anim) {
          animation: pulse 1.5s infinite;
          color: var(--accent-red);
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
