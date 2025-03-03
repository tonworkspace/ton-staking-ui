import React, { useEffect, useState, useMemo } from 'react';

interface SmoothNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  formatter?: (value: number) => string;
}

export const SmoothNumber: React.FC<SmoothNumberProps> = ({ 
  value, 
  duration = 800, 
  decimals = 2,
  formatter
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const startTime = performance.now();

    const updateValue = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Enhanced easing function for smoother animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        // Ensure we land exactly on the target value
        setDisplayValue(endValue);
      }
    };

    requestAnimationFrame(updateValue);
  }, [value, duration]);

  // Prevent unnecessary re-renders by memoizing the formatted value
  const formattedValue = useMemo(() => {
    return formatter ? formatter(displayValue) : displayValue.toFixed(decimals);
  }, [displayValue, formatter, decimals]);

  return <span>{formattedValue}</span>;
}; 