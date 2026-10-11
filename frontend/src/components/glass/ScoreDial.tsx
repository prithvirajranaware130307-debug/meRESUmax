import React from 'react';

interface ScoreDialProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorScheme?: 'blue' | 'cyan' | 'mint' | 'amber' | 'dynamic';
}

export const ScoreDial: React.FC<ScoreDialProps> = ({
  score,
  maxScore = 100,
  size = 140,
  strokeWidth = 10,
  label = 'Score',
  sublabel = '',
  colorScheme = 'dynamic',
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const progress = (normalizedScore / maxScore) * circumference;
  const strokeDashoffset = circumference - progress;

  let strokeColor = '#80AFFF';
  let glowColor = 'rgba(128, 175, 255, 0.4)';
  
  if (colorScheme === 'dynamic') {
    if (normalizedScore >= 80) {
      strokeColor = '#91F5CD'; // Mint
      glowColor = 'rgba(145, 245, 205, 0.4)';
    } else if (normalizedScore >= 60) {
      strokeColor = '#76E4F7'; // Cyan
      glowColor = 'rgba(118, 228, 247, 0.4)';
    } else if (normalizedScore >= 40) {
      strokeColor = '#FFD38A'; // Amber
      glowColor = 'rgba(255, 211, 138, 0.4)';
    } else {
      strokeColor = '#FFA2A2'; // Rose
      glowColor = 'rgba(255, 162, 162, 0.4)';
    }
  } else if (colorScheme === 'cyan') {
    strokeColor = '#76E4F7';
    glowColor = 'rgba(118, 228, 247, 0.4)';
  } else if (colorScheme === 'mint') {
    strokeColor = '#91F5CD';
    glowColor = 'rgba(145, 245, 205, 0.4)';
  } else if (colorScheme === 'amber') {
    strokeColor = '#FFD38A';
    glowColor = 'rgba(255, 211, 138, 0.4)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${glowColor})`,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
          {score}
        </span>
        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider -mt-0.5">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-text-muted mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
};
