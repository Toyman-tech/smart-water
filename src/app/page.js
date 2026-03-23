'use client';

import React, { useState, useEffect } from 'react';
import LiquidFill from '../components/LiquidFill';
import MetricCard from '../components/MetricCard';
import SettingsCard from '../components/SettingsCard';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Activity, Clock, Droplets, Ruler } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState({
    status: {
      water_level_pct: 0,
      pump_active: false,
      last_pump_run: 'Never',
      raw_distance: 0
    },
    settings: {
      tank_height: 100,
      low_threshold: 80,
      high_threshold: 20
    }
  });

  useEffect(() => {
    // Listen to /status
    const statusRef = ref(db, 'status');
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(prev => ({ ...prev, status: snapshot.val() }));
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
    };
  }, []);

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
              <LiquidFill percentage={data.status.water_level_pct} />
            </div>
          </div>
        </section>

        {/* Metrics Side Panel */}
        <section className="col-side flex-col">
          <MetricCard 
            title="Pump Status" 
            value={data.status.pump_active ? 'ACTIVE' : 'IDLE'} 
            icon={<Activity size={28} className={data.status.pump_active ? 'pulse-anim' : ''} />} 
            highlight={data.status.pump_active}
          />
          <MetricCard 
            title="Last Pump Run" 
            value={data.status.last_pump_run} 
            icon={<Clock size={28} />} 
          />
          <MetricCard 
            title="Raw Distance" 
            value={parseFloat(data.status.raw_distance).toFixed(1)} 
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
      `}</style>
    </main>
  );
}
