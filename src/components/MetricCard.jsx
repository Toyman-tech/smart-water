import React from 'react';

export default function MetricCard({ title, value, unit, icon, highlight }) {
  return (
    <div className={`glass-panel metric-card ${highlight ? 'highlight' : ''}`}>
      <div className="icon-container">
        {icon}
      </div>
      <div className="metric-info">
        <h3>{title}</h3>
        <div className="value-container">
          <span className="value text-gradient">{value}</span>
          {unit && <span className="unit">{unit}</span>}
        </div>
      </div>

      <style jsx>{`
        .metric-card {
          display: flex;
          align-items: center;
          gap: 20px;
          width: 100%;
          flex: 1;
        }
        .highlight {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 20px rgba(0, 224, 255, 0.2);
        }
        .icon-container {
          background: rgba(255, 255, 255, 0.05);
          padding: 15px;
          border-radius: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--accent-cyan);
        }
        .metric-info h3 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .value-container {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }
        .value {
          font-size: 1.8rem;
          font-weight: 700;
        }
        .unit {
          color: var(--text-secondary);
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
