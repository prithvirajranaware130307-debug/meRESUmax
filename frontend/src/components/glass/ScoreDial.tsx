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
  strokeWidth = 8,
  label = 'Score',
  sublabel = '',
  colorScheme = 'dynamic',
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score, 0), maxScore);
  const progress = (normalizedScore / maxScore) * circumference;
  const strokeDashoffset = circumference - progress;

  let strokeColor = '#3B82F6';
  
  if (colorScheme === 'dynamic') {
    if (normalizedScore >= 80) {
      strokeColor = '#10B981'; // Emerald
    } else if (normalizedScore >= 60) {
      strokeColor = '#3B82F6'; // Cobalt
    } else if (normalizedScore >= 40) {
      strokeColor = '#F59E0B'; // Amber
    } else {
      strokeColor = '#EF4444'; // Crimson
    }
  } else if (colorScheme === 'cyan') {
    strokeColor = '#06B6D4';
  } else if (colorScheme === 'mint') {
    strokeColor = '#10B981';
  } else if (colorScheme === 'amber') {
    strokeColor = '#F59E0B';
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
            transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1), stroke 0.4s ease',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
          {score}
        </span>
        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest mt-0.5">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] text-text-muted mt-0.5 max-w-[85%] truncate">{sublabel}</span>
        )}
      </div>
    </div>
  );
};
