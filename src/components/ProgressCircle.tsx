interface ProgressCircleProps {
  percentage: number;
  size?: number;
}

export function ProgressCircle({ percentage, size = 200 }: ProgressCircleProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getGradientColor = () => {
    if (percentage < 33) return 'from-blue-500 to-purple-600';
    if (percentage < 66) return 'from-purple-600 to-purple-500';
    return 'from-purple-500 to-green-500';
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="text-blue-500" stopColor="currentColor" />
            <stop offset="50%" className="text-purple-600" stopColor="currentColor" />
            <stop offset="100%" className="text-green-500" stopColor="currentColor" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
