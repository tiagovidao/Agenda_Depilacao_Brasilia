import React from 'react';

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  size = 'medium', 
  color = 'purple',
  text = 'Carregando' 
}) => {
  const dotSize = {
    small: 'w-2 h-2',
    medium: 'w-3 h-3',
    large: 'w-4 h-4'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="flex space-x-2">
        <div className={`${dotSize} bg-${color}-600 rounded-full animate-bounce`} 
             style={{ animationDelay: '0ms' }}></div>
        <div className={`${dotSize} bg-${color}-600 rounded-full animate-bounce`} 
             style={{ animationDelay: '150ms' }}></div>
        <div className={`${dotSize} bg-${color}-600 rounded-full animate-bounce`} 
             style={{ animationDelay: '300ms' }}></div>
      </div>
      {text && (
        <p className={`mt-3 text-${color}-600 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingDots;