'use client';

import React from 'react';

export default function LiquidFill({ percentage }) {
  // Map percentage to colors
  // Empty (0-20%): Red
  // Low (21-40%): Orange/Yellow
  // Normal (41-100%): Cyan/Blue
  
  let color1 = '#00e0ff';
  let color2 = '#0070f3';
  
  if (percentage <= 20) {
    color1 = '#ff4b4b';
    color2 = '#d71b3b';
  } else if (percentage <= 40) {
    color1 = '#ff9f43';
    color2 = '#ff4b4b';
  }

  // Calculate top offset for the wave. 
  // We want the wave to be slightly visible even at 0%, so we map 0% to a top offset of 80%.
  // 100% should completely cover the circle, so we map 100% to -20%.
  const SafePercentage = Math.min(Math.max(percentage || 0, 0), 100);
  const waveTop = 80 - SafePercentage;

  return (
    <div className="liquid-container">
      <div className="liquid-circle">
        <div 
          className="water" 
          style={{ 
            top: `${waveTop}%`, 
            background: color1 
          }}
        />
        <div 
          className="water water-bg" 
          style={{ 
            top: `${waveTop}%`, 
            background: color2 
          }}
        />
        <div className="percentage-text text-gradient">
          {percentage}%
        </div>
      </div>

      <style jsx>{`
        .liquid-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          min-width: 250px;
          min-height: 250px;
          width: 100%;
        }
        .liquid-circle {
          position: relative;
          width: 100%;
          min-width: 200px;
          max-width: 250px;
          aspect-ratio: 1;
          border-radius: 50%;
          background: rgba(13, 17, 23, 0.8);
          border: 4px solid var(--card-border);
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .water {
          position: absolute;
          width: 200%;
          height: 200%;
          left: -50%;
          border-radius: 40%;
          animation: wave 5s linear infinite;
          opacity: 0.8;
          transition: top 1s cubic-bezier(0.4, 0, 0.2, 1), background 1s ease;
        }
        .water-bg {
          animation: wave 7s linear infinite;
          opacity: 0.4;
        }
        .percentage-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3.5rem;
          font-weight: 800;
          z-index: 10;
          text-shadow: 0 4px 10px rgba(0,0,0,0.5);
        }

        @keyframes wave {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
